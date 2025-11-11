/**
 * Supabase Edge Function: 汎用音楽メタデータ取得
 *
 * YouTube・Apple MusicのURLからメタデータ（曲名、アーティスト名、サムネイル）を取得
 * OGタグをスクレイピングしてCORS問題を回避
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// CORS設定
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * URLから音楽サービスを判定
 */
function detectService(url: string): 'youtube' | 'apple_music' | 'spotify' | null {
  if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('music.youtube.com')) {
    return 'youtube';
  }
  if (url.includes('music.apple.com')) {
    return 'apple_music';
  }
  if (url.includes('spotify.com')) {
    return 'spotify';
  }
  return null;
}

/**
 * YouTube URLからビデオIDを抽出
 */
function extractVideoId(url: string): string | null {
  // youtu.be短縮URL: https://youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) {
    return shortMatch[1];
  }

  // 通常URL: https://www.youtube.com/watch?v=VIDEO_ID
  // または: https://music.youtube.com/watch?v=VIDEO_ID
  const longMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (longMatch) {
    return longMatch[1];
  }

  return null;
}

/**
 * HTMLからOGタグを抽出
 */
function extractOGTags(html: string): Record<string, string> {
  const tags: Record<string, string> = {};

  // og:title (順序を逆にして content が先に来るパターンも試す)
  let titleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  if (!titleMatch) {
    titleMatch = html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:title["'][^>]*>/i);
  }
  if (titleMatch) tags.title = titleMatch[1];

  // og:image
  let imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  if (!imageMatch) {
    imageMatch = html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:image["'][^>]*>/i);
  }
  if (imageMatch) tags.image = imageMatch[1];

  // og:description
  let descMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  if (!descMatch) {
    descMatch = html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:description["'][^>]*>/i);
  }
  if (descMatch) tags.description = descMatch[1];

  // og:site_name
  let siteMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  if (!siteMatch) {
    siteMatch = html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:site_name["'][^>]*>/i);
  }
  if (siteMatch) tags.site_name = siteMatch[1];

  // name属性も試す（YouTubeは name="title" を使うことがある）
  if (!tags.title) {
    const nameTitleMatch = html.match(/<meta[^>]*name=["']title["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
                          html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']title["'][^>]*>/i);
    if (nameTitleMatch) tags.title = nameTitleMatch[1];
  }

  console.log('Extracted OG tags:', tags);

  return tags;
}

/**
 * HTMLエンティティをデコード
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x2F;/g, '/')
    .replace(/&#x27;/g, "'");
}

/**
 * YouTubeメタデータを取得（oEmbed API使用）
 */
async function getYoutubeMetadata(url: string) {
  // URLからビデオIDを抽出
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error('Invalid YouTube URL - could not extract video ID');
  }

  console.log('Extracted video ID:', videoId);

  // oEmbed APIを使用してメタデータを取得
  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  console.log('Fetching oEmbed URL:', oembedUrl);

  const response = await fetch(oembedUrl);

  if (!response.ok) {
    throw new Error(`YouTube oEmbed API failed: ${response.status}`);
  }

  const data = await response.json();
  console.log('oEmbed response:', data);

  // titleからアーティスト名を抽出する試み
  let title = data.title || '';
  let artist = data.author_name || '';

  // タイトルに " - " が含まれている場合（例: "Song Title - Artist Name"）
  // 最後の部分をアーティストとして使用
  if (title.includes(' - ')) {
    const parts = title.split(' - ');
    if (parts.length >= 2) {
      const possibleArtist = parts[parts.length - 1].trim();
      // チャンネル名と一致しない場合は、タイトルから抽出したアーティストを使用
      if (possibleArtist !== artist) {
        artist = possibleArtist;
        title = parts.slice(0, -1).join(' - ').trim();
      }
    }
  }

  console.log('Final result - Title:', title, 'Artist:', artist);

  return {
    title: title || '不明',
    artist: artist || '不明',
    album: undefined,
    thumbnailUrl: data.thumbnail_url || undefined,
    service: 'youtube_music' as const,
  };
}

/**
 * Apple Musicメタデータを取得
 */
async function getAppleMusicMetadata(url: string) {
  console.log('Fetching Apple Music URL:', url);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7',
    },
  });

  if (!response.ok) {
    throw new Error(`Apple Music fetch failed: ${response.status}`);
  }

  const html = await response.text();
  const ogTags = extractOGTags(html);

  console.log('Apple Music OG Tags:', ogTags);

  // HTMLエンティティをデコード
  let title = decodeHtmlEntities(ogTags.title || '');
  let artist = '';

  console.log('Decoded title:', title);
  console.log('Title character codes:', Array.from(title).map(c => `${c}:U+${c.charCodeAt(0).toString(16).toUpperCase()}`).join(' '));

  // Apple Musicのタイトル形式: "{アーティスト名}の"{曲名}"をApple Musicで"
  // 対応する引用符: " 「 " " ' '
  const titlePatterns = [
    /^(.+?)の[\"「""''](.+?)[\"」""'']をApple Musicで$/,
    /^(.+?)の[\"「""''](.+?)[\"」""''] - /,
    /^(.+?) - (.+?)$/,  // "Artist - Song" パターン
  ];

  let matched = false;
  for (let i = 0; i < titlePatterns.length; i++) {
    const pattern = titlePatterns[i];
    console.log(`Trying pattern ${i + 1}:`, pattern);
    const match = title.match(pattern);
    if (match) {
      artist = match[1].trim();
      title = match[2].trim();
      matched = true;
      console.log('✓ Matched title pattern:', { artist, title });
      break;
    } else {
      console.log('✗ Pattern did not match');
    }
  }

  // フォールバック: 「の」で分割
  if (!matched && title.includes('の')) {
    console.log('Trying fallback: splitting by "の"');
    const parts = title.split('の');
    if (parts.length >= 2) {
      artist = parts[0].trim();
      // 2番目の部分から引用符と「をApple Musicで」を削除
      let songPart = parts.slice(1).join('の').trim();
      songPart = songPart.replace(/^[\"「""'']/, '').replace(/[\"」""''].*$/, '');
      title = songPart;
      matched = true;
      console.log('✓ Matched fallback pattern:', { artist, title });
    }
  }

  // パターンマッチしなかった場合、og:descriptionからアーティストを抽出
  if (!matched && ogTags.description) {
    const description = decodeHtmlEntities(ogTags.description);
    console.log('Description:', description);

    // "Listen to {song} by {artist} on Apple Music"
    const descPatterns = [
      /Listen to .+ by (.+?) on Apple Music/i,
      /by (.+?)\s+on Apple Music/i,
      /by (.+?)(?:\.|・|$)/i,
    ];

    for (const pattern of descPatterns) {
      const match = description.match(pattern);
      if (match) {
        artist = match[1].trim();
        console.log('Matched description pattern:', { artist });
        break;
      }
    }
  }

  // タイトルから余分な文字列を削除
  title = title
    .replace(/をApple Musicで$/i, '')
    .replace(/ - (Single|EP|Album)$/i, '')
    .trim();

  console.log('Final result - Title:', title, 'Artist:', artist);

  return {
    title: title || '不明',
    artist: artist || '不明',
    album: undefined,
    thumbnailUrl: ogTags.image || undefined,
    service: 'apple_music' as const,
  };
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // リクエストボディを取得
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // サービスを判定
    const service = detectService(url);

    if (!service) {
      return new Response(
        JSON.stringify({ error: 'Unsupported service' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Spotifyの場合はエラー（専用のEdge Functionを使用すべき）
    if (service === 'spotify') {
      return new Response(
        JSON.stringify({ error: 'Use get-spotify-track function for Spotify URLs' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // メタデータを取得
    let metadata;
    if (service === 'youtube') {
      metadata = await getYoutubeMetadata(url);
    } else if (service === 'apple_music') {
      metadata = await getAppleMusicMetadata(url);
    }

    return new Response(
      JSON.stringify({ data: metadata, error: null }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
