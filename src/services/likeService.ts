import { supabase } from '../config/supabase';
import { Post } from '../types/models';

/**
 * いいねサービス
 * いいね関連の操作を提供
 */

/**
 * いいねを付ける/外す（トグル）
 */
export const toggleLike = async (
  postId: string,
  userId: string
): Promise<{ isLiked: boolean; error: Error | null }> => {
  try {
    // 既にいいねしているかチェック
    const { data: existingLike, error: checkError } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116は「レコードが見つからない」エラー
      throw checkError;
    }

    if (existingLike) {
      // いいね解除
      const { error } = await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', userId);

      if (error) {
        throw error;
      }

      return { isLiked: false, error: null };
    } else {
      // いいね追加
      const { error } = await supabase.from('likes').insert({
        post_id: postId,
        user_id: userId,
      });

      if (error) {
        throw error;
      }

      return { isLiked: true, error: null };
    }
  } catch (error) {
    console.error('Failed to toggle like:', error);
    return { isLiked: false, error: error as Error };
  }
};

/**
 * 投稿のいいね数を取得
 */
export const getLikesCount = async (postId: string): Promise<{ count: number; error: Error | null }> => {
  try {
    const { count, error } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (error) {
      throw error;
    }

    return { count: count || 0, error: null };
  } catch (error) {
    console.error('Failed to get likes count:', error);
    return { count: 0, error: error as Error };
  }
};

/**
 * ユーザーがいいねした投稿を取得
 */
export const getLikedPosts = async (
  userId: string,
  limit: number = 20
): Promise<{ data: string[]; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    const postIds = data.map((like) => like.post_id);

    return { data: postIds, error: null };
  } catch (error) {
    console.error('Failed to get liked posts:', error);
    return { data: [], error: error as Error };
  }
};

/**
 * ユーザーが特定の投稿をいいねしているかチェック
 */
export const checkIsLiked = async (
  postId: string,
  userId: string
): Promise<{ isLiked: boolean; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return { isLiked: !!data, error: null };
  } catch (error) {
    console.error('Failed to check is liked:', error);
    return { isLiked: false, error: error as Error };
  }
};
