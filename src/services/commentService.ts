import { supabase } from '../config/supabase';
import { Comment, User } from '../types/models';
import { createNotification } from './notificationService';

/**
 * コメントサービス
 * コメント関連のCRUD操作を提供
 */

export interface CreateCommentParams {
  postId: string;
  userId: string;
  content: string;
}

export interface CommentServiceResponse {
  data: Comment | null;
  error: Error | null;
}

export interface CommentsServiceResponse {
  data: Comment[];
  error: Error | null;
}

/**
 * コメントを作成
 */
export const createComment = async (
  params: CreateCommentParams
): Promise<CommentServiceResponse> => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: params.postId,
        user_id: params.userId,
        content: params.content,
      })
      .select(
        `
        *,
        users!comments_user_id_fkey (
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
      .single();

    if (error) {
      throw error;
    }

    const comment = mapDatabaseCommentToComment(data);

    // 投稿者を取得して通知を作成
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', params.postId)
      .single();

    if (!postError && post) {
      // 通知を作成（エラーは無視 - コメント自体は成功しているため）
      await createNotification({
        userId: post.user_id,
        type: 'comment',
        actorId: params.userId,
        postId: params.postId,
        commentId: comment.id,
      });
    }

    return { data: comment, error: null };
  } catch (error) {
    console.error('Failed to create comment:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * 投稿のコメントを取得
 */
export const getComments = async (
  postId: string,
  limit: number = 50
): Promise<CommentsServiceResponse> => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(
        `
        *,
        users!comments_user_id_fkey (
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
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      throw error;
    }

    const comments = data.map(mapDatabaseCommentToComment);

    return { data: comments, error: null };
  } catch (error) {
    console.error('Failed to get comments:', error);
    return { data: [], error: error as Error };
  }
};

/**
 * コメントを削除
 */
export const deleteComment = async (
  commentId: string,
  userId: string
): Promise<{ error: Error | null }> => {
  try {
    // 自分のコメントのみ削除可能
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('Failed to delete comment:', error);
    return { error: error as Error };
  }
};

/**
 * 投稿のコメント数を取得
 */
export const getCommentsCount = async (
  postId: string
): Promise<{ count: number; error: Error | null }> => {
  try {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (error) {
      throw error;
    }

    return { count: count || 0, error: null };
  } catch (error) {
    console.error('Failed to get comments count:', error);
    return { count: 0, error: error as Error };
  }
};

/**
 * ユーザーのコメントを取得
 */
export const getUserComments = async (
  userId: string,
  limit: number = 50
): Promise<CommentsServiceResponse> => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(
        `
        *,
        users!comments_user_id_fkey (
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

    const comments = data.map(mapDatabaseCommentToComment);

    return { data: comments, error: null };
  } catch (error) {
    console.error('Failed to get user comments:', error);
    return { data: [], error: error as Error };
  }
};

/**
 * データベースのコメントデータをCommentオブジェクトに変換
 */
function mapDatabaseCommentToComment(data: any): Comment {
  const author: User = {
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
    postId: data.post_id,
    userId: data.user_id,
    author,
    content: data.content,
    createdAt: new Date(data.created_at),
  };
}
