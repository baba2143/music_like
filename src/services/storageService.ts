import { supabase } from '../config/supabase';
import * as ImageManipulator from 'expo-image-manipulator';

/**
 * ストレージサービス
 * Supabase Storage を使用した画像アップロード機能を提供
 */

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const AVATARS_BUCKET = 'avatars';
const IMAGE_QUALITY = 0.8; // JPEG圧縮品質 (0-1)
const MAX_DIMENSION = 800; // 最大幅/高さ

export interface StorageServiceResponse {
  data: string | null; // 公開URL
  error: Error | null;
}

/**
 * 画像をリサイズして最適化
 * 2MB以下、800x800以下に調整
 */
async function resizeImage(uri: string): Promise<string> {
  try {
    console.log('画像リサイズ開始:', uri);

    // 画像のリサイズと圧縮
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: MAX_DIMENSION,
            height: MAX_DIMENSION,
          },
        },
      ],
      {
        compress: IMAGE_QUALITY,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    console.log('リサイズ完了:', manipulatedImage.uri);
    return manipulatedImage.uri;
  } catch (error) {
    console.error('画像リサイズエラー:', error);
    throw new Error('画像のリサイズに失敗しました');
  }
}

/**
 * URIからBlobを取得
 */
async function uriToBlob(uri: string): Promise<Blob> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Blob変換エラー:', error);
    throw new Error('画像の読み込みに失敗しました');
  }
}

/**
 * アバター画像をアップロード
 * @param userId ユーザーID
 * @param imageUri 画像のローカルURI
 * @returns 公開URL
 */
export const uploadAvatar = async (
  userId: string,
  imageUri: string
): Promise<StorageServiceResponse> => {
  try {
    console.log('=== アバターアップロード開始 ===');
    console.log('ユーザーID:', userId);
    console.log('画像URI:', imageUri);

    // 1. 画像をリサイズ
    const resizedUri = await resizeImage(imageUri);

    // 2. Blobに変換
    const blob = await uriToBlob(resizedUri);

    // 3. ファイルサイズチェック
    if (blob.size > MAX_FILE_SIZE) {
      throw new Error(
        `画像サイズが大きすぎます。${Math.round(blob.size / 1024 / 1024)}MB（最大2MB）`
      );
    }

    // 4. ファイル名を生成（ユーザーIDフォルダ内）
    const timestamp = Date.now();
    const fileName = `${userId}/avatar_${timestamp}.jpg`;

    console.log('アップロードファイル名:', fileName);
    console.log('ファイルサイズ:', Math.round(blob.size / 1024), 'KB');

    // 5. Supabase Storageにアップロード
    const { data, error } = await supabase.storage
      .from(AVATARS_BUCKET)
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true, // 既存ファイルを上書き
      });

    if (error) {
      console.error('アップロードエラー:', error);
      throw error;
    }

    console.log('アップロード成功:', data.path);

    // 6. 公開URLを取得
    const { data: publicUrlData } = supabase.storage
      .from(AVATARS_BUCKET)
      .getPublicUrl(data.path);

    console.log('公開URL:', publicUrlData.publicUrl);

    return { data: publicUrlData.publicUrl, error: null };
  } catch (error) {
    console.error('アバターアップロード失敗:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * アバター画像を削除
 * @param userId ユーザーID
 */
export const deleteAvatar = async (userId: string): Promise<{ error: Error | null }> => {
  try {
    console.log('=== アバター削除開始 ===');
    console.log('ユーザーID:', userId);

    // ユーザーフォルダ内の全ファイルを削除
    const { data: files, error: listError } = await supabase.storage
      .from(AVATARS_BUCKET)
      .list(userId);

    if (listError) {
      throw listError;
    }

    if (!files || files.length === 0) {
      console.log('削除するファイルがありません');
      return { error: null };
    }

    // 全ファイルを削除
    const filePaths = files.map((file) => `${userId}/${file.name}`);
    const { error: deleteError } = await supabase.storage
      .from(AVATARS_BUCKET)
      .remove(filePaths);

    if (deleteError) {
      throw deleteError;
    }

    console.log('削除成功:', filePaths.length, 'ファイル');
    return { error: null };
  } catch (error) {
    console.error('アバター削除失敗:', error);
    return { error: error as Error };
  }
};
