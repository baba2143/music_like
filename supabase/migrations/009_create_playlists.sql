-- Music Like アプリケーション プレイリスト機能
-- プレイリスト、曲、プレイリスト-曲の中間テーブル
--
-- アプリ内独自プレイリスト機能を提供

-- =============================================
-- 曲マスターテーブル
-- =============================================

CREATE TABLE public.tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- 曲情報
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  thumbnail_url TEXT,

  -- 外部サービス連携
  external_url TEXT,
  service TEXT CHECK (service IN ('spotify', 'apple_music', 'youtube_music', 'manual')),
  external_id TEXT, -- 外部サービスのID

  -- タイムスタンプ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- プレイリストテーブル
-- =============================================

CREATE TABLE public.playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- プレイリスト情報
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,

  -- 公開設定
  is_public BOOLEAN DEFAULT true,

  -- 統計
  tracks_count INTEGER DEFAULT 0,

  -- タイムスタンプ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- プレイリスト-曲の中間テーブル
-- =============================================

CREATE TABLE public.playlist_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,

  -- 曲順
  position INTEGER NOT NULL,

  -- 追加者
  added_by_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- タイムスタンプ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- プレイリスト内で同じ曲を複数回追加できる（位置が異なれば）
  UNIQUE(playlist_id, track_id, position)
);

-- =============================================
-- インデックス作成
-- =============================================

-- プレイリスト取得用
CREATE INDEX idx_playlists_user_id ON public.playlists(user_id);
CREATE INDEX idx_playlists_is_public ON public.playlists(is_public);
CREATE INDEX idx_playlists_created_at ON public.playlists(created_at DESC);

-- 曲検索用
CREATE INDEX idx_tracks_title ON public.tracks(title);
CREATE INDEX idx_tracks_artist ON public.tracks(artist);
CREATE INDEX idx_tracks_external_id ON public.tracks(external_id);

-- プレイリスト-曲取得用
CREATE INDEX idx_playlist_tracks_playlist_id ON public.playlist_tracks(playlist_id);
CREATE INDEX idx_playlist_tracks_track_id ON public.playlist_tracks(track_id);
CREATE INDEX idx_playlist_tracks_position ON public.playlist_tracks(playlist_id, position);

-- =============================================
-- Row Level Security (RLS) ポリシー
-- =============================================

-- RLS有効化
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 開発環境用シンプルなポリシー
-- =============================================

-- 曲テーブル: 全操作可能（開発環境）
CREATE POLICY "All users have full access (dev)"
ON public.tracks
FOR ALL
USING (true)
WITH CHECK (true);

-- プレイリストテーブル: 全操作可能（開発環境）
CREATE POLICY "All users have full access (dev)"
ON public.playlists
FOR ALL
USING (true)
WITH CHECK (true);

-- プレイリスト-曲テーブル: 全操作可能（開発環境）
CREATE POLICY "All users have full access (dev)"
ON public.playlist_tracks
FOR ALL
USING (true)
WITH CHECK (true);

-- =============================================
-- トリガー: プレイリストの曲数自動更新
-- =============================================

-- プレイリストの曲数を自動更新
CREATE OR REPLACE FUNCTION update_playlist_tracks_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.playlists
    SET tracks_count = tracks_count + 1
    WHERE id = NEW.playlist_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.playlists
    SET tracks_count = tracks_count - 1
    WHERE id = OLD.playlist_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_playlist_tracks_count
AFTER INSERT OR DELETE ON public.playlist_tracks
FOR EACH ROW
EXECUTE FUNCTION update_playlist_tracks_count();

-- updated_at自動更新トリガー（playlists）
CREATE TRIGGER update_playlists_updated_at
BEFORE UPDATE ON public.playlists
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- =============================================
-- 実行確認
-- =============================================
-- このSQLの実行が成功したら、以下を確認してください：
--
-- 1. テーブル作成確認:
--    SELECT table_name FROM information_schema.tables
--    WHERE table_schema = 'public' AND table_name IN ('tracks', 'playlists', 'playlist_tracks');
--
-- 2. インデックス確認:
--    SELECT indexname FROM pg_indexes
--    WHERE tablename IN ('tracks', 'playlists', 'playlist_tracks');
--
-- 3. RLSポリシー確認:
--    SELECT tablename, policyname FROM pg_policies
--    WHERE tablename IN ('tracks', 'playlists', 'playlist_tracks');
-- =============================================
