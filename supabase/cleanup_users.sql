-- ==========================================
-- ユーザーデータ完全削除スクリプト
-- ==========================================
-- 目的: 問題のあるユーザーアカウントを完全に削除
--
-- 対象ユーザー:
-- 1. baba_m@switch-media-jp.com (564f7384-f5b6-4fc5-bb8e-f5a7292148ee)
--    問題: メール未確認
-- 2. baba.makoto1976@gmail.com (da0f7cd5-1740-4df4-baa9-94819df66669)
--    問題: Email provider disabled
-- ==========================================

-- 削除前の確認クエリ（実行前に確認）
SELECT 'Before cleanup:' AS status;
SELECT id, email FROM auth.users
WHERE id IN (
  '564f7384-f5b6-4fc5-bb8e-f5a7292148ee',
  'da0f7cd5-1740-4df4-baa9-94819df66669'
);

-- ==========================================
-- 削除処理開始
-- ==========================================

-- 1. user_favorite_artists から削除（外部キー参照）
DELETE FROM public.user_favorite_artists
WHERE user_id IN (
  '564f7384-f5b6-4fc5-bb8e-f5a7292148ee',
  'da0f7cd5-1740-4df4-baa9-94819df66669'
);

-- 2. users テーブルから削除
DELETE FROM public.users
WHERE id IN (
  '564f7384-f5b6-4fc5-bb8e-f5a7292148ee',
  'da0f7cd5-1740-4df4-baa9-94819df66669'
);

-- 3. auth.users から削除（Supabase Auth）
-- 注意: この操作は取り消せません
DELETE FROM auth.users
WHERE id IN (
  '564f7384-f5b6-4fc5-bb8e-f5a7292148ee',
  'da0f7cd5-1740-4df4-baa9-94819df66669'
);

-- ==========================================
-- 削除後の確認
-- ==========================================

SELECT 'After cleanup:' AS status;
SELECT id, email FROM auth.users
WHERE id IN (
  '564f7384-f5b6-4fc5-bb8e-f5a7292148ee',
  'da0f7cd5-1740-4df4-baa9-94819df66669'
);

-- 結果確認（空の結果セットが返れば成功）
SELECT 'Cleanup completed successfully!' AS status;
