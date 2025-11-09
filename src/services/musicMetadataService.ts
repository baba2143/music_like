/**
 * 音楽メタデータ取得サービス
 * Spotify/Apple Music/YouTube Music のURLからメタデータを取得
 */

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
 * まず簡易版として、URLパターンからサービスを判定し、
 * 可能であればOGタグを取得
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

  // OGタグを取得（CORSエラーの可能性あり）
  const result = await fetchOGMetadata(url);

  // エラーの場合は、最低限の情報を返す
  if (result.error) {
    return {
      data: {
        service,
      },
      error: result.error,
    };
  }

  return result;
};

/**
 * Spotify Embed APIを使用してプレビューを取得（代替案）
 * oembed APIは認証不要で使用可能
 */
export const fetchSpotifyOEmbed = async (url: string): Promise<MetadataResult> => {
  try {
    const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`;
    const response = await fetch(oembedUrl);

    if (!response.ok) {
      throw new Error(`Spotify oEmbed API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      data: {
        title: data.title,
        thumbnailUrl: data.thumbnail_url,
        service: 'spotify',
      },
      error: null,
    };
  } catch (error) {
    console.error('Failed to fetch Spotify oEmbed:', error);
    return {
      data: null,
      error: error as Error,
    };
  }
};
