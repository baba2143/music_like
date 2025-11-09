-- プロフィール編集機能のためのusersテーブル拡張

-- =============================================
-- 新しいプロフィールフィールドを追加
-- =============================================

-- 性別
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS gender TEXT
CHECK (gender IN ('male', 'female', 'other', 'private'));

-- 誕生日
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS birth_date DATE;

-- 居住地
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS location TEXT;

-- ファン歴
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS fan_years TEXT;

-- 支援金
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS support_amount TEXT;

-- オタ活スタイル（複数選択可能）
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS otaku_styles TEXT[] DEFAULT '{}';

-- 現地観光地に興味がある
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS local_sightseeing BOOLEAN DEFAULT FALSE;

-- 現地飲食施設に興味がある
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS local_dining BOOLEAN DEFAULT FALSE;

-- =============================================
-- コメント追加
-- =============================================

COMMENT ON COLUMN public.users.gender IS '性別: male, female, other, private';
COMMENT ON COLUMN public.users.birth_date IS '誕生日';
COMMENT ON COLUMN public.users.location IS '居住地（都道府県または市区町村）';
COMMENT ON COLUMN public.users.fan_years IS 'ファン歴';
COMMENT ON COLUMN public.users.support_amount IS '支援金額の範囲';
COMMENT ON COLUMN public.users.otaku_styles IS 'オタ活スタイル（複数選択）';
COMMENT ON COLUMN public.users.local_sightseeing IS '現地観光地に興味がある';
COMMENT ON COLUMN public.users.local_dining IS '現地飲食施設に興味がある';

-- =============================================
-- インデックス追加（検索用）
-- =============================================

-- 性別でのフィルタリング用
CREATE INDEX IF NOT EXISTS idx_users_gender ON public.users(gender) WHERE gender IS NOT NULL;

-- 居住地でのフィルタリング用
CREATE INDEX IF NOT EXISTS idx_users_location ON public.users(location) WHERE location IS NOT NULL;

-- =============================================
-- 確認クエリ（実行後に確認用）
-- =============================================
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
-- AND table_name = 'users'
-- ORDER BY ordinal_position;
