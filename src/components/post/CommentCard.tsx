import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Comment } from '../../types/models';
import { Colors, Typography, Spacing } from '../../config/theme';

interface CommentCardProps {
  comment: Comment;
}

export const CommentCard: React.FC<CommentCardProps> = ({ comment }) => {
  const handleLike = () => {
    Alert.alert('準備中', 'コメントのいいね機能は準備中です');
  };

  const handleReply = () => {
    Alert.alert('準備中', '返信機能は準備中です');
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return `${diff}秒前`;
    if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
    return `${Math.floor(diff / 86400)}日前`;
  };

  return (
    <View style={styles.container}>
      {/* アバター */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {comment.author.username.charAt(0).toUpperCase()}
        </Text>
      </View>

      {/* コンテンツ */}
      <View style={styles.content}>
        {/* ユーザー名と投稿時間 */}
        <View style={styles.header}>
          <Text style={styles.username}>{comment.author.username}</Text>
          <Text style={styles.timestamp}>{getTimeAgo(comment.createdAt)}</Text>
        </View>

        {/* コメント本文 */}
        <Text style={styles.commentText}>{comment.content}</Text>

        {/* アクションボタン */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleLike} activeOpacity={0.7}>
            <Text style={styles.actionText}>いいね</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleReply} activeOpacity={0.7}>
            <Text style={styles.actionText}>返信</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  username: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
    marginRight: Spacing.sm,
  },
  timestamp: {
    fontSize: Typography.fontSize.xs,
    color: '#808080',
  },
  commentText: {
    fontSize: Typography.fontSize.base,
    color: Colors.white,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  actionText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: '#808080',
  },
});
