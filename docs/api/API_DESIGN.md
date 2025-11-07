# API設計書

**アイドル好き向け音楽共有SNSアプリ**

**作成日**: 2025-11-07
**バージョン**: 1.0
**API基盤**: Supabase（PostgreSQL REST API + Edge Functions）

---

## 目次

1. [概要](#1-概要)
2. [認証API](#2-認証api)
3. [ユーザーAPI](#3-ユーザーapi)
4. [投稿API](#4-投稿api)
5. [ソーシャルAPI](#5-ソーシャルapi)
6. [メッセージAPI](#6-メッセージapi)
7. [通知API](#7-通知api)
8. [検索API](#8-検索api)
9. [Edge Functions](#9-edge-functions)
10. [エラーハンドリング](#10-エラーハンドリング)
11. [レート制限](#11-レート制限)

---

## 1. 概要

### 1.1. API基盤

**Supabase REST API**:
- PostgreSQLの自動REST API生成
- 認証: Supabase Auth（JWT）
- Row Level Security（RLS）による自動認可

**Supabase Edge Functions**:
- Deno Runtime
- カスタムロジック実装
- 外部API連携

**ベースURL**:
```
Production: https://[PROJECT_ID].supabase.co
Development: http://localhost:54321
```

### 1.2. 認証

**認証方式**: Bearer Token（JWT）

```http
Authorization: Bearer <access_token>
```

**トークン取得**: Supabase Authによる認証後に自動発行

### 1.3. リクエスト形式

**Content-Type**: `application/json`

**レスポンス形式**: JSON

---

## 2. 認証API

### 2.1. LINE認証

**エンドポイント**: `POST /functions/v1/line-auth`

**説明**: LINE認証コードをSupabaseセッションに変換

**リクエスト**:
```json
{
  "code": "LINE_AUTH_CODE",
  "redirectUri": "YOUR_APP_SCHEME://auth/callback"
}
```

**レスポンス**:
```json
{
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "...",
    "expires_in": 3600,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "user_metadata": {
        "provider": "line",
        "line_user_id": "...",
        "display_name": "...",
        "picture_url": "..."
      }
    }
  }
}
```

**エラー**:
- `400 Bad Request`: 無効なコード
- `500 Internal Server Error`: LINE API エラー

---

### 2.2. Apple/Google認証

**エンドポイント**: Supabase Auth SDK経由

```typescript
// Apple Sign-In
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'apple'
})

// Google Sign-In
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
})
```

---

### 2.3. ログアウト

**エンドポイント**: Supabase Auth SDK経由

```typescript
const { error } = await supabase.auth.signOut()
```

---

## 3. ユーザーAPI

### 3.1. ユーザー登録（プロフィール作成）

**エンドポイント**: `POST /rest/v1/users`

**認証**: 必須

**リクエスト**:
```json
{
  "username": "user123",
  "age_range": "23-27",
  "gender": "female",
  "region": "東京都渋谷区",
  "bio": "乃木坂46が大好きです！",
  "profile_image_url": "https://storage.supabase.co/..."
}
```

**レスポンス**:
```json
{
  "id": "uuid",
  "username": "user123",
  "email": "user@example.com",
  "age_range": "23-27",
  "gender": "female",
  "region": "東京都渋谷区",
  "bio": "乃木坂46が大好きです！",
  "profile_image_url": "https://storage.supabase.co/...",
  "is_public": true,
  "posts_count": 0,
  "followers_count": 0,
  "following_count": 0,
  "created_at": "2024-11-07T10:00:00Z",
  "updated_at": "2024-11-07T10:00:00Z"
}
```

**バリデーション**:
- `username`: 3-20文字、英数字とアンダースコア
- `age_range`: 列挙型（'18-22', '23-27', '28-32', '33-37', '38+'）
- `bio`: 最大500文字

---

### 3.2. アイドル推し情報登録

**エンドポイント**: `POST /rest/v1/user_idol_preferences`

**認証**: 必須

**リクエスト**:
```json
{
  "user_id": "uuid",
  "oshi_group": "乃木坂46",
  "oshi_member": "齋藤飛鳥",
  "fan_duration": "1_to_3",
  "otaku_activities": ["live", "goods"],
  "event_frequency": "monthly",
  "willing_to_travel": false,
  "allow_same_oshi": false
}
```

**レスポンス**:
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "oshi_group": "乃木坂46",
  "oshi_member": "齋藤飛鳥",
  "fan_duration": "1_to_3",
  "otaku_activities": ["live", "goods"],
  "event_frequency": "monthly",
  "willing_to_travel": false,
  "allow_same_oshi": false,
  "created_at": "2024-11-07T10:00:00Z",
  "updated_at": "2024-11-07T10:00:00Z"
}
```

---

### 3.3. プロフィール取得

**エンドポイント**: `GET /rest/v1/users?id=eq.{user_id}`

**認証**: 任意（公開プロフィールの場合）

**クエリパラメータ**:
- `id`: ユーザーID（UUID）
- `select`: 取得フィールド（デフォルト: 全て）

**レスポンス**:
```json
{
  "id": "uuid",
  "username": "user123",
  "age_range": "23-27",
  "gender": "female",
  "region": "東京都渋谷区",
  "bio": "乃木坂46が大好きです！",
  "profile_image_url": "https://...",
  "is_public": true,
  "posts_count": 42,
  "followers_count": 128,
  "following_count": 85,
  "created_at": "2024-11-07T10:00:00Z",
  "user_idol_preferences": {
    "oshi_group": "乃木坂46",
    "oshi_member": "齋藤飛鳥",
    "otaku_activities": ["live", "goods"]
  }
}
```

---

### 3.4. プロフィール更新

**エンドポイント**: `PATCH /rest/v1/users?id=eq.{user_id}`

**認証**: 必須（自分のプロフィールのみ）

**リクエスト**:
```json
{
  "bio": "更新された自己紹介",
  "profile_image_url": "https://..."
}
```

**レスポンス**: 更新後のユーザー情報

---

## 4. 投稿API

### 4.1. 投稿作成

**エンドポイント**: `POST /rest/v1/posts`

**認証**: 必須

**リクエスト（プレイリスト投稿）**:
```json
{
  "user_id": "uuid",
  "post_type": "playlist",
  "caption": "推しの神曲集作りました！",
  "hashtags": ["乃木坂46", "神曲"],
  "playlist_url": "https://open.spotify.com/playlist/...",
  "playlist_title": "乃木坂46 神曲50選",
  "playlist_thumbnail": "https://...",
  "playlist_service": "spotify",
  "playlist_track_count": 50,
  "visibility": "public"
}
```

**リクエスト（今聴いてる曲）**:
```json
{
  "user_id": "uuid",
  "post_type": "now_playing",
  "caption": "何度聴いても泣ける😭",
  "song_title": "サヨナラの意味",
  "song_artist": "乃木坂46",
  "song_artwork_url": "https://...",
  "song_url": "https://...",
  "visibility": "public"
}
```

**レスポンス**:
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "post_type": "playlist",
  "caption": "推しの神曲集作りました！",
  "hashtags": ["乃木坂46", "神曲"],
  "playlist_url": "https://...",
  "playlist_title": "乃木坂46 神曲50選",
  "playlist_thumbnail": "https://...",
  "playlist_service": "spotify",
  "playlist_track_count": 50,
  "visibility": "public",
  "likes_count": 0,
  "comments_count": 0,
  "saves_count": 0,
  "created_at": "2024-11-07T10:00:00Z",
  "updated_at": "2024-11-07T10:00:00Z"
}
```

---

### 4.2. フィード取得

**エンドポイント**: `GET /rest/v1/posts`

**認証**: 必須

**クエリパラメータ**:
- `order`: `created_at.desc`（新しい順）
- `limit`: 取得件数（デフォルト: 20）
- `offset`: オフセット（ページネーション用）
- `select`: `*,users(username,profile_image_url)`（結合）

**レスポンス**:
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "post_type": "playlist",
    "caption": "推しの神曲集作りました！",
    "hashtags": ["乃木坂46", "神曲"],
    "playlist_title": "乃木坂46 神曲50選",
    "playlist_thumbnail": "https://...",
    "playlist_service": "spotify",
    "playlist_track_count": 50,
    "likes_count": 24,
    "comments_count": 5,
    "saves_count": 3,
    "created_at": "2024-11-07T10:00:00Z",
    "users": {
      "username": "user123",
      "profile_image_url": "https://..."
    }
  },
  ...
]
```

**フィルタリング（フォロー中のみ）**:
```
GET /rest/v1/posts?user_id=in.(SELECT following_id FROM follows WHERE follower_id='{current_user_id}')
```

---

### 4.3. 投稿詳細取得

**エンドポイント**: `GET /rest/v1/posts?id=eq.{post_id}`

**認証**: 任意（公開投稿の場合）

**クエリパラメータ**:
- `select`: `*,users(*),post_comments(*,users(*)),post_likes(*)`

**レスポンス**:
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "post_type": "playlist",
  "caption": "推しの神曲集作りました！",
  "hashtags": ["乃木坂46", "神曲"],
  "playlist_title": "乃木坂46 神曲50選",
  "playlist_thumbnail": "https://...",
  "playlist_service": "spotify",
  "playlist_track_count": 50,
  "likes_count": 24,
  "comments_count": 5,
  "saves_count": 3,
  "created_at": "2024-11-07T10:00:00Z",
  "users": {
    "username": "user123",
    "profile_image_url": "https://..."
  },
  "post_comments": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "comment_text": "最高のプレイリストです！",
      "created_at": "2024-11-07T11:00:00Z",
      "users": {
        "username": "user456",
        "profile_image_url": "https://..."
      }
    }
  ],
  "post_likes": [
    {"user_id": "uuid1"},
    {"user_id": "uuid2"}
  ]
}
```

---

### 4.4. 投稿削除

**エンドポイント**: `DELETE /rest/v1/posts?id=eq.{post_id}`

**認証**: 必須（自分の投稿のみ）

**レスポンス**: `204 No Content`

---

## 5. ソーシャルAPI

### 5.1. いいね

**エンドポイント**: `POST /rest/v1/post_likes`

**認証**: 必須

**リクエスト**:
```json
{
  "post_id": "uuid",
  "user_id": "uuid"
}
```

**レスポンス**:
```json
{
  "id": "uuid",
  "post_id": "uuid",
  "user_id": "uuid",
  "created_at": "2024-11-07T10:00:00Z"
}
```

**いいね取り消し**:
```
DELETE /rest/v1/post_likes?post_id=eq.{post_id}&user_id=eq.{user_id}
```

---

### 5.2. コメント投稿

**エンドポイント**: `POST /rest/v1/post_comments`

**認証**: 必須

**リクエスト**:
```json
{
  "post_id": "uuid",
  "user_id": "uuid",
  "comment_text": "最高のプレイリストです！"
}
```

**レスポンス**:
```json
{
  "id": "uuid",
  "post_id": "uuid",
  "user_id": "uuid",
  "comment_text": "最高のプレイリストです！",
  "created_at": "2024-11-07T10:00:00Z"
}
```

---

### 5.3. ブックマーク

**エンドポイント**: `POST /rest/v1/post_saves`

**認証**: 必須

**リクエスト**:
```json
{
  "post_id": "uuid",
  "user_id": "uuid"
}
```

**レスポンス**:
```json
{
  "id": "uuid",
  "post_id": "uuid",
  "user_id": "uuid",
  "created_at": "2024-11-07T10:00:00Z"
}
```

**ブックマーク解除**:
```
DELETE /rest/v1/post_saves?post_id=eq.{post_id}&user_id=eq.{user_id}
```

---

### 5.4. フォロー

**エンドポイント**: `POST /rest/v1/follows`

**認証**: 必須

**リクエスト**:
```json
{
  "follower_id": "uuid", // 自分
  "following_id": "uuid"  // 相手
}
```

**レスポンス**:
```json
{
  "id": "uuid",
  "follower_id": "uuid",
  "following_id": "uuid",
  "created_at": "2024-11-07T10:00:00Z"
}
```

**フォロー解除**:
```
DELETE /rest/v1/follows?follower_id=eq.{follower_id}&following_id=eq.{following_id}
```

---

### 5.5. フォロワー一覧

**エンドポイント**: `GET /rest/v1/follows`

**認証**: 必須

**クエリパラメータ**:
- `following_id=eq.{user_id}`: 指定ユーザーのフォロワー
- `select=*,users!follows_follower_id_fkey(*)`: ユーザー情報結合

**レスポンス**:
```json
[
  {
    "id": "uuid",
    "follower_id": "uuid",
    "following_id": "uuid",
    "created_at": "2024-11-07T10:00:00Z",
    "users": {
      "username": "follower123",
      "profile_image_url": "https://..."
    }
  }
]
```

---

### 5.6. フォロー中一覧

**エンドポイント**: `GET /rest/v1/follows`

**クエリパラメータ**:
- `follower_id=eq.{user_id}`: 指定ユーザーがフォロー中
- `select=*,users!follows_following_id_fkey(*)`: ユーザー情報結合

---

## 6. メッセージAPI

### 6.1. メッセージ送信

**エンドポイント**: `POST /rest/v1/chat_messages`

**認証**: 必須

**リクエスト**:
```json
{
  "sender_id": "uuid",
  "receiver_id": "uuid",
  "message_text": "こんにちは！",
  "message_type": "text"
}
```

**レスポンス**:
```json
{
  "id": "uuid",
  "sender_id": "uuid",
  "receiver_id": "uuid",
  "message_text": "こんにちは！",
  "message_type": "text",
  "is_read": false,
  "created_at": "2024-11-07T10:00:00Z"
}
```

---

### 6.2. メッセージ履歴取得

**エンドポイント**: `GET /rest/v1/chat_messages`

**認証**: 必須

**クエリパラメータ**:
```
?or=(and(sender_id.eq.{user_a},receiver_id.eq.{user_b}),and(sender_id.eq.{user_b},receiver_id.eq.{user_a}))
&order=created_at.asc
&limit=50
```

**レスポンス**:
```json
[
  {
    "id": "uuid",
    "sender_id": "uuid",
    "receiver_id": "uuid",
    "message_text": "こんにちは！",
    "message_type": "text",
    "is_read": true,
    "read_at": "2024-11-07T10:05:00Z",
    "created_at": "2024-11-07T10:00:00Z"
  },
  ...
]
```

---

### 6.3. 既読更新

**エンドポイント**: `PATCH /rest/v1/chat_messages?id=eq.{message_id}`

**認証**: 必須

**リクエスト**:
```json
{
  "is_read": true,
  "read_at": "2024-11-07T10:05:00Z"
}
```

---

### 6.4. リアルタイム通信（Supabase Realtime）

**チャンネル購読**:
```typescript
const channel = supabase
  .channel('chat_messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'chat_messages',
      filter: `receiver_id=eq.${currentUserId}`
    },
    (payload) => {
      console.log('新しいメッセージ:', payload.new)
    }
  )
  .subscribe()
```

---

## 7. 通知API

### 7.1. 通知一覧取得

**エンドポイント**: `GET /rest/v1/notifications`

**認証**: 必須

**クエリパラメータ**:
- `user_id=eq.{user_id}`: 自分の通知のみ
- `order=created_at.desc`: 新しい順
- `limit=50`

**レスポンス**:
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "type": "like",
    "actor_id": "uuid",
    "post_id": "uuid",
    "title": "@user1があなたの投稿にいいねしました",
    "body": null,
    "is_read": false,
    "created_at": "2024-11-07T10:00:00Z"
  },
  ...
]
```

---

### 7.2. 既読更新

**エンドポイント**: `PATCH /rest/v1/notifications?id=eq.{notification_id}`

**認証**: 必須

**リクエスト**:
```json
{
  "is_read": true
}
```

---

### 7.3. リアルタイム通知（Supabase Realtime）

**チャンネル購読**:
```typescript
const channel = supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${currentUserId}`
    },
    (payload) => {
      console.log('新しい通知:', payload.new)
      // プッシュ通知送信
    }
  )
  .subscribe()
```

---

## 8. 検索API

### 8.1. ユーザー検索

**エンドポイント**: `GET /rest/v1/users`

**認証**: 任意

**クエリパラメータ**:
- `username=ilike.*{query}*`: ユーザー名で部分一致検索
- `is_public=eq.true`: 公開アカウントのみ

**レスポンス**:
```json
[
  {
    "id": "uuid",
    "username": "user123",
    "profile_image_url": "https://...",
    "bio": "乃木坂46が大好きです！",
    "user_idol_preferences": {
      "oshi_group": "乃木坂46"
    }
  },
  ...
]
```

---

### 8.2. プレイリスト検索

**エンドポイント**: `GET /rest/v1/posts`

**認証**: 任意

**クエリパラメータ**:
- `post_type=eq.playlist`
- `playlist_title=ilike.*{query}*`: タイトルで部分一致検索
- `visibility=eq.public`: 公開投稿のみ

---

### 8.3. ハッシュタグ検索

**エンドポイント**: `GET /rest/v1/posts`

**認証**: 任意

**クエリパラメータ**:
- `hashtags=cs.{tag}`: ハッシュタグで検索（`cs`は contains）

---

### 8.4. おすすめユーザー取得

**エンドポイント**: `POST /functions/v1/recommend-users`

**認証**: 必須

**リクエスト**:
```json
{
  "user_id": "uuid",
  "limit": 10
}
```

**レスポンス**:
```json
[
  {
    "id": "uuid",
    "username": "user123",
    "profile_image_url": "https://...",
    "oshi_group": "乃木坂46",
    "common_interests": ["live", "goods"],
    "match_score": 0.85
  },
  ...
]
```

**ロジック**:
- 同じ推しグループのファン
- 同じオタ活スタイル
- 地理的に近い
- フォロー関係を除外

---

## 9. Edge Functions

### 9.1. LINE認証

**関数名**: `line-auth`

**パス**: `/functions/v1/line-auth`

**実装**:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { code, redirectUri } = await req.json()

  // 1. LINEからアクセストークン取得
  const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: Deno.env.get('LINE_CLIENT_ID')!,
      client_secret: Deno.env.get('LINE_CLIENT_SECRET')!,
    })
  })

  const { access_token } = await tokenResponse.json()

  // 2. ユーザープロフィール取得
  const profileResponse = await fetch('https://api.line.me/v2/profile', {
    headers: { 'Authorization': `Bearer ${access_token}` }
  })

  const profile = await profileResponse.json()

  // 3. Supabaseユーザー作成/ログイン
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_KEY')!
  )

  const { data: { user }, error } = await supabase.auth.admin.createUser({
    email: profile.email || `${profile.userId}@line.me`,
    email_confirm: true,
    user_metadata: {
      provider: 'line',
      line_user_id: profile.userId,
      display_name: profile.displayName,
      picture_url: profile.pictureUrl,
    }
  })

  // 4. セッション作成
  const { data: session } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: user.email!,
  })

  return new Response(JSON.stringify({ session }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

---

### 9.2. OGP取得

**関数名**: `fetch-ogp`

**パス**: `/functions/v1/fetch-ogp`

**実装**:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts'

serve(async (req) => {
  const { url } = await req.json()

  try {
    // URLのHTMLを取得
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MusicLikeBot/1.0)',
      }
    })

    const html = await response.text()
    const doc = new DOMParser().parseFromString(html, 'text/html')

    // OGPタグを取得
    const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content')
    const ogDescription = doc.querySelector('meta[property="og:description"]')?.getAttribute('content')
    const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content')
    const ogUrl = doc.querySelector('meta[property="og:url"]')?.getAttribute('content')

    return new Response(JSON.stringify({
      ogTitle,
      ogDescription,
      ogImage,
      ogUrl,
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
```

---

### 9.3. おすすめユーザー

**関数名**: `recommend-users`

**パス**: `/functions/v1/recommend-users`

**実装**:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { user_id, limit = 10 } = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_KEY')!
  )

  // ユーザーの推し情報を取得
  const { data: userPrefs } = await supabase
    .from('user_idol_preferences')
    .select('*')
    .eq('user_id', user_id)
    .single()

  // 同じ推しグループのユーザーを検索
  const { data: candidates } = await supabase
    .from('user_idol_preferences')
    .select('*, users(*)')
    .eq('oshi_group', userPrefs.oshi_group)
    .neq('user_id', user_id)
    .limit(limit * 2) // 多めに取得してフィルタリング

  // スコアリング
  const scored = candidates.map(candidate => {
    let score = 0.5 // ベーススコア

    // 同じオタ活スタイルで加点
    const commonActivities = candidate.otaku_activities.filter(
      act => userPrefs.otaku_activities.includes(act)
    )
    score += commonActivities.length * 0.1

    // 同担設定の考慮
    if (userPrefs.oshi_member === candidate.oshi_member) {
      if (userPrefs.allow_same_oshi && candidate.allow_same_oshi) {
        score += 0.2 // 両方同担歓迎なら加点
      } else {
        score = 0 // どちらかが同担拒否なら除外
      }
    }

    return {
      ...candidate.users,
      oshi_group: candidate.oshi_group,
      common_interests: commonActivities,
      match_score: Math.min(score, 1.0)
    }
  })

  // スコア順にソートしてフィルタ
  const recommended = scored
    .filter(u => u.match_score > 0)
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, limit)

  return new Response(JSON.stringify(recommended), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

---

## 10. エラーハンドリング

### 10.1. エラーレスポンス形式

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "field": "Additional error details"
    }
  }
}
```

### 10.2. HTTPステータスコード

| コード | 説明 |
|--------|------|
| 200 | 成功 |
| 201 | 作成成功 |
| 204 | 削除成功（コンテンツなし） |
| 400 | 不正なリクエスト |
| 401 | 未認証 |
| 403 | 権限なし |
| 404 | リソースが見つからない |
| 409 | 競合（重複エラー等） |
| 429 | レート制限超過 |
| 500 | サーバーエラー |

### 10.3. エラーコード一覧

| コード | 説明 |
|--------|------|
| INVALID_REQUEST | 不正なリクエスト |
| UNAUTHORIZED | 未認証 |
| FORBIDDEN | 権限なし |
| NOT_FOUND | リソースが見つからない |
| DUPLICATE_ENTRY | 重複エントリ |
| RATE_LIMIT_EXCEEDED | レート制限超過 |
| INTERNAL_ERROR | 内部エラー |

---

## 11. レート制限

### 11.1. 制限値

| エンドポイント | 制限 |
|---------------|------|
| 認証API | 10リクエスト/分 |
| 投稿作成 | 30投稿/時間 |
| いいね | 100リクエスト/分 |
| コメント | 50リクエスト/時間 |
| メッセージ送信 | 100メッセージ/時間 |
| 検索API | 60リクエスト/分 |
| その他GET | 300リクエスト/分 |

### 11.2. レート制限ヘッダー

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699350000
```

### 11.3. レート制限超過時

**レスポンス**:
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retry_after": 60
  }
}
```

**HTTPステータス**: `429 Too Many Requests`

---

**最終更新日**: 2025-11-07
**承認者**: TBD
