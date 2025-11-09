-- Music Like アプリケーション 投稿データベース
-- 投稿、いいね、コメント、保存機能

-- =============================================
-- 投稿テーブル
-- =============================================

-- 投稿データを格納
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- 投稿タイプ
  content_type TEXT NOT NULL CHECK (content_type IN ('playlist', 'track', 'text')),

  -- 共通フィールド
  caption TEXT,
  hashtags TEXT[], -- ハッシュタグ配列

  -- プレイリスト投稿用フィールド
  playlist_url TEXT,
  playlist_title TEXT,
  playlist_thumbnail TEXT,
  playlist_track_count INTEGER,
  playlist_service TEXT CHECK (playlist_service IN ('spotify', 'apple_music', 'youtube_music')),

  -- 今聴いてる曲投稿用フィールド
  track_title TEXT,
  track_artist TEXT,
  track_album TEXT,
  track_thumbnail TEXT,
  track_url TEXT,

  -- エンゲージメントカウント
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,

  -- タイムスタンプ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- いいねテーブル
-- =============================================

CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- ユーザーは1つの投稿に1回だけいいね可能
  UNIQUE(post_id, user_id)
);

-- =============================================
-- コメントテーブル
-- =============================================

CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 保存（ブックマーク）テーブル
-- =============================================

CREATE TABLE public.saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- ユーザーは1つの投稿を1回だけ保存可能
  UNIQUE(post_id, user_id)
);

-- =============================================
-- インデックス作成
-- =============================================

-- 投稿一覧取得用（新しい順）
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);

-- ユーザーの投稿一覧取得用
CREATE INDEX idx_posts_user_id ON public.posts(user_id);

-- ハッシュタグ検索用（GINインデックス）
CREATE INDEX idx_posts_hashtags ON public.posts USING GIN(hashtags);

-- いいね取得用
CREATE INDEX idx_likes_post_id ON public.likes(post_id);
CREATE INDEX idx_likes_user_id ON public.likes(user_id);

-- コメント取得用
CREATE INDEX idx_comments_post_id ON public.comments(post_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);

-- 保存取得用
CREATE INDEX idx_saves_post_id ON public.saves(post_id);
CREATE INDEX idx_saves_user_id ON public.saves(user_id);

-- =============================================
-- Row Level Security (RLS) ポリシー
-- =============================================

-- RLS有効化
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 開発環境用シンプルなポリシー
-- =============================================

-- 投稿テーブル: 全操作可能（開発環境）
CREATE POLICY "All users have full access (dev)"
ON public.posts
FOR ALL
USING (true)
WITH CHECK (true);

-- いいねテーブル: 全操作可能（開発環境）
CREATE POLICY "All users have full access (dev)"
ON public.likes
FOR ALL
USING (true)
WITH CHECK (true);

-- コメントテーブル: 全操作可能（開発環境）
CREATE POLICY "All users have full access (dev)"
ON public.comments
FOR ALL
USING (true)
WITH CHECK (true);

-- 保存テーブル: 全操作可能（開発環境）
CREATE POLICY "All users have full access (dev)"
ON public.saves
FOR ALL
USING (true)
WITH CHECK (true);

-- =============================================
-- トリガー: エンゲージメントカウント自動更新
-- =============================================

-- いいね数を自動更新
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET likes_count = likes_count - 1
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_likes_count
AFTER INSERT OR DELETE ON public.likes
FOR EACH ROW
EXECUTE FUNCTION update_post_likes_count();

-- コメント数を自動更新
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET comments_count = comments_count - 1
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_comments_count
AFTER INSERT OR DELETE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION update_post_comments_count();

-- 保存数を自動更新
CREATE OR REPLACE FUNCTION update_post_saves_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET saves_count = saves_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET saves_count = saves_count - 1
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_saves_count
AFTER INSERT OR DELETE ON public.saves
FOR EACH ROW
EXECUTE FUNCTION update_post_saves_count();

-- updated_at自動更新トリガー（posts）
CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- updated_at自動更新トリガー（comments）
CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- =============================================
-- 実行確認
-- =============================================
-- このSQLの実行が成功したら、以下を確認してください：
--
-- 1. テーブル作成確認:
--    SELECT table_name FROM information_schema.tables
--    WHERE table_schema = 'public' AND table_name IN ('posts', 'likes', 'comments', 'saves');
--
-- 2. インデックス確認:
--    SELECT indexname FROM pg_indexes
--    WHERE tablename IN ('posts', 'likes', 'comments', 'saves');
--
-- 3. RLSポリシー確認:
--    SELECT tablename, policyname FROM pg_policies
--    WHERE tablename IN ('posts', 'likes', 'comments', 'saves');
-- =============================================
