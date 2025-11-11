import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MessageBubble } from '../../components/message/MessageBubble';
import { Message, User } from '../../types/models';
import { Colors, Spacing, Typography } from '../../config/theme';
import { useAuth } from '../../contexts/AuthContext';
import { MessagesStackParamList } from '../../navigation/RootNavigator';
import {
  getMessages,
  sendMessage,
  markConversationAsRead,
  subscribeToMessages,
  unsubscribeFromMessages,
} from '../../services/messageService';
import { getOrCreateConversation } from '../../services/conversationService';
import { RealtimeChannel } from '@supabase/supabase-js';

type ChatScreenRouteProp = RouteProp<MessagesStackParamList, 'Chat'>;
type ChatScreenNavigationProp = NativeStackNavigationProp<MessagesStackParamList>;

export const ChatScreen: React.FC = () => {
  const { user } = useAuth();
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const { conversationId: initialConversationId, otherUser } = route.params;

  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId || null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // 会話IDを取得または作成
  const ensureConversation = useCallback(async () => {
    if (!user || conversationId) return conversationId;

    try {
      const { data, error: convError } = await getOrCreateConversation(user.id, otherUser.id);

      if (convError) {
        console.error('会話作成エラー:', convError);
        setError('会話の作成に失敗しました');
        return null;
      }

      if (data) {
        setConversationId(data.id);
        return data.id;
      }
    } catch (err) {
      console.error('Failed to ensure conversation:', err);
      setError('予期しないエラーが発生しました');
    }

    return null;
  }, [user, otherUser, conversationId]);

  // メッセージ一覧を取得
  const fetchMessages = useCallback(async (convId: string) => {
    if (!user) return;

    try {
      setError(null);
      const { data, error: messagesError } = await getMessages(convId, 100);

      if (messagesError) {
        console.error('メッセージ取得エラー:', messagesError);
        setError('メッセージの取得に失敗しました');
        return;
      }

      if (data) {
        setMessages(data);
        // メッセージを既読にする
        await markConversationAsRead(convId, user.id);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError('予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 初回ロード
  useEffect(() => {
    const initialize = async () => {
      const convId = await ensureConversation();
      if (convId) {
        await fetchMessages(convId);
      } else {
        setLoading(false);
      }
    };

    initialize();
  }, [ensureConversation, fetchMessages]);

  // リアルタイム購読
  useEffect(() => {
    if (!conversationId || !user) return;

    const handleMessageReceived = (message: Message) => {
      setMessages((prev) => [...prev, message]);
      // 相手からのメッセージを自動で既読にする
      if (message.senderId !== user.id) {
        markConversationAsRead(conversationId, user.id);
      }
      // 新しいメッセージを表示するためにスクロール
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    };

    const handleMessageUpdated = (message: Message) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? message : m))
      );
    };

    const handleMessageDeleted = (messageId: string) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    };

    // 購読開始
    const channel = subscribeToMessages(
      conversationId,
      handleMessageReceived,
      handleMessageUpdated,
      handleMessageDeleted
    );

    channelRef.current = channel;

    // クリーンアップ
    return () => {
      if (channelRef.current) {
        unsubscribeFromMessages(channelRef.current);
      }
    };
  }, [conversationId, user]);

  // メッセージ送信
  const handleSend = useCallback(async () => {
    if (!user || !conversationId || !inputText.trim() || sending) return;

    const messageContent = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const { data, error: sendError } = await sendMessage(
        conversationId,
        user.id,
        messageContent
      );

      if (sendError) {
        console.error('メッセージ送信エラー:', sendError);
        setInputText(messageContent); // 失敗したら復元
        return;
      }

      // リアルタイム購読で自動的に追加されるため、ここでは追加不要
    } catch (err) {
      console.error('Failed to send message:', err);
      setInputText(messageContent);
    } finally {
      setSending(false);
    }
  }, [user, conversationId, inputText, sending]);

  // ユーザーが未ログインの場合
  if (!user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>ログインが必要です</Text>
      </View>
    );
  }

  // エラー表示
  if (error && !conversationId) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            ensureConversation();
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.retryButtonText}>再試行</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerUserInfo}>
          <Text style={styles.headerUsername}>
            {otherUser.displayName || otherUser.username}
          </Text>
          {otherUser.oshiGroup && (
            <Text style={styles.headerOshi}>{otherUser.oshiGroup}</Text>
          )}
        </View>
      </View>

      {/* メッセージ一覧 */}
      {loading ? (
        <View style={[styles.messageContainer, styles.centerContent]}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item }) => (
            <MessageBubble message={item} isOwnMessage={item.senderId === user.id} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>メッセージを送信してみましょう</Text>
            </View>
          }
        />
      )}

      {/* 入力エリア */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="メッセージを入力..."
          placeholderTextColor="#666666"
          multiline={true}
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || sending}
          activeOpacity={0.7}
        >
          <Text style={styles.sendButtonText}>{sending ? '...' : '送信'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  backButton: {
    marginRight: Spacing.md,
  },
  backButtonText: {
    fontSize: 28,
    color: Colors.white,
  },
  headerUserInfo: {
    flex: 1,
  },
  headerUsername: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
  headerOshi: {
    fontSize: Typography.fontSize.sm,
    color: '#808080',
    marginTop: 2,
  },
  messageContainer: {
    flex: 1,
  },
  messageList: {
    paddingVertical: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.huge,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: '#808080',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    backgroundColor: '#000000',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.base,
    color: Colors.white,
    marginRight: Spacing.sm,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    minHeight: 40,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#666666',
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
  errorText: {
    fontSize: Typography.fontSize.base,
    color: '#808080',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  retryButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  retryButtonText: {
    fontSize: Typography.fontSize.base,
    color: Colors.white,
    fontWeight: Typography.fontWeight.semiBold,
  },
});
