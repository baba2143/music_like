import { supabase } from '../config/supabase';
import { Post, CreatePostInput, FeedResponse, User } from '../types/models';

/**
 * 投稿サービス
 * 投稿関連のCRUD操作とフィード取得を提供
 */

export interface CreatePostParams extends CreatePostInput {
  userId: string;
}

export interface UpdatePostParams {
  caption?: string;
  hashtags?: string[];
}

export interface PostServiceResponse<T = Post> {
  data: T | null;
  error: Error | null;
}

export interface PostsServiceResponse {
  data: Post[];
  error: Error | null;
}

/**
 * 投稿を作成
 */
export const createPost = async (
  params: CreatePostParams
): Promise<PostServiceResponse<Post>> => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: params.userId,
        content_type: params.contentType,
        caption: params.caption || null,
        hashtags: params.hashtags || [],
        // プレイリスト関連フィールド
        playlist_url: params.playlistUrl || null,
        playlist_title: params.playlistTitle || null,
        playlist_thumbnail: params.playlistThumbnail || null,
        playlist_track_count: params.playlistTrackCount || null,
        playlist_service: params.playlistService || null,
        // トラック関連フィールド
        track_title: params.trackTitle || null,
        track_artist: params.trackArtist || null,
        track_album: params.trackAlbum || null,
        track_thumbnail: params.trackThumbnail || null,
        track_url: params.trackUrl || null,
      })
      .select(
        `
        *,
        users!posts_user_id_fkey (
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

    // データ変換
    const post = mapDatabasePostToPost(data, params.userId);

    return { data: post, error: null };
  } catch (error) {
    console.error('Failed to create post:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * 投稿を取得（ID指定）
 */
export const getPost = async (
  postId: string,
  currentUserId?: string
): Promise<PostServiceResponse<Post>> => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(
        `
        *,
        users!posts_user_id_fkey (
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
      .eq('id', postId)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return { data: null, error: new Error('Post not found') };
    }

    // いいね状態と保存状態を取得
    let isLiked = false;
    let isSaved = false;

    if (currentUserId) {
      const [likeResult, saveResult] = await Promise.all([
        supabase.from('likes').select('id').eq('post_id', postId).eq('user_id', currentUserId).maybeSingle(),
        supabase.from('saves').select('id').eq('post_id', postId).eq('user_id', currentUserId).maybeSingle(),
      ]);

      isLiked = !!likeResult.data;
      isSaved = !!saveResult.data;
    }

    const post = mapDatabasePostToPost(data, currentUserId, isLiked, isSaved);

    return { data: post, error: null };
  } catch (error) {
    console.error('Failed to get post:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * 投稿を更新
 */
export const updatePost = async (
  postId: string,
  updates: UpdatePostParams
): Promise<PostServiceResponse<Post>> => {
  try {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.caption !== undefined) updateData.caption = updates.caption;
    if (updates.hashtags !== undefined) updateData.hashtags = updates.hashtags;

    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', postId)
      .select(
        `
        *,
        users!posts_user_id_fkey (
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

    const post = mapDatabasePostToPost(data);

    return { data: post, error: null };
  } catch (error) {
    console.error('Failed to update post:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * 投稿を削除
 */
export const deletePost = async (postId: string): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.from('posts').delete().eq('id', postId);

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('Failed to delete post:', error);
    return { error: error as Error };
  }
};

/**
 * フィード投稿を取得（ページネーション対応）
 */
export const getFeedPosts = async (
  currentUserId?: string,
  limit: number = 20,
  cursor?: string
): Promise<{ data: FeedResponse | null; error: Error | null }> => {
  try {
    let query = supabase
      .from('posts')
      .select(
        `
        *,
        users!posts_user_id_fkey (
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
      .order('created_at', { ascending: false })
      .limit(limit + 1);

    // カーソルベースのページネーション
    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // limit+1件取得して、hasMoreを判定
    const hasMore = data.length > limit;
    const posts = data.slice(0, limit);
    const nextCursor = hasMore && posts.length > 0 ? posts[posts.length - 1].created_at : undefined;

    // いいね状態と保存状態を一括取得
    const mappedPosts = await Promise.all(
      posts.map(async (post) => {
        let isLiked = false;
        let isSaved = false;

        if (currentUserId) {
          const [likeResult, saveResult] = await Promise.all([
            supabase
              .from('likes')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', currentUserId)
              .maybeSingle(),
            supabase
              .from('saves')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', currentUserId)
              .maybeSingle(),
          ]);

          isLiked = !!likeResult.data;
          isSaved = !!saveResult.data;
        }

        return mapDatabasePostToPost(post, currentUserId, isLiked, isSaved);
      })
    );

    const feedResponse: FeedResponse = {
      posts: mappedPosts,
      nextCursor,
      hasMore,
    };

    return { data: feedResponse, error: null };
  } catch (error) {
    console.error('Failed to get feed posts:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * ユーザーの投稿を取得
 */
export const getUserPosts = async (
  userId: string,
  currentUserId?: string,
  limit: number = 20
): Promise<PostsServiceResponse> => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(
        `
        *,
        users!posts_user_id_fkey (
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

    // いいね状態と保存状態を一括取得
    const mappedPosts = await Promise.all(
      data.map(async (post) => {
        let isLiked = false;
        let isSaved = false;

        if (currentUserId) {
          const [likeResult, saveResult] = await Promise.all([
            supabase
              .from('likes')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', currentUserId)
              .maybeSingle(),
            supabase
              .from('saves')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', currentUserId)
              .maybeSingle(),
          ]);

          isLiked = !!likeResult.data;
          isSaved = !!saveResult.data;
        }

        return mapDatabasePostToPost(post, currentUserId, isLiked, isSaved);
      })
    );

    return { data: mappedPosts, error: null };
  } catch (error) {
    console.error('Failed to get user posts:', error);
    return { data: [], error: error as Error };
  }
};

/**
 * 投稿にいいね/いいね解除
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
      .maybeSingle();

    if (checkError) {
      throw checkError;
    }

    if (existingLike) {
      // いいね解除
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return { isLiked: false, error: null };
    } else {
      // いいね
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
 * 投稿を保存/保存解除
 */
export const toggleSave = async (
  postId: string,
  userId: string
): Promise<{ isSaved: boolean; error: Error | null }> => {
  try {
    // 既に保存されているかチェック
    const { data: existingSave, error: checkError } = await supabase
      .from('saves')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      throw checkError;
    }

    if (existingSave) {
      // 保存解除
      const { error } = await supabase
        .from('saves')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return { isSaved: false, error: null };
    } else {
      // 保存
      const { error } = await supabase.from('saves').insert({
        post_id: postId,
        user_id: userId,
      });

      if (error) {
        throw error;
      }

      return { isSaved: true, error: null };
    }
  } catch (error) {
    console.error('Failed to toggle save:', error);
    return { isSaved: false, error: error as Error };
  }
};

/**
 * 保存済み投稿を取得
 */
export const getSavedPosts = async (
  userId: string,
  currentUserId?: string,
  limit: number = 20
): Promise<PostsServiceResponse> => {
  try {
    const { data, error } = await supabase
      .from('saves')
      .select(
        `
        created_at,
        posts!inner (
          *,
          users!posts_user_id_fkey (
            id,
            username,
            display_name,
            avatar_url,
            bio,
            oshi_group,
            oshi_member,
            created_at
          )
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    // いいね状態と保存状態を一括取得
    const mappedPosts = await Promise.all(
      data.map(async (save: any) => {
        const post = save.posts;
        let isLiked = false;
        let isSaved = false;

        if (currentUserId) {
          const [likeResult, saveResult] = await Promise.all([
            supabase
              .from('likes')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', currentUserId)
              .maybeSingle(),
            supabase
              .from('saves')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', currentUserId)
              .maybeSingle(),
          ]);

          isLiked = !!likeResult.data;
          isSaved = !!saveResult.data;
        }

        return mapDatabasePostToPost(post, currentUserId, isLiked, isSaved);
      })
    );

    return { data: mappedPosts, error: null };
  } catch (error) {
    console.error('Failed to get saved posts:', error);
    return { data: [], error: error as Error };
  }
};

/**
 * データベースの投稿データをPostオブジェクトに変換
 */
function mapDatabasePostToPost(
  data: any,
  currentUserId?: string,
  isLiked: boolean = false,
  isSaved: boolean = false
): Post {
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
    userId: data.user_id,
    author,
    contentType: data.content_type,
    caption: data.caption,
    hashtags: data.hashtags || [],
    playlistUrl: data.playlist_url,
    playlistTitle: data.playlist_title,
    playlistThumbnail: data.playlist_thumbnail,
    playlistTrackCount: data.playlist_track_count,
    playlistService: data.playlist_service,
    trackTitle: data.track_title,
    trackArtist: data.track_artist,
    trackAlbum: data.track_album,
    trackThumbnail: data.track_thumbnail,
    trackUrl: data.track_url,
    likesCount: data.likes_count || 0,
    commentsCount: data.comments_count || 0,
    savesCount: data.saves_count || 0,
    isLiked,
    isSaved,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}
