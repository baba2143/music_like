-- Music Like アプリケーション postsテーブル拡張
-- アプリ内プレイリストへの参照を追加
--
-- 投稿でアプリ内プレイリストを参照できるようにする

-- =============================================
-- postsテーブルにinternal_playlist_idカラムを追加
-- =============================================

ALTER TABLE public.posts
ADD COLUMN internal_playlist_id UUID REFERENCES public.playlists(id) ON DELETE SET NULL;

-- =============================================
-- インデックス作成
-- =============================================

-- プレイリストの投稿を取得するためのインデックス
CREATE INDEX idx_posts_internal_playlist_id ON public.posts(internal_playlist_id);

-- =============================================
-- コメント追加
-- =============================================

COMMENT ON COLUMN public.posts.internal_playlist_id IS 'アプリ内プレイリストへの参照（アプリ内プレイリスト投稿の場合）';

-- =============================================
-- 実行確認
-- =============================================
-- このSQLの実行が成功したら、以下を確認してください：
--
-- 1. カラム追加確認:
--    SELECT column_name, data_type, is_nullable
--    FROM information_schema.columns
--    WHERE table_name = 'posts' AND column_name = 'internal_playlist_id';
--
-- 2. インデックス確認:
--    SELECT indexname FROM pg_indexes
--    WHERE tablename = 'posts' AND indexname = 'idx_posts_internal_playlist_id';
-- =============================================
