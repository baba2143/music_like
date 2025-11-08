-- Music Like アプリケーション Storageポリシー設定

-- =============================================
-- Storageバケット用ポリシー
-- =============================================
--
-- 事前準備: Supabase Dashboardで以下のバケットを作成してください
-- 1. avatars (public) - プロフィール画像用
-- 2. posts (public) - 投稿画像用
--
-- バケット作成手順:
-- 1. 左メニュー「Storage」をクリック
-- 2. 「New bucket」をクリック
-- 3. Name: avatars, Public bucket: チェック
-- 4. 「Create bucket」をクリック
-- 5. 同様に posts バケットも作成
--
-- バケット作成後、このSQLを実行してください
-- =============================================

-- =============================================
-- avatarsバケット用ポリシー
-- =============================================

-- 1. 全員がアバター画像を閲覧可能
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 2. 認証ユーザーは自分のフォルダーにアバターをアップロード可能
-- フォルダー構造: avatars/{user_id}/filename.jpg
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. ユーザーは自分のアバター画像のみ更新可能
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. ユーザーは自分のアバター画像のみ削除可能
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================
-- postsバケット用ポリシー
-- =============================================

-- 1. 全員が投稿画像を閲覧可能
CREATE POLICY "Anyone can view posts"
ON storage.objects FOR SELECT
USING (bucket_id = 'posts');

-- 2. 認証ユーザーは自分のフォルダーに投稿画像をアップロード可能
-- フォルダー構造: posts/{user_id}/filename.jpg
CREATE POLICY "Users can upload their own posts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'posts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. ユーザーは自分の投稿画像のみ更新可能
CREATE POLICY "Users can update their own posts"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'posts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. ユーザーは自分の投稿画像のみ削除可能
CREATE POLICY "Users can delete their own posts"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'posts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================
-- 実行確認
-- =============================================
-- このSQLの実行が成功したら、以下を確認してください：
--
-- 1. Storage → avatars → Policies
--    - 4つのポリシーが表示される
--
-- 2. Storage → posts → Policies
--    - 4つのポリシーが表示される
--
-- ポリシーが正しく設定されていれば、
-- 認証ユーザーは自分のフォルダーにのみ画像をアップロードでき、
-- 全員がそれらの画像を閲覧できるようになります。
-- =============================================
