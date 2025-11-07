# データベース設計書

**アイドル好き向け音楽共有SNSアプリ**

**作成日**: 2025-11-07
**バージョン**: 1.0
**DBMS**: PostgreSQL（Supabase）

---

## 目次

1. [概要](#1-概要)
2. [ER図](#2-er図)
3. [テーブル定義](#3-テーブル定義)
4. [インデックス設計](#4-インデックス設計)
5. [制約とルール](#5-制約とルール)
6. [セキュリティポリシー](#6-セキュリティポリシー)
7. [マイグレーション戦略](#7-マイグレーション戦略)

---

## 1. 概要

### 1.1. データベース構成
- **DBMS**: PostgreSQL 15.x
- **ホスティング**: Supabase
- **文字セット**: UTF-8
- **タイムゾーン**: UTC

### 1.2. テーブル一覧

| テーブル名 | 説明 | Phase |
|-----------|------|-------|
| users | ユーザー基本情報 | Phase 1 |
| user_idol_preferences | アイドル推し情報 | Phase 1 |
| posts | 投稿 | Phase 1 |
| follows | フォロー関係 | Phase 1 |
| post_likes | いいね | Phase 1 |
| post_comments | コメント | Phase 1 |
| post_saves | ブックマーク | Phase 1 |
| chat_messages | ダイレクトメッセージ | Phase 1 |
| notifications | 通知 | Phase 1 |
| user_blocks | ブロック | Phase 1 |
| user_reports | 通報 | Phase 1 |
| app_settings | アプリ設定 | Phase 1 |

---

## 2. ER図

```
┌─────────────┐
│   users     │
└─────────────┘
       │
       │ 1:N
       ├────────────────┐
       │                │
       ▼                ▼
┌──────────────┐  ┌─────────────┐
│user_idol_    │  │  follows    │
│preferences   │  └─────────────┘
└──────────────┘         │
                         │
                    ┌────┴────┐
                    │         │
              follower_id  following_id
                    │         │
                    └─────────┘
       │
       │ 1:N
       ├────────────────┬──────────────┬─────────────┬─────────────┐
       │                │              │             │             │
       ▼                ▼              ▼             ▼             ▼
┌─────────┐    ┌──────────┐   ┌──────────┐  ┌─────────┐  ┌──────────┐
│  posts  │    │post_likes│   │post_     │  │post_    │  │chat_     │
└─────────┘    └──────────┘   │comments  │  │saves    │  │messages  │
       │                       └──────────┘  └─────────┘  └──────────┘
       │
       │ 1:N
       ├────────────────┬──────────────┬─────────────┐
       │                │              │             │
       ▼                ▼              ▼             ▼
┌──────────┐    ┌──────────┐   ┌──────────┐  ┌──────────┐
│post_likes│    │post_     │   │post_     │  │user_     │
│          │    │comments  │   │saves     │  │blocks    │
└──────────┘    └──────────┘   └──────────┘  └──────────┘

       │
       │ 1:N
       ▼
┌──────────────┐
│notifications │
└──────────────┘
```

---

## 3. テーブル定義

### 3.1. users（ユーザー基本情報）

**概要**: ユーザーの基本情報を管理

```sql
CREATE TABLE users (
    -- プライマリキー（Supabase Authと連携）
    id UUID PRIMARY KEY DEFAULT auth.uid(),

    -- 基本情報
    username TEXT UNIQUE NOT NULL CHECK (char_length(username) BETWEEN 3 AND 20),
    email TEXT UNIQUE NOT NULL,
    age_range TEXT NOT NULL CHECK (age_range IN ('18-22', '23-27', '28-32', '33-37', '38+')),
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'private')),
    region TEXT NOT NULL, -- 市区町村レベル
    bio TEXT CHECK (char_length(bio) <= 500),

    -- プロフィール画像
    profile_image_url TEXT,

    -- 位置情報（地理的マッチング用）
    location GEOGRAPHY(POINT), -- PostGISの地理データ型

    -- アカウント状態
    is_verified BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE, -- アカウント公開/非公開

    -- アクティビティ
    last_active TIMESTAMP WITH TIME ZONE,

    -- 統計情報（非正規化）
    posts_count INTEGER DEFAULT 0,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,

    -- タイムスタンプ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- インデックス
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_location ON users USING GIST(location);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- トリガー（updated_at自動更新）
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**カラム説明**:

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PK | Supabase Auth UIDと連携 |
| username | TEXT | UNIQUE, NOT NULL | ニックネーム（3-20文字） |
| email | TEXT | UNIQUE, NOT NULL | メールアドレス |
| age_range | TEXT | NOT NULL | 年齢層 |
| gender | TEXT | NULL | 性別（任意） |
| region | TEXT | NOT NULL | 居住地域 |
| bio | TEXT | NULL | 自己紹介（最大500文字） |
| profile_image_url | TEXT | NULL | プロフィール画像URL |
| location | GEOGRAPHY | NULL | 位置情報（地理的検索用） |
| is_verified | BOOLEAN | DEFAULT FALSE | 認証済みユーザー |
| is_public | BOOLEAN | DEFAULT TRUE | アカウント公開設定 |
| last_active | TIMESTAMP | NULL | 最終アクティブ日時 |
| posts_count | INTEGER | DEFAULT 0 | 投稿数（非正規化） |
| followers_count | INTEGER | DEFAULT 0 | フォロワー数（非正規化） |
| following_count | INTEGER | DEFAULT 0 | フォロー中数（非正規化） |
| created_at | TIMESTAMP | DEFAULT now() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT now() | 更新日時 |

---

### 3.2. user_idol_preferences（アイドル推し情報）

**概要**: ユーザーのアイドル好みと推し情報

```sql
CREATE TABLE user_idol_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

    -- 推し情報（メイン推し1つのみ）
    oshi_group TEXT NOT NULL, -- 推しグループ
    oshi_member TEXT, -- 推しメンバー（任意）
    fan_duration TEXT CHECK (fan_duration IN ('less_than_1', '1_to_3', '3_to_5', 'over_5')),

    -- オタ活スタイル（配列で複数選択）
    otaku_activities TEXT[] DEFAULT ARRAY[]::TEXT[],
    -- 選択肢: 'live', 'handshake', 'goods', 'travel', 'streaming', 'sns'

    -- 現場参加頻度
    event_frequency TEXT CHECK (event_frequency IN ('rarely', 'monthly', 'weekly')),
    willing_to_travel BOOLEAN DEFAULT FALSE, -- 遠征可否

    -- マッチング設定
    allow_same_oshi BOOLEAN DEFAULT FALSE, -- 同担歓迎/拒否

    -- タイムスタンプ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

    -- 1ユーザー1レコードの制約
    UNIQUE(user_id)
);

-- インデックス
CREATE INDEX idx_idol_prefs_user ON user_idol_preferences(user_id);
CREATE INDEX idx_idol_prefs_oshi_group ON user_idol_preferences(oshi_group);
CREATE INDEX idx_idol_prefs_oshi_member ON user_idol_preferences(oshi_member);
```

**補足**: 複数推し対応は将来的に別テーブル（user_oshi_groups）で実装予定

---

### 3.3. posts（投稿）

**概要**: ユーザーの投稿（プレイリスト、今聴いてる曲、テキスト）

```sql
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

    -- 投稿タイプ
    post_type TEXT NOT NULL CHECK (post_type IN ('playlist', 'now_playing', 'text')),

    -- 共通コンテンツ
    caption TEXT CHECK (char_length(caption) <= 500),
    hashtags TEXT[] DEFAULT ARRAY[]::TEXT[],

    -- プレイリスト投稿の場合
    playlist_url TEXT,
    playlist_title TEXT,
    playlist_thumbnail TEXT,
    playlist_service TEXT CHECK (playlist_service IN ('spotify', 'apple_music', 'youtube_music', 'line_music', 'other')),
    playlist_track_count INTEGER,

    -- 今聴いてる曲の場合
    song_title TEXT,
    song_artist TEXT,
    song_album TEXT,
    song_artwork_url TEXT,
    song_url TEXT,

    -- 公開設定
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private')),

    -- エンゲージメント（非正規化でパフォーマンス向上）
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,

    -- タイムスタンプ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- インデックス
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_type ON posts(post_type);
CREATE INDEX idx_posts_visibility ON posts(visibility);
CREATE INDEX idx_posts_hashtags ON posts USING GIN(hashtags); -- GINインデックスで配列検索を高速化

-- トリガー（投稿数カウント更新）
CREATE OR REPLACE FUNCTION increment_user_posts_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users SET posts_count = posts_count + 1 WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_posts_count
    AFTER INSERT ON posts
    FOR EACH ROW
    EXECUTE FUNCTION increment_user_posts_count();

CREATE OR REPLACE FUNCTION decrement_user_posts_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users SET posts_count = posts_count - 1 WHERE id = OLD.user_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrement_posts_count
    AFTER DELETE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION decrement_user_posts_count();
```

**カラム説明**:

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PK | 投稿ID |
| user_id | UUID | FK, NOT NULL | 投稿者ID |
| post_type | TEXT | NOT NULL | 投稿タイプ（playlist/now_playing/text） |
| caption | TEXT | NULL | キャプション（最大500文字） |
| hashtags | TEXT[] | DEFAULT [] | ハッシュタグ配列 |
| playlist_* | TEXT/INT | NULL | プレイリスト情報 |
| song_* | TEXT | NULL | 曲情報 |
| visibility | TEXT | DEFAULT 'public' | 公開範囲 |
| *_count | INTEGER | DEFAULT 0 | エンゲージメント数（非正規化） |
| created_at | TIMESTAMP | DEFAULT now() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT now() | 更新日時 |

---

### 3.4. follows（フォロー関係）

**概要**: ユーザー間のフォロー関係

```sql
CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

    -- 自分自身をフォローできない、重複フォロー不可
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- インデックス
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_follows_created ON follows(created_at DESC);

-- トリガー（フォロー数カウント更新）
CREATE OR REPLACE FUNCTION increment_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    UPDATE users SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_follow_counts
    AFTER INSERT ON follows
    FOR EACH ROW
    EXECUTE FUNCTION increment_follow_counts();

CREATE OR REPLACE FUNCTION decrement_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users SET following_count = following_count - 1 WHERE id = OLD.follower_id;
    UPDATE users SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrement_follow_counts
    AFTER DELETE ON follows
    FOR EACH ROW
    EXECUTE FUNCTION decrement_follow_counts();
```

---

### 3.5. post_likes（いいね）

**概要**: 投稿へのいいね

```sql
CREATE TABLE post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

    -- 1投稿に1ユーザー1回のみ
    UNIQUE(post_id, user_id)
);

-- インデックス
CREATE INDEX idx_likes_post ON post_likes(post_id);
CREATE INDEX idx_likes_user ON post_likes(user_id);
CREATE INDEX idx_likes_created ON post_likes(created_at DESC);

-- トリガー（いいね数カウント更新）
CREATE OR REPLACE FUNCTION increment_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_likes_count
    AFTER INSERT ON post_likes
    FOR EACH ROW
    EXECUTE FUNCTION increment_post_likes_count();

CREATE OR REPLACE FUNCTION decrement_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrement_likes_count
    AFTER DELETE ON post_likes
    FOR EACH ROW
    EXECUTE FUNCTION decrement_post_likes_count();
```

---

### 3.6. post_comments（コメント）

**概要**: 投稿へのコメント

```sql
CREATE TABLE post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    comment_text TEXT NOT NULL CHECK (char_length(comment_text) BETWEEN 1 AND 500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- インデックス
CREATE INDEX idx_comments_post_created ON post_comments(post_id, created_at DESC);
CREATE INDEX idx_comments_user ON post_comments(user_id);

-- トリガー（コメント数カウント更新）
CREATE OR REPLACE FUNCTION increment_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_comments_count
    AFTER INSERT ON post_comments
    FOR EACH ROW
    EXECUTE FUNCTION increment_post_comments_count();

CREATE OR REPLACE FUNCTION decrement_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrement_comments_count
    AFTER DELETE ON post_comments
    FOR EACH ROW
    EXECUTE FUNCTION decrement_post_comments_count();
```

---

### 3.7. post_saves（ブックマーク）

**概要**: 投稿の保存（ブックマーク）

```sql
CREATE TABLE post_saves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

    -- 1投稿に1ユーザー1回のみ
    UNIQUE(post_id, user_id)
);

-- インデックス
CREATE INDEX idx_saves_user_created ON post_saves(user_id, created_at DESC);
CREATE INDEX idx_saves_post ON post_saves(post_id);

-- トリガー（保存数カウント更新）
CREATE OR REPLACE FUNCTION increment_post_saves_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE posts SET saves_count = saves_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_saves_count
    AFTER INSERT ON post_saves
    FOR EACH ROW
    EXECUTE FUNCTION increment_post_saves_count();

CREATE OR REPLACE FUNCTION decrement_post_saves_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE posts SET saves_count = saves_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrement_saves_count
    AFTER DELETE ON post_saves
    FOR EACH ROW
    EXECUTE FUNCTION decrement_post_saves_count();
```

---

### 3.8. chat_messages（ダイレクトメッセージ）

**概要**: ユーザー間のダイレクトメッセージ

```sql
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

    -- メッセージ内容
    message_text TEXT CHECK (char_length(message_text) <= 2000),
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'link')),
    media_url TEXT, -- 画像やリンクの場合

    -- 既読管理
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,

    -- タイムスタンプ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

    -- 自分自身にメッセージ送信不可
    CHECK (sender_id != receiver_id)
);

-- インデックス
CREATE INDEX idx_messages_sender_receiver ON chat_messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX idx_messages_receiver_sender ON chat_messages(receiver_id, sender_id, created_at DESC);
CREATE INDEX idx_messages_created ON chat_messages(created_at DESC);
CREATE INDEX idx_messages_unread ON chat_messages(receiver_id, is_read) WHERE is_read = FALSE;
```

**カラム説明**:

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PK | メッセージID |
| sender_id | UUID | FK, NOT NULL | 送信者ID |
| receiver_id | UUID | FK, NOT NULL | 受信者ID |
| message_text | TEXT | NULL | メッセージ本文（最大2000文字） |
| message_type | TEXT | DEFAULT 'text' | メッセージタイプ |
| media_url | TEXT | NULL | 画像・リンクURL |
| is_read | BOOLEAN | DEFAULT FALSE | 既読フラグ |
| read_at | TIMESTAMP | NULL | 既読日時 |
| created_at | TIMESTAMP | DEFAULT now() | 送信日時 |

---

### 3.9. notifications（通知）

**概要**: アプリ内通知

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

    -- 通知タイプ
    type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention', 'dm')),

    -- 関連情報
    actor_id UUID REFERENCES users(id) ON DELETE CASCADE, -- 通知を発生させたユーザー
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,

    -- 内容
    title TEXT NOT NULL,
    body TEXT,

    -- 既読管理
    is_read BOOLEAN DEFAULT FALSE,

    -- タイムスタンプ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- インデックス
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_type ON notifications(type);
```

---

### 3.10. user_blocks（ブロック）

**概要**: ユーザーブロック

```sql
CREATE TABLE user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    blocked_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

    -- 重複ブロック不可、自分自身をブロック不可
    UNIQUE(blocker_id, blocked_id),
    CHECK (blocker_id != blocked_id)
);

-- インデックス
CREATE INDEX idx_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX idx_blocks_blocked ON user_blocks(blocked_id);
```

---

### 3.11. user_reports（通報）

**概要**: 不適切コンテンツ・ユーザーの通報

```sql
CREATE TABLE user_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    reported_id UUID REFERENCES users(id), -- ユーザー通報の場合
    reported_post_id UUID REFERENCES posts(id) ON DELETE CASCADE, -- 投稿通報の場合

    -- 通報タイプ
    report_type TEXT NOT NULL CHECK (report_type IN ('user', 'post', 'comment')),

    -- 通報理由
    reason TEXT NOT NULL CHECK (reason IN ('inappropriate', 'spam', 'impersonation', 'harassment', 'other')),
    description TEXT,

    -- ステータス
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),

    -- タイムスタンプ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- インデックス
CREATE INDEX idx_reports_reporter ON user_reports(reporter_id);
CREATE INDEX idx_reports_reported ON user_reports(reported_id);
CREATE INDEX idx_reports_status ON user_reports(status);
CREATE INDEX idx_reports_created ON user_reports(created_at DESC);
```

---

### 3.12. app_settings（アプリ設定）

**概要**: ユーザーごとのアプリ設定

```sql
CREATE TABLE app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

    -- 通知設定
    push_notifications BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    notification_likes BOOLEAN DEFAULT TRUE,
    notification_comments BOOLEAN DEFAULT TRUE,
    notification_follows BOOLEAN DEFAULT TRUE,
    notification_dms BOOLEAN DEFAULT TRUE,

    -- プライバシー設定
    account_public BOOLEAN DEFAULT TRUE,
    dm_from TEXT DEFAULT 'everyone' CHECK (dm_from IN ('everyone', 'following', 'followers', 'none')),

    -- タイムスタンプ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

    -- 1ユーザー1設定
    UNIQUE(user_id)
);

-- インデックス
CREATE INDEX idx_settings_user ON app_settings(user_id);
```

---

## 4. インデックス設計

### 4.1. パフォーマンス重視のインデックス

| テーブル | インデックス | 目的 |
|---------|-------------|------|
| users | idx_users_username | ユーザー検索 |
| users | idx_users_location (GIST) | 地理的検索 |
| posts | idx_posts_user_created | ユーザーの投稿一覧 |
| posts | idx_posts_created | タイムライン表示 |
| posts | idx_posts_hashtags (GIN) | ハッシュタグ検索 |
| follows | idx_follows_follower | フォロー中一覧 |
| follows | idx_follows_following | フォロワー一覧 |
| post_likes | idx_likes_post | 投稿のいいね一覧 |
| post_comments | idx_comments_post_created | 投稿のコメント一覧 |
| chat_messages | idx_messages_sender_receiver | DM履歴取得 |
| notifications | idx_notifications_user_unread | 未読通知取得 |

### 4.2. 複合インデックス戦略

- **posts(user_id, created_at DESC)**: ユーザーの投稿を時系列で取得
- **chat_messages(sender_id, receiver_id, created_at DESC)**: DM履歴取得
- **notifications(user_id, is_read)**: 未読通知のみ取得

---

## 5. 制約とルール

### 5.1. データ整合性

**外部キー制約**:
- すべての参照整合性は `ON DELETE CASCADE` で自動削除
- 孤立レコードを防ぐ

**チェック制約**:
- 文字数制限（username: 3-20文字、caption: 500文字等）
- 列挙型の値制限（age_range, post_type等）
- 自己参照の防止（follows, chat_messages等）

### 5.2. トリガー

**updated_at自動更新**:
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**エンゲージメントカウント更新**:
- posts.likes_count, comments_count, saves_count
- users.posts_count, followers_count, following_count

---

## 6. セキュリティポリシー

### 6.1. Row Level Security（RLS）

Supabaseの行レベルセキュリティを有効化:

```sql
-- users テーブル
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 読み取り: 公開アカウントは全員、非公開は本人とフォロワーのみ
CREATE POLICY "Users are viewable by everyone if public" ON users
    FOR SELECT
    USING (
        is_public = TRUE
        OR id = auth.uid()
        OR id IN (
            SELECT following_id FROM follows WHERE follower_id = auth.uid()
        )
    );

-- 更新: 本人のみ
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE
    USING (id = auth.uid());

-- posts テーブル
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 読み取り: 公開投稿は全員、フォロワーのみは該当者、プライベートは本人のみ
CREATE POLICY "Posts are viewable based on visibility" ON posts
    FOR SELECT
    USING (
        visibility = 'public'
        OR user_id = auth.uid()
        OR (visibility = 'followers' AND user_id IN (
            SELECT following_id FROM follows WHERE follower_id = auth.uid()
        ))
    );

-- 作成: 認証済みユーザー
CREATE POLICY "Authenticated users can create posts" ON posts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 更新・削除: 本人のみ
CREATE POLICY "Users can update own posts" ON posts
    FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own posts" ON posts
    FOR DELETE
    USING (user_id = auth.uid());
```

### 6.2. アクセス制御

- **認証必須操作**: 投稿、いいね、コメント、フォロー、DM
- **公開操作**: プロフィール閲覧、投稿閲覧（公開設定に応じて）

---

## 7. マイグレーション戦略

### 7.1. 初期マイグレーション

```
migrations/
├── 00001_create_users.sql
├── 00002_create_user_idol_preferences.sql
├── 00003_create_posts.sql
├── 00004_create_follows.sql
├── 00005_create_post_likes.sql
├── 00006_create_post_comments.sql
├── 00007_create_post_saves.sql
├── 00008_create_chat_messages.sql
├── 00009_create_notifications.sql
├── 00010_create_user_blocks.sql
├── 00011_create_user_reports.sql
├── 00012_create_app_settings.sql
├── 00013_create_indexes.sql
├── 00014_create_triggers.sql
└── 00015_enable_rls.sql
```

### 7.2. マイグレーション実行

```bash
# Supabase CLI でマイグレーション実行
supabase db push

# ローカル開発環境
supabase db reset
```

### 7.3. ロールバック戦略

- 各マイグレーションに対応するロールバックスクリプトを用意
- Supabaseのスナップショット機能を活用

---

**最終更新日**: 2025-11-07
**承認者**: TBD
