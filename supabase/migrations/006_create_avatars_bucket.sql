-- アバター画像アップロード用のStorageバケット作成

-- =============================================
-- Storage バケットの作成
-- =============================================

-- avatars バケットを作成（公開アクセス可能）
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- Row Level Security (RLS) ポリシー設定
-- =============================================

-- 認証済みユーザーは自分のアバターをアップロード可能
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 認証済みユーザーは自分のアバターを更新可能
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 認証済みユーザーは自分のアバターを削除可能
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 全てのユーザーはアバターを閲覧可能（public bucket）
CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- =============================================
-- コメント
-- =============================================

COMMENT ON TABLE storage.buckets IS 'ストレージバケット管理テーブル';

-- =============================================
-- 確認クエリ（実行後に確認用）
-- =============================================
-- SELECT * FROM storage.buckets WHERE id = 'avatars';
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%avatar%';
