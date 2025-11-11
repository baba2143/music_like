import { supabase } from '../config/supabase';
import { Track } from '../types/models';

/**
 * トラックサービス
 * 楽曲データの検索・管理を提供
 */

/**
 * トラックを作成または既存のものを取得
 * 外部IDが存在する場合は重複チェックを行う
 */
export async function createOrGetTrack(
  title: string,
  artist: string,
  options?: {
    album?: string;
    thumbnailUrl?: string;
    externalUrl?: string;
    service?: 'spotify' | 'apple_music' | 'youtube_music' | 'manual';
    externalId?: string;
  }
): Promise<{ data: Track | null; error: Error | null }> {
  try {
    // 外部IDがある場合は既存のトラックをチェック
    if (options?.externalId && options?.service) {
      const { data: existingTrack, error: searchError } = await supabase
        .from('tracks')
        .select('*')
        .eq('external_id', options.externalId)
        .eq('service', options.service)
        .single();

      if (existingTrack) {
        return {
          data: mapTrackFromDb(existingTrack),
          error: null,
        };
      }
    }

    // 新しいトラックを作成
    const { data, error } = await supabase
      .from('tracks')
      .insert({
        title,
        artist,
        album: options?.album,
        thumbnail_url: options?.thumbnailUrl,
        external_url: options?.externalUrl,
        service: options?.service || 'manual',
        external_id: options?.externalId,
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return {
      data: data ? mapTrackFromDb(data) : null,
      error: null,
    };
  } catch (error) {
    console.error('Error creating or getting track:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to create or get track'),
    };
  }
}

/**
 * トラックIDで取得
 */
export async function getTrack(
  trackId: string
): Promise<{ data: Track | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .eq('id', trackId)
      .single();

    if (error) {
      throw error;
    }

    return {
      data: data ? mapTrackFromDb(data) : null,
      error: null,
    };
  } catch (error) {
    console.error('Error getting track:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to get track'),
    };
  }
}

/**
 * トラックを検索（タイトルまたはアーティスト名で）
 */
export async function searchTracks(
  query: string,
  limit: number = 20
): Promise<{ data: Track[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .or(`title.ilike.%${query}%,artist.ilike.%${query}%`)
      .limit(limit);

    if (error) {
      throw error;
    }

    return {
      data: data ? data.map(mapTrackFromDb) : [],
      error: null,
    };
  } catch (error) {
    console.error('Error searching tracks:', error);
    return {
      data: [],
      error: error instanceof Error ? error : new Error('Failed to search tracks'),
    };
  }
}

/**
 * アーティスト名で検索
 */
export async function searchTracksByArtist(
  artist: string,
  limit: number = 20
): Promise<{ data: Track[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .ilike('artist', `%${artist}%`)
      .limit(limit);

    if (error) {
      throw error;
    }

    return {
      data: data ? data.map(mapTrackFromDb) : [],
      error: null,
    };
  } catch (error) {
    console.error('Error searching tracks by artist:', error);
    return {
      data: [],
      error: error instanceof Error ? error : new Error('Failed to search tracks by artist'),
    };
  }
}

/**
 * タイトルで検索
 */
export async function searchTracksByTitle(
  title: string,
  limit: number = 20
): Promise<{ data: Track[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .ilike('title', `%${title}%`)
      .limit(limit);

    if (error) {
      throw error;
    }

    return {
      data: data ? data.map(mapTrackFromDb) : [],
      error: null,
    };
  } catch (error) {
    console.error('Error searching tracks by title:', error);
    return {
      data: [],
      error: error instanceof Error ? error : new Error('Failed to search tracks by title'),
    };
  }
}

/**
 * 外部サービスIDでトラックを検索
 */
export async function getTrackByExternalId(
  externalId: string,
  service: 'spotify' | 'apple_music' | 'youtube_music'
): Promise<{ data: Track | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .eq('external_id', externalId)
      .eq('service', service)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error;
    }

    return {
      data: data ? mapTrackFromDb(data) : null,
      error: null,
    };
  } catch (error) {
    console.error('Error getting track by external ID:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to get track by external ID'),
    };
  }
}

/**
 * 最近追加されたトラックを取得
 */
export async function getRecentTracks(
  limit: number = 20
): Promise<{ data: Track[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return {
      data: data ? data.map(mapTrackFromDb) : [],
      error: null,
    };
  } catch (error) {
    console.error('Error getting recent tracks:', error);
    return {
      data: [],
      error: error instanceof Error ? error : new Error('Failed to get recent tracks'),
    };
  }
}

/**
 * 人気のトラックを取得（プレイリストに多く追加されているトラック）
 */
export async function getPopularTracks(
  limit: number = 20
): Promise<{ data: Track[]; error: Error | null }> {
  try {
    // プレイリストに追加されている回数が多いトラックを取得
    const { data, error } = await supabase
      .from('tracks')
      .select(`
        *,
        playlist_tracks(count)
      `)
      .order('playlist_tracks.count', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return {
      data: data ? data.map(mapTrackFromDb) : [],
      error: null,
    };
  } catch (error) {
    console.error('Error getting popular tracks:', error);
    return {
      data: [],
      error: error instanceof Error ? error : new Error('Failed to get popular tracks'),
    };
  }
}

/**
 * トラックを削除（どのプレイリストにも含まれていない場合のみ）
 */
export async function deleteTrack(
  trackId: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // プレイリストに含まれているかチェック
    const { data: playlistTracks, error: checkError } = await supabase
      .from('playlist_tracks')
      .select('id')
      .eq('track_id', trackId)
      .limit(1);

    if (checkError) {
      throw checkError;
    }

    if (playlistTracks && playlistTracks.length > 0) {
      return {
        success: false,
        error: new Error('Cannot delete track that is in playlists'),
      };
    }

    const { error } = await supabase
      .from('tracks')
      .delete()
      .eq('id', trackId);

    if (error) {
      throw error;
    }

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Error deleting track:', error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to delete track'),
    };
  }
}

/**
 * バッチでトラックを作成
 * 複数の曲を一度に追加する際に使用（重複チェックはしない）
 */
export async function createTracksBatch(
  tracks: Array<{
    title: string;
    artist: string;
    album?: string;
    thumbnailUrl?: string;
    externalUrl?: string;
    service?: 'spotify' | 'apple_music' | 'youtube_music' | 'manual';
    externalId?: string;
  }>
): Promise<{ data: Track[]; error: Error | null }> {
  try {
    const tracksToInsert = tracks.map((track) => ({
      title: track.title,
      artist: track.artist,
      album: track.album,
      thumbnail_url: track.thumbnailUrl,
      external_url: track.externalUrl,
      service: track.service || 'manual',
      external_id: track.externalId,
    }));

    const { data, error } = await supabase
      .from('tracks')
      .insert(tracksToInsert)
      .select('*');

    if (error) {
      throw error;
    }

    return {
      data: data ? data.map(mapTrackFromDb) : [],
      error: null,
    };
  } catch (error) {
    console.error('Error creating tracks batch:', error);
    return {
      data: [],
      error: error instanceof Error ? error : new Error('Failed to create tracks batch'),
    };
  }
}

// ====================================
// Helper functions
// ====================================

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
