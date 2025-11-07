import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Notification } from '../../types/models';
import { Colors, Typography, Spacing } from '../../config/theme';

interface NotificationCardProps {
  notification: Notification;
  onPress?: (notificationId: string) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress,
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress(notification.id);
    } else {
      Alert.alert('準備中', '通知詳細機能は準備中です');
    }
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

  const getNotificationText = () => {
    switch (notification.type) {
      case 'like':
        return 'があなたの投稿にいいねしました';
      case 'comment':
        return 'があなたの投稿にコメントしました';
      case 'follow':
        return 'があなたをフォローしました';
      case 'mention':
        return 'があなたをメンションしました';
      default:
        return '';
    }
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'follow':
        return '👤';
      case 'mention':
        return '@';
      default:
        return '🔔';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, !notification.isRead && styles.unreadContainer]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* 未読インジケーター */}
      {!notification.isRead && <View style={styles.unreadDot} />}

      {/* アバター */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {notification.actor.username.charAt(0).toUpperCase()}
        </Text>
      </View>

      {/* 通知内容 */}
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.username}>{notification.actor.username}</Text>
          <Text style={styles.message}>{getNotificationText()}</Text>
        </View>
        <Text style={styles.timestamp}>{getTimeAgo(notification.createdAt)}</Text>
      </View>

      {/* 通知タイプアイコン */}
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getNotificationIcon()}</Text>
      </View>
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  content: {
    flex: 1,
  },
  textContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.xs,
  },
  username: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
  message: {
    fontSize: Typography.fontSize.base,
    color: '#CCCCCC',
    marginLeft: 4,
  },
  timestamp: {
    fontSize: Typography.fontSize.xs,
    color: '#808080',
  },
  iconContainer: {
    marginLeft: Spacing.sm,
  },
  icon: {
    fontSize: 24,
  },
});
