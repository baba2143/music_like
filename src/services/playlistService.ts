import { supabase } from '../config/supabase';
import { Playlist, PlaylistTrack, Track } from '../types/models';

/**
 * プレイリストサービス
 * アプリ内プレイリストのCRUD操作を提供
 */

/**
 * プレイリストを作成
 */
export async function createPlaylist(
  userId: string,
  title: string,
  description?: string,
  isPublic: boolean = true
): Promise<{ data: Playlist | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('playlists')
      .insert({
        user_id: userId,
        title,
        description,
        is_public: isPublic,
        tracks_count: 0,
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return {
      data: data ? mapPlaylistFromDb(data) : null,
      error: null,
    };
  } catch (error) {
    console.error('Error creating playlist:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to create playlist'),
    };
  }
}

/**
 * プレイリストを取得（トラック情報含む）
 */
export async function getPlaylist(
  playlistId: string,
  currentUserId?: string
): Promise<{ data: Playlist | null; error: Error | null }> {
  try {
    // プレイリスト基本情報を取得
    const { data: playlistData, error: playlistError } = await supabase
      .from('playlists')
      .select(`
        *,
        user:users(*)
      `)
      .eq('id', playlistId)
      .single();

    if (playlistError) {
      throw playlistError;
    }

    // プレイリスト内の曲を取得
    const { data: tracksData, error: tracksError } = await supabase
      .from('playlist_tracks')
      .select(`
        *,
        track:tracks(*),
        added_by:users(*)
      `)
      .eq('playlist_id', playlistId)
      .order('position', { ascending: true });

    if (tracksError) {
      throw tracksError;
    }

    const playlist = mapPlaylistFromDb(playlistData);
    playlist.tracks = tracksData ? tracksData.map(mapPlaylistTrackFromDb) : [];

    return {
      data: playlist,
      error: null,
    };
  } catch (error) {
    console.error('Error getting playlist:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to get playlist'),
    };
  }
}

/**
 * プレイリストを更新
 */
export async function updatePlaylist(
  playlistId: string,
  userId: string,
  updates: {
    title?: string;
    description?: string;
    coverImageUrl?: string;
    isPublic?: boolean;
  }
): Promise<{ data: Playlist | null; error: Error | null }> {
  try {
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.coverImageUrl !== undefined) dbUpdates.cover_image_url = updates.coverImageUrl;
    if (updates.isPublic !== undefined) dbUpdates.is_public = updates.isPublic;

    const { data, error } = await supabase
      .from('playlists')
      .update(dbUpdates)
      .eq('id', playlistId)
      .eq('user_id', userId) // 所有者のみ更新可能
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return {
      data: data ? mapPlaylistFromDb(data) : null,
      error: null,
    };
  } catch (error) {
    console.error('Error updating playlist:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to update playlist'),
    };
  }
}

/**
 * プレイリストを削除
 */
export async function deletePlaylist(
  playlistId: string,
  userId: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', playlistId)
      .eq('user_id', userId); // 所有者のみ削除可能

    if (error) {
      throw error;
    }

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Error deleting playlist:', error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to delete playlist'),
    };
  }
}

/**
 * ユーザーのプレイリスト一覧を取得
 */
export async function getUserPlaylists(
  userId: string,
  currentUserId?: string
): Promise<{ data: Playlist[]; error: Error | null }> {
  try {
    let query = supabase
      .from('playlists')
      .select(`
        *,
        user:users(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // 自分以外のプレイリストを見る場合は公開のみ
    if (currentUserId !== userId) {
      query = query.eq('is_public', true);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return {
      data: data ? data.map(mapPlaylistFromDb) : [],
      error: null,
    };
  } catch (error) {
    console.error('Error getting user playlists:', error);
    return {
      data: [],
      error: error instanceof Error ? error : new Error('Failed to get user playlists'),
    };
  }
}

/**
 * 公開プレイリスト一覧を取得
 */
export async function getPublicPlaylists(
  limit: number = 20
): Promise<{ data: Playlist[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('playlists')
      .select(`
        *,
        user:users(*)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return {
      data: data ? data.map(mapPlaylistFromDb) : [],
      error: null,
    };
  } catch (error) {
    console.error('Error getting public playlists:', error);
    return {
      data: [],
      error: error instanceof Error ? error : new Error('Failed to get public playlists'),
    };
  }
}

/**
 * プレイリストに曲を追加
 */
export async function addTrackToPlaylist(
  playlistId: string,
  trackId: string,
  userId: string,
  position?: number
): Promise<{ data: PlaylistTrack | null; error: Error | null }> {
  try {
    // プレイリストの所有者確認とカバー画像URLを取得
    const { data: playlist, error: playlistError } = await supabase
      .from('playlists')
      .select('user_id, tracks_count, cover_image_url')
      .eq('id', playlistId)
      .single();

    if (playlistError) {
      throw playlistError;
    }

    if (!playlist) {
      throw new Error('Playlist not found');
    }

    // positionが指定されていない場合は最後に追加
    const finalPosition = position !== undefined ? position : playlist.tracks_count;

    const { data, error } = await supabase
      .from('playlist_tracks')
      .insert({
        playlist_id: playlistId,
        track_id: trackId,
        position: finalPosition,
        added_by_user_id: userId,
      })
      .select(`
        *,
        track:tracks(*),
        added_by:users(*)
      `)
      .single();

    if (error) {
      throw error;
    }

    // 1曲目でカバー画像が未設定の場合、自動的に曲のサムネイルを設定
    if (
      data &&
      playlist.tracks_count === 0 &&
      !playlist.cover_image_url &&
      data.track?.thumbnail_url
    ) {
      await supabase
        .from('playlists')
        .update({ cover_image_url: data.track.thumbnail_url })
        .eq('id', playlistId)
        .eq('user_id', userId);

      console.log('プレイリストのカバー画像を自動設定:', data.track.thumbnail_url);
    }

    return {
      data: data ? mapPlaylistTrackFromDb(data) : null,
      error: null,
    };
  } catch (error) {
    console.error('Error adding track to playlist:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to add track to playlist'),
    };
  }
}

/**
 * プレイリストから曲を削除
 */
export async function removeTrackFromPlaylist(
  playlistId: string,
  playlistTrackId: string,
  userId: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // プレイリストの所有者確認
    const { data: playlist, error: playlistError } = await supabase
      .from('playlists')
      .select('user_id')
      .eq('id', playlistId)
      .single();

    if (playlistError) {
      throw playlistError;
    }

    if (!playlist) {
      throw new Error('Playlist not found');
    }

    if (playlist.user_id !== userId) {
      throw new Error('Not authorized to remove tracks from this playlist');
    }

    const { error } = await supabase
      .from('playlist_tracks')
      .delete()
      .eq('id', playlistTrackId)
      .eq('playlist_id', playlistId);

    if (error) {
      throw error;
    }

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Error removing track from playlist:', error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to remove track from playlist'),
    };
  }
}

/**
 * プレイリスト内の曲の順序を変更
 */
export async function reorderPlaylistTracks(
  playlistId: string,
  userId: string,
  trackUpdates: Array<{ id: string; position: number }>
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // プレイリストの所有者確認
    const { data: playlist, error: playlistError } = await supabase
      .from('playlists')
      .select('user_id')
      .eq('id', playlistId)
      .single();

    if (playlistError) {
      throw playlistError;
    }

    if (!playlist) {
      throw new Error('Playlist not found');
    }

    if (playlist.user_id !== userId) {
      throw new Error('Not authorized to reorder tracks in this playlist');
    }

    // 各トラックの位置を更新
    for (const update of trackUpdates) {
      const { error } = await supabase
        .from('playlist_tracks')
        .update({ position: update.position })
        .eq('id', update.id)
        .eq('playlist_id', playlistId);

      if (error) {
        throw error;
      }
    }

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Error reordering playlist tracks:', error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to reorder playlist tracks'),
    };
  }
}

// ====================================
// Helper functions
// ====================================

function mapPlaylistFromDb(data: any): Playlist {
  return {
    id: data.id,
    userId: data.user_id,
    user: data.user,
    title: data.title,
    description: data.description,
    coverImageUrl: data.cover_image_url,
    isPublic: data.is_public,
    tracksCount: data.tracks_count,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

function mapPlaylistTrackFromDb(data: any): PlaylistTrack {
  return {
    id: data.id,
    playlistId: data.playlist_id,
    trackId: data.track_id,
    track: data.track ? mapTrackFromDb(data.track) : undefined,
    position: data.position,
    addedByUserId: data.added_by_user_id,
    addedBy: data.added_by,
    createdAt: new Date(data.created_at),
  };
}

function mapTrackFromDb(data: any): Track {
  return {
    id: data.id,
    title: data.title,
    artist: data.artist,
    album: data.album,
    thumbnailUrl: data.thumbnail_url,
    externalUrl: data.external_url,
    service: data.service,
    externalId: data.external_id,
    createdAt: new Date(data.created_at),
  };
}
