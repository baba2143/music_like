import { supabase } from '../config/supabase';
import { Artist } from '../types/models';

/**
 * アーティスト名を正規化（重複防止用）
 * - 小文字に変換
 * - 前後の空白を削除
 * - 全角英数字を半角に変換
 * - 連続する空白を1つに統一
 */
export const normalizeArtistName = (name: string): string => {
  return name
    .trim() // 前後の空白削除
    .toLowerCase() // 小文字化
    .replace(/[\u3000\s]+/g, ' ') // 全角スペース含む連続空白を1つの半角スペースに
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (char) => {
      // 全角英数字を半角に変換
      return String.fromCharCode(char.charCodeAt(0) - 0xfee0);
    });
};

/**
 * アーティストを検索（オートコンプリート用）
 * 正規化名で前方一致検索
 */
export const searchArtists = async (query: string): Promise<Artist[]> => {
  if (!query.trim()) {
    return [];
  }

  const normalizedQuery = normalizeArtistName(query);

  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .ilike('normalized_name', `${normalizedQuery}%`)
    .order('usage_count', { ascending: false })
    .order('name', { ascending: true })
    .limit(10);

  if (error) {
    console.error('Error searching artists:', error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    normalizedName: row.normalized_name,
    createdBy: row.created_by,
    usageCount: row.usage_count,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }));
};

/**
 * アーティストを作成（重複チェック付き）
 * 同じ正規化名が存在する場合は既存のアーティストを返す
 */
export const createArtist = async (
  name: string,
  userId: string
): Promise<{ data: Artist | null; error: Error | null }> => {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return { data: null, error: new Error('アーティスト名を入力してください') };
  }

  const normalizedName = normalizeArtistName(trimmedName);

  // 既存チェック
  const { data: existing } = await supabase
    .from('artists')
    .select('*')
    .eq('normalized_name', normalizedName)
    .single();

  if (existing) {
    // 既存のアーティストを返す
    return {
      data: {
        id: existing.id,
        name: existing.name,
        normalizedName: existing.normalized_name,
        createdBy: existing.created_by,
        usageCount: existing.usage_count,
        createdAt: new Date(existing.created_at),
        updatedAt: new Date(existing.updated_at),
      },
      error: null,
    };
  }

  // 新規作成
  const { data, error } = await supabase
    .from('artists')
    .insert({
      name: trimmedName, // ユーザーが入力した形式を保存
      normalized_name: normalizedName,
      created_by: userId,
      usage_count: 0, // トリガーで自動的に1になる
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating artist:', error);
    return { data: null, error };
  }

  return {
    data: {
      id: data.id,
      name: data.name,
      normalizedName: data.normalized_name,
      createdBy: data.created_by,
      usageCount: data.usage_count,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    },
    error: null,
  };
};

/**
 * ユーザーのお気に入りアーティストを取得
 */
export const getUserFavoriteArtists = async (
  userId: string
): Promise<Artist[]> => {
  const { data, error } = await supabase
    .from('user_favorite_artists')
    .select(
      `
      artist_id,
      artists (
        id,
        name,
        normalized_name,
        created_by,
        usage_count,
        created_at,
        updated_at
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error getting favorite artists:', error);
    return [];
  }

  return (data || [])
    .filter((row) => row.artists) // joinが成功した行のみ
    .map((row) => {
      const artist = row.artists as any;
      return {
        id: artist.id,
        name: artist.name,
        normalizedName: artist.normalized_name,
        createdBy: artist.created_by,
        usageCount: artist.usage_count,
        createdAt: new Date(artist.created_at),
        updatedAt: new Date(artist.updated_at),
      };
    });
};

/**
 * ユーザーのお気に入りアーティストを保存
 * 既存のお気に入りを削除して新しいリストを保存
 */
export const saveFavoriteArtists = async (
  userId: string,
  artistIds: string[]
): Promise<{ error: Error | null }> => {
  // トランザクション的に処理（既存削除 → 新規追加）

  // 1. 既存のお気に入りを削除
  const { error: deleteError } = await supabase
    .from('user_favorite_artists')
    .delete()
    .eq('user_id', userId);

  if (deleteError) {
    console.error('Error deleting favorite artists:', deleteError);
    return { error: deleteError };
  }

  // 2. 新しいお気に入りを追加
  if (artistIds.length > 0) {
    const { error: insertError } = await supabase
      .from('user_favorite_artists')
      .insert(
        artistIds.map((artistId) => ({
          user_id: userId,
          artist_id: artistId,
        }))
      );

    if (insertError) {
      console.error('Error inserting favorite artists:', insertError);
      return { error: insertError };
    }
  }

  return { error: null };
};

/**
 * アーティストをお気に入りに追加
 */
export const addFavoriteArtist = async (
  userId: string,
  artistId: string
): Promise<{ error: Error | null }> => {
  const { error } = await supabase.from('user_favorite_artists').insert({
    user_id: userId,
    artist_id: artistId,
  });

  if (error) {
    console.error('Error adding favorite artist:', error);
    return { error };
  }

  return { error: null };
};

/**
 * アーティストをお気に入りから削除
 */
export const removeFavoriteArtist = async (
  userId: string,
  artistId: string
): Promise<{ error: Error | null }> => {
  const { error } = await supabase
    .from('user_favorite_artists')
    .delete()
    .eq('user_id', userId)
    .eq('artist_id', artistId);

  if (error) {
    console.error('Error removing favorite artist:', error);
    return { error };
  }

  return { error: null };
};
