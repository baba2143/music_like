/**
 * Supabase Edge Function: Spotify Track情報取得
 *
 * Spotify Web APIを使用してトラック情報（曲名、アーティスト名、アルバム、サムネイル）を取得
 * Client Credentials Flowで認証
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// CORS設定
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Spotify APIのアクセストークンを取得（Client Credentials Flow）
 */
async function getSpotifyAccessToken(
  clientId: string,
  clientSecret: string
): Promise<string> {
  const authString = btoa(`${clientId}:${clientSecret}`);

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`Spotify auth failed: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Spotify URLまたはIDからTrack IDを抽出
 */
function extractTrackId(urlOrId: string): string | null {
  // URLの場合: https://open.spotify.com/track/5oQpH1uuZte4axR411rIlN
  const urlMatch = urlOrId.match(/track\/([a-zA-Z0-9]+)/);
  if (urlMatch) {
    return urlMatch[1];
  }

  // IDの場合（22文字の英数字）
  if (/^[a-zA-Z0-9]{22}$/.test(urlOrId)) {
    return urlOrId;
  }

  return null;
}

/**
 * Spotify Track情報を取得
 */
async function getTrackInfo(trackId: string, accessToken: string) {
  const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.status}`);
  }

  const data = await response.json();

  return {
    title: data.name,
    artist: data.artists[0]?.name || '',
    album: data.album?.name || '',
    thumbnailUrl: data.album?.images?.[0]?.url || '',
    service: 'spotify' as const,
  };
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 環境変数から認証情報を取得
    const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
    const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ error: 'Spotify credentials not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

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

    // Track IDを抽出
    const trackId = extractTrackId(url);
    if (!trackId) {
      return new Response(
        JSON.stringify({ error: 'Invalid Spotify URL or ID' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Spotify APIにアクセス
    const accessToken = await getSpotifyAccessToken(clientId, clientSecret);
    const trackInfo = await getTrackInfo(trackId, accessToken);

    return new Response(
      JSON.stringify({ data: trackInfo, error: null }),
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
