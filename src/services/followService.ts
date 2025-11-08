import { supabase } from '../config/supabase';
import { User } from '../types/models';

/**
 * フォローサービス
 * フォロー関連の操作を提供
 */

export interface FollowServiceResponse {
  data: User[];
  error: Error | null;
}

/**
 * ユーザーをフォロー
 */
export const followUser = async (
  followerId: string,
  followingId: string
): Promise<{ error: Error | null }> => {
  try {
    // 自分自身をフォローできないようにする
    if (followerId === followingId) {
      return { error: new Error('自分自身をフォローすることはできません') };
    }

    // 既にフォローしているかチェック
    const { data: existingFollow, error: checkError } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingFollow) {
      return { error: new Error('既にフォローしています') };
    }

    // フォロー追加
    const { error } = await supabase.from('follows').insert({
      follower_id: followerId,
      following_id: followingId,
    });

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('Failed to follow user:', error);
    return { error: error as Error };
  }
};

/**
 * ユーザーのフォローを解除
 */
export const unfollowUser = async (
  followerId: string,
  followingId: string
): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('Failed to unfollow user:', error);
    return { error: error as Error };
  }
};

/**
 * フォロー/アンフォローをトグル
 */
export const toggleFollow = async (
  followerId: string,
  followingId: string
): Promise<{ isFollowing: boolean; error: Error | null }> => {
  try {
    // 自分自身をフォローできないようにする
    if (followerId === followingId) {
      return { isFollowing: false, error: new Error('自分自身をフォローすることはできません') };
    }

    // 既にフォローしているかチェック
    const { data: existingFollow, error: checkError } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingFollow) {
      // アンフォロー
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

      if (error) {
        throw error;
      }

      return { isFollowing: false, error: null };
    } else {
      // フォロー
      const { error } = await supabase.from('follows').insert({
        follower_id: followerId,
        following_id: followingId,
      });

      if (error) {
        throw error;
      }

      return { isFollowing: true, error: null };
    }
  } catch (error) {
    console.error('Failed to toggle follow:', error);
    return { isFollowing: false, error: error as Error };
  }
};

/**
 * フォロワーリストを取得
 */
export const getFollowers = async (userId: string): Promise<FollowServiceResponse> => {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select(
        `
        follower_id,
        users!follows_follower_id_fkey (
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
      .eq('following_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const followers: User[] = data.map((item: any) => ({
      id: item.users.id,
      username: item.users.username,
      displayName: item.users.display_name,
      avatarUrl: item.users.avatar_url,
      bio: item.users.bio,
      oshiGroup: item.users.oshi_group,
      oshiMember: item.users.oshi_member,
      createdAt: new Date(item.users.created_at),
    }));

    return { data: followers, error: null };
  } catch (error) {
    console.error('Failed to get followers:', error);
    return { data: [], error: error as Error };
  }
};

/**
 * フォロー中のユーザーリストを取得
 */
export const getFollowing = async (userId: string): Promise<FollowServiceResponse> => {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select(
        `
        following_id,
        users!follows_following_id_fkey (
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
      .eq('follower_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const following: User[] = data.map((item: any) => ({
      id: item.users.id,
      username: item.users.username,
      displayName: item.users.display_name,
      avatarUrl: item.users.avatar_url,
      bio: item.users.bio,
      oshiGroup: item.users.oshi_group,
      oshiMember: item.users.oshi_member,
      createdAt: new Date(item.users.created_at),
    }));

    return { data: following, error: null };
  } catch (error) {
    console.error('Failed to get following:', error);
    return { data: [], error: error as Error };
  }
};

/**
 * フォロワー数を取得
 */
export const getFollowersCount = async (
  userId: string
): Promise<{ count: number; error: Error | null }> => {
  try {
    const { count, error } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    if (error) {
      throw error;
    }

    return { count: count || 0, error: null };
  } catch (error) {
    console.error('Failed to get followers count:', error);
    return { count: 0, error: error as Error };
  }
};

/**
 * フォロー中のユーザー数を取得
 */
export const getFollowingCount = async (
  userId: string
): Promise<{ count: number; error: Error | null }> => {
  try {
    const { count, error } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);

    if (error) {
      throw error;
    }

    return { count: count || 0, error: null };
  } catch (error) {
    console.error('Failed to get following count:', error);
    return { count: 0, error: error as Error };
  }
};

/**
 * 特定のユーザーをフォローしているかチェック
 */
export const checkIsFollowing = async (
  followerId: string,
  followingId: string
): Promise<{ isFollowing: boolean; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return { isFollowing: !!data, error: null };
  } catch (error) {
    console.error('Failed to check is following:', error);
    return { isFollowing: false, error: error as Error };
  }
};
