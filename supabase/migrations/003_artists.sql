-- Music Like アプリケーション アーティストデータベース
-- ユーザー生成アーティストデータと重複防止機能

-- =============================================
-- アーティストテーブル
-- =============================================

-- アーティスト情報を格納（ユーザー生成）
CREATE TABLE public.artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- 表示名（ユーザーが入力した形式）
  normalized_name TEXT NOT NULL UNIQUE, -- 正規化名（重複チェック用）
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_count INTEGER DEFAULT 1, -- 何人のユーザーが選択しているか
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ユーザーとアーティストの多対多関連テーブル
-- =============================================

-- ユーザーのお気に入りアーティスト
CREATE TABLE public.user_favorite_artists (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, artist_id)
);

-- =============================================
-- インデックス作成（検索パフォーマンス向上）
-- =============================================

-- 正規化名での検索用（オートコンプリート）
CREATE INDEX idx_artists_normalized_name ON public.artists(normalized_name);

-- 使用数でのソート用（人気順表示）
CREATE INDEX idx_artists_usage_count ON public.artists(usage_count DESC);

-- ユーザーごとのお気に入りアーティスト取得用
CREATE INDEX idx_user_favorite_artists_user_id ON public.user_favorite_artists(user_id);

-- アーティストごとのユーザー数カウント用
CREATE INDEX idx_user_favorite_artists_artist_id ON public.user_favorite_artists(artist_id);

-- =============================================
-- Row Level Security (RLS) ポリシー
-- =============================================

-- RLS有効化
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorite_artists ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 開発環境用シンプルなポリシー
-- =============================================
-- 注意: これは開発環境用の設定です。
-- 本番環境にデプロイする前に、PRODUCTION_SETUP.mdの手順に従って
-- より厳格なポリシーに変更してください。
-- =============================================

-- アーティストテーブル: 認証済みユーザーは全操作可能
CREATE POLICY "Authenticated users have full access"
ON public.artists
TO authenticated
USING (true)
WITH CHECK (true);

-- user_favorite_artistsテーブル: 認証済みユーザーは全操作可能
CREATE POLICY "Authenticated users have full access"
ON public.user_favorite_artists
TO authenticated
USING (true)
WITH CHECK (true);

-- =============================================
-- 本番環境用ポリシー（コメントアウト済み）
-- =============================================
-- 本番環境では以下のポリシーに置き換えてください：
--
-- -- アーティストテーブル
-- CREATE POLICY "Anyone can view artists"
-- ON public.artists FOR SELECT
-- TO authenticated
-- USING (true);
--
-- CREATE POLICY "Authenticated users can insert artists"
-- ON public.artists FOR INSERT
-- TO authenticated
-- WITH CHECK (auth.uid() = created_by);
--
-- CREATE POLICY "Creator can delete unused artists"
-- ON public.artists FOR DELETE
-- TO authenticated
-- USING (auth.uid() = created_by AND usage_count = 0);
--
-- -- user_favorite_artistsテーブル
-- CREATE POLICY "Users can view their own favorites"
-- ON public.user_favorite_artists FOR SELECT
-- TO authenticated
-- USING (auth.uid() = user_id);
--
-- CREATE POLICY "Users can insert their own favorites"
-- ON public.user_favorite_artists FOR INSERT
-- TO authenticated
-- WITH CHECK (auth.uid() = user_id);
--
-- CREATE POLICY "Users can delete their own favorites"
-- ON public.user_favorite_artists FOR DELETE
-- TO authenticated
-- USING (auth.uid() = user_id);
-- =============================================

-- =============================================
-- トリガー: usage_count自動更新
-- =============================================

-- usage_countを自動的に増減させる関数
CREATE OR REPLACE FUNCTION update_artist_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- お気に入りに追加されたらusage_countを増やす
    UPDATE public.artists
    SET usage_count = usage_count + 1,
        updated_at = NOW()
    WHERE id = NEW.artist_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- お気に入りから削除されたらusage_countを減らす
    UPDATE public.artists
    SET usage_count = usage_count - 1,
        updated_at = NOW()
    WHERE id = OLD.artist_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- トリガーを設定
CREATE TRIGGER trigger_update_artist_usage_count
AFTER INSERT OR DELETE ON public.user_favorite_artists
FOR EACH ROW
EXECUTE FUNCTION update_artist_usage_count();

-- =============================================
-- updated_at自動更新関数（汎用）
-- =============================================

-- updated_atカラムを現在時刻に自動更新する汎用関数
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- updated_at自動更新トリガー
-- =============================================

CREATE TRIGGER update_artists_updated_at
BEFORE UPDATE ON public.artists
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- =============================================
-- 実行確認
-- =============================================
-- このSQLの実行が成功したら、以下を確認してください：
--
-- 1. テーブル作成確認:
--    SELECT table_name FROM information_schema.tables
--    WHERE table_schema = 'public' AND table_name IN ('artists', 'user_favorite_artists');
--
-- 2. インデックス確認:
--    SELECT indexname FROM pg_indexes
--    WHERE tablename IN ('artists', 'user_favorite_artists');
--
-- 3. RLSポリシー確認:
--    SELECT tablename, policyname FROM pg_policies
--    WHERE tablename IN ('artists', 'user_favorite_artists');
-- =============================================
