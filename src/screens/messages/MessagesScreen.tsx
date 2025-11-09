import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ConversationCard } from '../../components/message/ConversationCard';
import { Conversation, User } from '../../types/models';
import { Colors, Spacing, Typography } from '../../config/theme';
import { useAuth } from '../../contexts/AuthContext';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { getConversations } from '../../services/conversationService';
import { getUnreadCount } from '../../services/messageService';

type MessagesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const MessagesScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<MessagesScreenNavigationProp>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 会話一覧を取得
  const fetchConversations = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const { data, error: conversationsError } = await getConversations(user.id);

      if (conversationsError) {
        console.error('会話取得エラー:', conversationsError);
        setError('会話の取得に失敗しました');
        return;
      }

      if (data) {
        // 各会話の未読数を取得
        const conversationsWithUnread = await Promise.all(
          data.map(async (conv) => {
            const { count } = await getUnreadCount(conv.id, user.id);
            return { ...conv, unreadCount: count };
          })
        );

        setConversations(conversationsWithUnread);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
      setError('予期しないエラーが発生しました');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // 初回ロード
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // リフレッシュ
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchConversations();
  }, [fetchConversations]);

  // 会話をタップした時
  const handleConversationPress = useCallback(
    (conversationId: string, otherUser: User) => {
      // @ts-ignore - 親のStack Navigatorに遷移
      navigation.getParent()?.navigate('Chat', { conversationId, otherUser });
    },
    [navigation]
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      {error ? (
        <>
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchConversations}
            activeOpacity={0.7}
          >
            <Text style={styles.retryButtonText}>再試行</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyText}>メッセージはありません</Text>
          <Text style={styles.emptySubtext}>
            プロフィールからユーザーをタップしてメッセージを送ってみましょう
          </Text>
        </>
      )}
    </View>
  );

  // ユーザーが未ログインの場合
  if (!user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.emptyText}>ログインが必要です</Text>
      </View>
    );
  }

  // ローディング中
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>メッセージ</Text>
      </View>

      {/* 会話一覧 */}
      <FlatList
        data={conversations}
        renderItem={({ item }) => (
          <ConversationCard
            conversation={item}
            currentUserId={user.id}
            onPress={handleConversationPress}
          />
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.huge,
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: '#808080',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    color: '#666666',
    textAlign: 'center',
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
