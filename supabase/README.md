# Supabase セットアップガイド

Music LikeアプリケーションのSupabaseバックエンド設定手順です。

## 📋 前提条件

- Supabaseアカウント（https://supabase.com）
- プロジェクトの作成完了

## 🚀 セットアップ手順

### 1. データベーススキーマの適用

1. Supabaseダッシュボードにログイン
2. プロジェクトを選択
3. 左メニューから「SQL Editor」を選択
4. `migrations/001_initial_schema.sql`の内容をコピー&ペースト
5. 「Run」ボタンをクリックして実行

### 2. Storageバケットの作成

#### avatarsバケット（プロフィール画像用）

1. 左メニューから「Storage」を選択
2. 「New bucket」をクリック
3. 以下の設定でバケットを作成：
   - Name: `avatars`
   - Public bucket: ✅ チェック

4. 作成したバケットを選択
5. 「Policies」タブで以下のポリシーを追加：

```sql
-- 誰でも閲覧可能
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- ユーザーは自分のアバターをアップロード可能
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ユーザーは自分のアバターを更新可能
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ユーザーは自分のアバターを削除可能
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

#### postsバケット（投稿画像用）

同様の手順で`posts`バケットを作成し、同じポリシーを適用（`bucket_id = 'posts'`に変更）

### 3. 認証設定

1. 左メニューから「Authentication」→「Providers」を選択
2. Email認証を有効化
3. （オプション）SNS認証（Google、Appleなど）を設定

### 4. 環境変数の設定

1. Supabaseダッシュボードで「Settings」→「API」を選択
2. 以下の情報をコピー：
   - Project URL
   - anon (public) key

3. アプリケーションの`src/config/supabase.ts`を更新：

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_PROJECT_URL';
const supabaseAnonKey = 'YOUR_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## 📊 作成されるテーブル

- ✅ **users** - ユーザープロフィール情報
- ✅ **posts** - 投稿（曲/プレイリスト）
- ✅ **comments** - コメント
- ✅ **likes** - いいね
- ✅ **saves** - 保存
- ✅ **follows** - フォロー関係
- ✅ **notifications** - 通知

## 🔐 Row Level Security (RLS)

全テーブルでRLSが有効化されており、以下のセキュリティルールが適用されています：

- ユーザーは自分のデータのみ編集・削除可能
- 公開情報（投稿、コメント、プロフィール）は全員閲覧可能
- プライベート情報（保存、通知）は本人のみ閲覧可能

## 🔄 自動トリガー

以下の統計情報が自動的に更新されます：

- `posts.likes_count` - いいね数
- `posts.comments_count` - コメント数
- `posts.saves_count` - 保存数
- `updated_at` - 更新日時

## ✅ セットアップ確認

SQL Editorで以下を実行してテーブルが正しく作成されたか確認：

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

期待される出力：
```
comments
follows
likes
notifications
posts
saves
users
```

## 🚨 トラブルシューティング

### スキーマ実行時にエラーが出る場合

1. 既存のテーブルを削除してから再実行：
```sql
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.saves CASCADE;
DROP TABLE IF EXISTS public.follows CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
```

2. その後、`001_initial_schema.sql`を再実行

### RLSポリシーが動作しない場合

- Supabaseクライアントが正しく初期化されているか確認
- ユーザーが正しく認証されているか確認（`supabase.auth.getUser()`）

## 📚 参考リンク

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage](https://supabase.com/docs/guides/storage)
