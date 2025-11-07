-- Music Like アプリケーション初期スキーマ

-- =============================================
-- 1. users テーブル（拡張プロフィール情報）
-- =============================================
-- Supabase Authのauth.usersテーブルに紐づく追加情報を保存
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  oshi_group TEXT,
  oshi_member TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- ユーザー名は3-20文字の英数字とアンダースコアのみ
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]{3,20}$')
);

-- usernameにインデックス（検索高速化）
CREATE INDEX idx_users_username ON public.users(username);

-- =============================================
-- 2. posts テーブル（投稿）
-- =============================================
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('song', 'playlist')),
  caption TEXT,

  -- 曲情報（content_type = 'song'の場合）
  song_title TEXT,
  song_artist TEXT,
  song_spotify_id TEXT,
  song_apple_music_id TEXT,
  song_album_art_url TEXT,

  -- プレイリスト情報（content_type = 'playlist'の場合）
  playlist_title TEXT,
  playlist_track_count INTEGER,
  playlist_service TEXT CHECK (playlist_service IN ('spotify', 'apple_music', 'youtube_music')),
  playlist_spotify_id TEXT,
  playlist_apple_music_id TEXT,
  playlist_image_url TEXT,

  -- エンゲージメント統計
  likes_count INTEGER DEFAULT 0 NOT NULL,
  comments_count INTEGER DEFAULT 0 NOT NULL,
  saves_count INTEGER DEFAULT 0 NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス（パフォーマンス最適化）
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_posts_content_type ON public.posts(content_type);

-- =============================================
-- 3. comments テーブル（コメント）
-- =============================================
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- コメントは1文字以上1000文字以下
  CONSTRAINT content_length CHECK (length(content) >= 1 AND length(content) <= 1000)
);

-- インデックス
CREATE INDEX idx_comments_post_id ON public.comments(post_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);

-- =============================================
-- 4. likes テーブル（いいね）
-- =============================================
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 1ユーザーは1投稿に1回のみいいね可能
  CONSTRAINT unique_like UNIQUE (post_id, user_id)
);

-- インデックス
CREATE INDEX idx_likes_post_id ON public.likes(post_id);
CREATE INDEX idx_likes_user_id ON public.likes(user_id);

-- =============================================
-- 5. saves テーブル（保存）
-- =============================================
CREATE TABLE public.saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 1ユーザーは1投稿を1回のみ保存可能
  CONSTRAINT unique_save UNIQUE (post_id, user_id)
);

-- インデックス
CREATE INDEX idx_saves_post_id ON public.saves(post_id);
CREATE INDEX idx_saves_user_id ON public.saves(user_id);

-- =============================================
-- 6. follows テーブル（フォロー関係）
-- =============================================
CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 自分自身をフォローできない
  CONSTRAINT no_self_follow CHECK (follower_id != following_id),
  -- 1ユーザーは同じユーザーを1回のみフォロー可能
  CONSTRAINT unique_follow UNIQUE (follower_id, following_id)
);

-- インデックス
CREATE INDEX idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX idx_follows_following_id ON public.follows(following_id);

-- =============================================
-- 7. notifications テーブル（通知）
-- =============================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention')),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 自分自身への通知は作成しない
  CONSTRAINT no_self_notification CHECK (user_id != actor_id)
);

-- インデックス
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- =============================================
-- トリガー: updated_at自動更新
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- トリガー: likes_count自動更新
-- =============================================
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.posts
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_likes_count_on_insert
  AFTER INSERT ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_likes_count();

CREATE TRIGGER update_likes_count_on_delete
  AFTER DELETE ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_likes_count();

-- =============================================
-- トリガー: comments_count自動更新
-- =============================================
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.posts
    SET comments_count = GREATEST(comments_count - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comments_count_on_insert
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_count();

CREATE TRIGGER update_comments_count_on_delete
  AFTER DELETE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_count();

-- =============================================
-- トリガー: saves_count自動更新
-- =============================================
CREATE OR REPLACE FUNCTION update_post_saves_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.posts
    SET saves_count = saves_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.posts
    SET saves_count = GREATEST(saves_count - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_saves_count_on_insert
  AFTER INSERT ON public.saves
  FOR EACH ROW
  EXECUTE FUNCTION update_post_saves_count();

CREATE TRIGGER update_saves_count_on_delete
  AFTER DELETE ON public.saves
  FOR EACH ROW
  EXECUTE FUNCTION update_post_saves_count();

-- =============================================
-- Row Level Security (RLS) ポリシー
-- =============================================

-- RLSを有効化
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- users テーブルのポリシー
CREATE POLICY "ユーザーは全員の公開プロフィールを閲覧可能"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "ユーザーは自分のプロフィールのみ更新可能"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "ユーザーは自分のプロフィールを作成可能"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- posts テーブルのポリシー
CREATE POLICY "全員が投稿を閲覧可能"
  ON public.posts FOR SELECT
  USING (true);

CREATE POLICY "認証ユーザーは投稿を作成可能"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分の投稿のみ更新可能"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分の投稿のみ削除可能"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);

-- comments テーブルのポリシー
CREATE POLICY "全員がコメントを閲覧可能"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "認証ユーザーはコメントを作成可能"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分のコメントのみ削除可能"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- likes テーブルのポリシー
CREATE POLICY "全員がいいねを閲覧可能"
  ON public.likes FOR SELECT
  USING (true);

CREATE POLICY "認証ユーザーはいいねを作成可能"
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分のいいねのみ削除可能"
  ON public.likes FOR DELETE
  USING (auth.uid() = user_id);

-- saves テーブルのポリシー
CREATE POLICY "ユーザーは自分の保存のみ閲覧可能"
  ON public.saves FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "認証ユーザーは保存を作成可能"
  ON public.saves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分の保存のみ削除可能"
  ON public.saves FOR DELETE
  USING (auth.uid() = user_id);

-- follows テーブルのポリシー
CREATE POLICY "全員がフォロー関係を閲覧可能"
  ON public.follows FOR SELECT
  USING (true);

CREATE POLICY "認証ユーザーはフォロー可能"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "ユーザーは自分のフォローのみ解除可能"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- notifications テーブルのポリシー
CREATE POLICY "ユーザーは自分の通知のみ閲覧可能"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "認証ユーザーは通知を作成可能"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = actor_id);

CREATE POLICY "ユーザーは自分の通知のみ更新可能"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- Storageバケット設定（画像アップロード用）
-- =============================================
-- Supabase Dashboardで以下のバケットを作成してください：
-- 1. avatars (public) - プロフィール画像
-- 2. posts (public) - 投稿画像

-- avatarsバケットのポリシー例：
-- CREATE POLICY "Anyone can view avatars"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'avatars');
--
-- CREATE POLICY "Users can upload their own avatar"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
--
-- CREATE POLICY "Users can update their own avatar"
--   ON storage.objects FOR UPDATE
--   USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
--
-- CREATE POLICY "Users can delete their own avatar"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
