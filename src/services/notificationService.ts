import { supabase } from '../config/supabase';
import { Notification, User } from '../types/models';

/**
 * 通知サービス
 * 通知の取得、作成、既読管理を提供
 */

export interface CreateNotificationParams {
  userId: string; // 通知を受け取るユーザー
  type: 'like' | 'comment' | 'follow' | 'mention';
  actorId: string; // 通知を発生させたユーザー
  postId?: string;
  commentId?: string;
}

export interface NotificationServiceResponse {
  data: Notification[] | null;
  error: Error | null;
}

export interface UnreadCountResponse {
  count: number;
  error: Error | null;
}

/**
 * ユーザーの通知一覧を取得
 */
export const getNotifications = async (
  userId: string,
  limit: number = 50
): Promise<NotificationServiceResponse> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select(
        `
        *,
        users!notifications_actor_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          bio,
          oshi_group,
          oshi_member,
          created_at
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    const notifications = data.map(mapDatabaseNotificationToNotification);

    return { data: notifications, error: null };
  } catch (error) {
    console.error('Failed to get notifications:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * 未読通知の数を取得
 */
export const getUnreadCount = async (
  userId: string
): Promise<UnreadCountResponse> => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      throw error;
    }

    return { count: count || 0, error: null };
  } catch (error) {
    console.error('Failed to get unread count:', error);
    return { count: 0, error: error as Error };
  }
};

/**
 * 通知を既読にする
 */
export const markAsRead = async (
  notificationId: string,
  userId: string
): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return { error: error as Error };
  }
};

/**
 * すべての通知を既読にする
 */
export const markAllAsRead = async (
  userId: string
): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('Failed to mark all as read:', error);
    return { error: error as Error };
  }
};

/**
 * 通知を削除する
 */
export const deleteNotification = async (
  notificationId: string,
  userId: string
): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('Failed to delete notification:', error);
    return { error: error as Error };
  }
};

/**
 * 通知を作成する（内部使用）
 */
export const createNotification = async (
  params: CreateNotificationParams
): Promise<{ error: Error | null }> => {
  try {
    // 自分自身への通知は作成しない
    if (params.userId === params.actorId) {
      return { error: null };
    }

    const { error } = await supabase.from('notifications').insert({
      user_id: params.userId,
      type: params.type,
      actor_id: params.actorId,
      post_id: params.postId,
      comment_id: params.commentId,
      is_read: false,
    });

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('Failed to create notification:', error);
    return { error: error as Error };
  }
};

/**
 * データベースの通知データをNotificationオブジェクトに変換
 */
function mapDatabaseNotificationToNotification(data: any): Notification {
  const actor: User = {
    id: data.users.id,
    username: data.users.username,
    displayName: data.users.display_name,
    avatarUrl: data.users.avatar_url,
    bio: data.users.bio,
    oshiGroup: data.users.oshi_group,
    oshiMember: data.users.oshi_member,
    createdAt: new Date(data.users.created_at),
  };

  return {
    id: data.id,
    userId: data.user_id,
    type: data.type,
    actorId: data.actor_id,
    actor,
    postId: data.post_id,
    commentId: data.comment_id,
    isRead: data.is_read,
    createdAt: new Date(data.created_at),
  };
}
