-- Step 3の新しいフィールドを追加し、不要なフィールドを削除

-- 新しいカラムを追加
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS supporter_welcome TEXT,
  ADD COLUMN IF NOT EXISTS event_frequency TEXT;

-- コメントを追加
COMMENT ON COLUMN users.supporter_welcome IS '同担歓迎設定: yes (利用する) | no (利用しない)';
COMMENT ON COLUMN users.event_frequency IS '現場参加頻度: frequent (頻繁に参加) | sometimes (時々参加) | rarely (ほとんど参加しない)';

-- 古いカラムを削除（local_sightseeing と local_dining）
ALTER TABLE users
  DROP COLUMN IF EXISTS local_sightseeing,
  DROP COLUMN IF EXISTS local_dining;
