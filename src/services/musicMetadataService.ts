/**
 * 音楽メタデータ取得サービス
 * Spotify/Apple Music/YouTube Music のURLからメタデータを取得
 */

import { supabase } from '../config/supabase';

export interface MusicMetadata {
  title?: string;
  artist?: string;
  album?: string;
  thumbnailUrl?: string;
  trackCount?: number;
  service?: 'spotify' | 'apple_music' | 'youtube_music';
}

export interface MetadataResult {
  data: MusicMetadata | null;
  error: Error | null;
}

/**
 * URLから音楽サービスを判定
 */
export const detectMusicService = (
  url: string
): 'spotify' | 'apple_music' | 'youtube_music' | null => {
  if (!url) return null;

  if (url.includes('spotify.com')) return 'spotify';
  if (url.includes('music.apple.com')) return 'apple_music';
  if (url.includes('music.youtube.com')) return 'youtube_music';
  // YouTube通常URL・短縮URLもサポート
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube_music';

  return null;
};

/**
 * SpotifyのURLからプレイリストIDまたはトラックIDを抽出
 */
export const extractSpotifyId = (url: string): { type: 'playlist' | 'track'; id: string } | null => {
  // https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
  // https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp

  const playlistMatch = url.match(/spotify\.com\/playlist\/([a-zA-Z0-9]+)/);
  if (playlistMatch) {
    return { type: 'playlist', id: playlistMatch[1] };
  }

  const trackMatch = url.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/);
  if (trackMatch) {
    return { type: 'track', id: trackMatch[1] };
  }

  return null;
};

/**
 * URLからOGタグを取得（シンプル版）
 * 注: CORSの問題があるため、完全には動作しない可能性があります
 */
export const fetchOGMetadata = async (url: string): Promise<MetadataResult> => {
  try {
    // Web版でfetchを使用してHTMLを取得
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MusicLikeBot/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();

    // OGタグから情報を抽出（簡易版）
    const metadata: MusicMetadata = {};

    // og:title
    const titleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i);
    if (titleMatch) {
      metadata.title = titleMatch[1];
    }

    // og:image
    const imageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i);
    if (imageMatch) {
      metadata.thumbnailUrl = imageMatch[1];
    }

    // og:description からアーティスト情報を取得
    const descMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i);
    if (descMatch) {
      const description = descMatch[1];
      // Spotifyの場合: "Artist · Playlist · XX songs"
      const artistMatch = description.match(/^([^·]+)/);
      if (artistMatch) {
        metadata.artist = artistMatch[1].trim();
      }
    }

    metadata.service = detectMusicService(url) || undefined;

    return { data: metadata, error: null };
  } catch (error) {
    console.error('Failed to fetch OG metadata:', error);
    return {
      data: null,
      error: error as Error,
    };
  }
};

/**
 * プレイリスト/トラックのメタデータを取得
 * Supabase Edge Functionを経由してCORS問題を回避
 */
export const fetchMusicMetadata = async (url: string): Promise<MetadataResult> => {
  if (!url) {
    return { data: null, error: new Error('URL is required') };
  }

  // サービスを判定
  const service = detectMusicService(url);
  if (!service) {
    return { data: null, error: new Error('Unsupported music service') };
  }

  // Spotifyの場合は専用Edge Function
  if (service === 'spotify') {
    return await fetchSpotifyMetadata(url);
  }

  // YouTube/Apple Musicの場合は汎用Edge Function
  if (service === 'youtube_music' || service === 'apple_music') {
    return await fetchGeneralMusicMetadata(url);
  }

  // それ以外（ここには来ないはず）
  return {
    data: null,
    error: new Error('Unsupported service'),
  };
};

/**
 * Supabase Edge Functionを使用してSpotifyトラック情報を取得
 * Spotify Web APIを使用するため、アーティスト名、アルバム名などの詳細情報を取得可能
 */
export const fetchSpotifyMetadata = async (url: string): Promise<MetadataResult> => {
  try {
    console.log('=== Supabase Edge Function呼び出し (Spotify) ===');
    console.log('URL:', url);

    const { data, error } = await supabase.functions.invoke('get-spotify-track', {
      body: { url },
    });

    if (error) {
      console.error('Supabase Function error:', error);
      throw new Error(error.message || 'Failed to invoke function');
    }

    if (data.error) {
      console.error('Spotify API error:', data.error);
      throw new Error(data.error);
    }

    console.log('=== Spotify Web API レスポンス ===');
    console.log('Title:', data.data.title);
    console.log('Artist:', data.data.artist);
    console.log('Album:', data.data.album);
    console.log('Thumbnail:', data.data.thumbnailUrl);

    return {
      data: data.data,
      error: null,
    };
  } catch (error) {
    console.error('Failed to fetch Spotify metadata:', error);
    return {
      data: null,
      error: error as Error,
    };
  }
};

/**
 * Supabase Edge Functionを使用してYouTube/Apple Musicのメタデータを取得
 * OGタグをスクレイピングしてCORS問題を回避
 */
export const fetchGeneralMusicMetadata = async (url: string): Promise<MetadataResult> => {
  try {
    console.log('=== Supabase Edge Function呼び出し (YouTube/Apple Music) ===');
    console.log('URL:', url);

    const { data, error } = await supabase.functions.invoke('get-music-metadata', {
      body: { url },
    });

    if (error) {
      console.error('Supabase Function error:', error);
      throw new Error(error.message || 'Failed to invoke function');
    }

    if (data.error) {
      console.error('Music metadata error:', data.error);
      throw new Error(data.error);
    }

    console.log('=== 音楽メタデータ レスポンス ===');
    console.log('Title:', data.data.title);
    console.log('Artist:', data.data.artist);
    console.log('Thumbnail:', data.data.thumbnailUrl);

    return {
      data: data.data,
      error: null,
    };
  } catch (error) {
    console.error('Failed to fetch music metadata:', error);
    return {
      data: null,
      error: error as Error,
    };
  }
};
