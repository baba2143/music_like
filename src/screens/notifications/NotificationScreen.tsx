import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { NotificationCard } from '../../components/notification/NotificationCard';
import { Notification, User } from '../../types/models';
import { Colors, Spacing, Typography } from '../../config/theme';

// ダミーユーザーデータ
const DUMMY_USERS: User[] = [
  {
    id: 'user1',
    username: 'musiclover',
    displayName: '音楽太郎',
    createdAt: new Date(),
  },
  {
    id: 'user2',
    username: 'jazzfan',
    displayName: 'ジャズ好き',
    createdAt: new Date(),
  },
  {
    id: 'user3',
    username: 'rockstar',
    displayName: 'ロック魂',
    createdAt: new Date(),
  },
  {
    id: 'user4',
    username: 'popqueen',
    displayName: 'ポップス女王',
    createdAt: new Date(),
  },
  {
    id: 'user5',
    username: 'classicfan',
    displayName: 'クラシック愛好家',
    createdAt: new Date(),
  },
];

// ダミー通知データ
const DUMMY_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif1',
    userId: 'currentUser',
    type: 'like',
    actorId: 'user1',
    actor: DUMMY_USERS[0],
    postId: 'post1',
    isRead: false,
    createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10分前
  },
  {
    id: 'notif2',
    userId: 'currentUser',
    type: 'comment',
    actorId: 'user2',
    actor: DUMMY_USERS[1],
    postId: 'post1',
    commentId: 'comment1',
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30分前
  },
  {
    id: 'notif3',
    userId: 'currentUser',
    type: 'follow',
    actorId: 'user3',
    actor: DUMMY_USERS[2],
    isRead: false,
    createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1時間前
  },
  {
    id: 'notif4',
    userId: 'currentUser',
    type: 'like',
    actorId: 'user4',
    actor: DUMMY_USERS[3],
    postId: 'post2',
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3時間前
  },
  {
    id: 'notif5',
    userId: 'currentUser',
    type: 'comment',
    actorId: 'user5',
    actor: DUMMY_USERS[4],
    postId: 'post2',
    commentId: 'comment2',
    isRead: true,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6時間前
  },
  {
    id: 'notif6',
    userId: 'currentUser',
    type: 'follow',
    actorId: 'user1',
    actor: DUMMY_USERS[0],
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1日前
  },
  {
    id: 'notif7',
    userId: 'currentUser',
    type: 'like',
    actorId: 'user2',
    actor: DUMMY_USERS[1],
    postId: 'post3',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2日前
  },
  {
    id: 'notif8',
    userId: 'currentUser',
    type: 'mention',
    actorId: 'user3',
    actor: DUMMY_USERS[2],
    postId: 'post4',
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3日前
  },
];

export const NotificationScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(DUMMY_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // フィルタリングされた通知
  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((notif) => !notif.isRead)
      : notifications;

  const handleNotificationPress = (notificationId: string) => {
    // 通知を既読にする
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) => ({ ...notif, isRead: true }))
    );
  };

  const unreadCount = notifications.filter((notif) => !notif.isRead).length;

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔔</Text>
      <Text style={styles.emptyText}>通知はありません</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>通知</Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllReadButton}
            onPress={handleMarkAllRead}
            activeOpacity={0.7}
          >
            <Text style={styles.markAllReadText}>すべて既読</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* フィルタータブ */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            すべて
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'unread' && styles.filterButtonActive]}
          onPress={() => setFilter('unread')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, filter === 'unread' && styles.filterTextActive]}>
            未読 {unreadCount > 0 && `(${unreadCount})`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 通知一覧 */}
      <FlatList
        data={filteredNotifications}
        renderItem={({ item }) => (
          <NotificationCard notification={item} onPress={handleNotificationPress} />
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
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
  markAllReadButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  markAllReadText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.primary,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  filterButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginRight: Spacing.sm,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: '#808080',
  },
  filterTextActive: {
    color: Colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.huge,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: '#808080',
  },
});
