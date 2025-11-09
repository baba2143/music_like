import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Conversation, User } from '../../types/models';
import { Colors, Typography, Spacing } from '../../config/theme';

interface ConversationCardProps {
  conversation: Conversation;
  currentUserId: string;
  onPress: (conversationId: string, otherUser: User) => void;
}

export const ConversationCard: React.FC<ConversationCardProps> = ({
  conversation,
  currentUserId,
  onPress,
}) => {
  // 相手のユーザーを特定
  const otherUser =
    conversation.participant1.id === currentUserId
      ? conversation.participant2
      : conversation.participant1;

  const handlePress = () => {
    onPress(conversation.id, otherUser);
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return `${diff}秒前`;
    if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}日前`;
    return `${Math.floor(diff / 604800)}週間前`;
  };

  const hasUnread = conversation.unreadCount && conversation.unreadCount > 0;
  const isMyMessage = conversation.lastMessage?.senderId === currentUserId;

  return (
    <TouchableOpacity
      style={[styles.container, hasUnread ? styles.unreadContainer : null]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* 未読インジケーター */}
      {hasUnread && <View style={styles.unreadDot} />}

      {/* アバター */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {otherUser.username.charAt(0).toUpperCase()}
        </Text>
      </View>

      {/* 会話内容 */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.username} numberOfLines={1}>
            {otherUser.displayName || otherUser.username}
          </Text>
          {conversation.lastMessageAt && (
            <Text style={styles.timestamp}>
              {getTimeAgo(conversation.lastMessageAt)}
            </Text>
          )}
        </View>

        {/* 最後のメッセージプレビュー */}
        {conversation.lastMessage ? (
          <View style={styles.messagePreview}>
            {isMyMessage && <Text style={styles.youLabel}>あなた: </Text>}
            <Text
              style={[styles.messageText, hasUnread ? styles.unreadMessageText : null]}
              numberOfLines={1}
            >
              {conversation.lastMessage.content}
            </Text>
          </View>
        ) : (
          <Text style={styles.messageText}>メッセージを送信</Text>
        )}
      </View>

      {/* 未読バッジ */}
      {hasUnread && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadCount}>
            {conversation.unreadCount! > 99 ? '99+' : conversation.unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
    position: 'relative',
  },
  unreadContainer: {
    backgroundColor: '#0A0A0A',
  },
  unreadDot: {
    position: 'absolute',
    left: Spacing.xs,
    top: '50%',
    marginTop: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  username: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
    flex: 1,
  },
  timestamp: {
    fontSize: Typography.fontSize.xs,
    color: '#808080',
    marginLeft: Spacing.sm,
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  youLabel: {
    fontSize: Typography.fontSize.sm,
    color: '#808080',
  },
  messageText: {
    fontSize: Typography.fontSize.sm,
    color: '#808080',
    flex: 1,
  },
  unreadMessageText: {
    fontWeight: Typography.fontWeight.semiBold,
    color: '#CCCCCC',
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  unreadCount: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
});
