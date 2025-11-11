import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NotificationCard } from '../../components/notification/NotificationCard';
import { Notification } from '../../types/models';
import { Colors, Spacing, Typography } from '../../config/theme';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationsStackParamList } from '../../navigation/RootNavigator';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../../services/notificationService';

type NotificationScreenNavigationProp = NativeStackNavigationProp<NotificationsStackParamList>;

export const NotificationScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<NotificationScreenNavigationProp>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isInitialMount = useRef(true);

  // 通知を取得
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const [notificationsResult, unreadResult] = await Promise.all([
        getNotifications(user.id, 50),
        getUnreadCount(user.id),
      ]);

      if (notificationsResult.error) {
        console.error('通知取得エラー:', notificationsResult.error);
        setError('通知の取得に失敗しました');
        return;
      }

      if (notificationsResult.data) {
        setNotifications(notificationsResult.data);
      }

      setUnreadCount(unreadResult.count);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('予期しないエラーが発生しました');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // 初回ロード
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // 画面にフォーカスが戻ったときに通知一覧を再取得
  useFocusEffect(
    useCallback(() => {
      // 初回マウント時はスキップ（useEffectで処理済み）
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }

      // 2回目以降のフォーカス時のみ再取得
      fetchNotifications();
    }, [fetchNotifications])
  );

  // リフレッシュ
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
  }, [fetchNotifications]);

  // フィルタリングされた通知
  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((notif) => !notif.isRead)
      : notifications;

  const handleNotificationPress = async (notificationId: string) => {
    if (!user) return;

    // 通知を見つける
    const notification = notifications.find((n) => n.id === notificationId);
    if (!notification) return;

    // 楽観的UIアップデート
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    // API呼び出し
    const { error } = await markAsRead(notificationId, user.id);
    if (error) {
      console.error('既読マークエラー:', error);
      // エラー時はロールバック
      await fetchNotifications();
    }

    // 通知タイプに応じて遷移
    switch (notification.type) {
      case 'like':
      case 'comment':
      case 'mention':
        // 投稿詳細画面へ遷移
        if (notification.postId) {
          navigation.navigate('PostDetail', { postId: notification.postId });
        }
        break;
      case 'follow':
        // フォローしたユーザーのプロフィール画面へ遷移
        navigation.navigate('UserProfile', { userId: notification.actorId });
        break;
      default:
        break;
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;

    // 楽観的UIアップデート
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) => ({ ...notif, isRead: true }))
    );
    setUnreadCount(0);

    // API呼び出し
    const { error } = await markAllAsRead(user.id);
    if (error) {
      console.error('すべて既読エラー:', error);
      // エラー時はロールバック
      await fetchNotifications();
    }
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      {error ? (
        <>
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchNotifications}
            activeOpacity={0.7}
          >
            <Text style={styles.retryButtonText}>再試行</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyText}>通知はありません</Text>
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
