# Spotify API セットアップガイド

このガイドでは、Spotify Web APIを使用してトラック情報を自動取得するための設定方法を説明します。

## 前提条件

- Spotifyアカウント（無料アカウントでOK）
- Supabase CLIがインストールされていること
- Supabaseプロジェクトが作成されていること

## ステップ1: Spotify Developer登録

### 1.1 Spotify Developer Dashboardにアクセス

https://developer.spotify.com/dashboard にアクセスしてログインします。

### 1.2 新しいアプリを作成

1. **「Create app」** ボタンをクリック
2. アプリ情報を入力：
   - **App name**: `Music Like App`（任意の名前）
   - **App description**: `Music social app with playlist sharing`（任意の説明）
   - **Website**: `https://your-app-domain.com`（後で変更可能）
   - **Redirect URI**: 空欄でOK（Client Credentials Flowでは不要）
   - **API/SDKs**: 「Web API」にチェック

3. 利用規約に同意して **「Save」** をクリック

### 1.3 認証情報を取得

1. 作成したアプリをクリック
2. **「Settings」** をクリック
3. **Client ID** と **Client Secret** をコピーして保存
   - ⚠️ **Client Secret は第三者に見せないでください**

## ステップ2: Supabase Edge Function設定

### 2.1 Supabase CLIのインストール（未インストールの場合）

```bash
# macOS
brew install supabase/tap/supabase

# その他のOSはこちらを参照:
# https://supabase.com/docs/guides/cli
```

### 2.2 Supabaseプロジェクトとリンク

```bash
# プロジェクトディレクトリに移動
cd "/Users/makotobaba/Desktop/music like"

# Supabaseにログイン
supabase login

# プロジェクトとリンク
supabase link --project-ref YOUR_PROJECT_REF
```

**YOUR_PROJECT_REF の確認方法:**
1. Supabase Dashboard (https://supabase.com/dashboard) にアクセス
2. プロジェクトを選択
3. URLの `https://supabase.com/dashboard/project/[ここがproject-ref]` 部分をコピー

### 2.3 環境変数（シークレット）を設定

```bash
# Spotify Client IDを設定
supabase secrets set SPOTIFY_CLIENT_ID=your_client_id_here

# Spotify Client Secretを設定
supabase secrets set SPOTIFY_CLIENT_SECRET=your_client_secret_here
```

**注意:**
- `your_client_id_here` と `your_client_secret_here` を実際の値に置き換えてください
- `=` の前後にスペースを入れないでください

### 2.4 Edge Functionをデプロイ

```bash
# Edge Functionをデプロイ
supabase functions deploy get-spotify-track
```

成功すると、以下のようなメッセージが表示されます：
```
Deploying function get-spotify-track...
Function get-spotify-track deployed successfully.
```

## ステップ3: 動作確認

### 3.1 アプリを起動

```bash
npm run dev
# または
npx expo start --web
```

### 3.2 テスト

1. ログインして「マイページ」に移動
2. プレイリストを開く
3. **「+ 曲を追加」** をクリック
4. **「外部サービス」** タブを選択
5. Spotify URL を入力（例: `https://open.spotify.com/track/5oQpH1uuZte4axR411rIlN`）
6. **「取得」** ボタンをクリック

### 3.3 期待される動作

- ✅ **曲名** が自動入力される
- ✅ **アーティスト名** が自動入力される
- ✅ サムネイル画像が表示される
- ✅ 編集フィールドで修正可能

### 3.4 コンソールログを確認

ブラウザのDeveloper Tools（F12）を開いて、以下のログが表示されることを確認：

```
=== Supabase Edge Function呼び出し ===
URL: https://open.spotify.com/track/...
=== Spotify Web API レスポンス ===
Title: 曲名
Artist: アーティスト名
Album: アルバム名
```

## トラブルシューティング

### エラー1: "Spotify credentials not configured"

**原因:** 環境変数が設定されていない

**解決策:**
```bash
# シークレットが設定されているか確認
supabase secrets list

# 設定されていない場合、再度設定
supabase secrets set SPOTIFY_CLIENT_ID=your_client_id
supabase secrets set SPOTIFY_CLIENT_SECRET=your_client_secret

# 再デプロイ
supabase functions deploy get-spotify-track
```

### エラー2: "Failed to invoke function"

**原因:** Edge Functionがデプロイされていない、またはURL が間違っている

**解決策:**
```bash
# Functionが存在するか確認
supabase functions list

# 再デプロイ
supabase functions deploy get-spotify-track
```

### エラー3: "Spotify auth failed: 401"

**原因:** Client IDまたはClient Secretが間違っている

**解決策:**
1. Spotify Developer Dashboardで認証情報を再確認
2. 正しい値で再設定:
```bash
supabase secrets set SPOTIFY_CLIENT_ID=正しいID
supabase secrets set SPOTIFY_CLIENT_SECRET=正しいシークレット
supabase functions deploy get-spotify-track
```

### エラー4: CORS Error

**原因:** Supabase プロジェクトのURLが正しく設定されていない

**解決策:**
1. `.env` ファイルで `SUPABASE_URL` が正しいか確認
2. Supabase Dashboard > Settings > API で URL を確認
3. アプリを再起動

## API制限について

Spotify Web APIの無料プランでは以下の制限があります：

- **Rate Limit**: 1日あたり数万リクエスト
- **Quota**: 通常の使用では十分

制限に達した場合、429エラーが返されます。その場合は時間をおいて再試行してください。

## セキュリティに関する注意事項

⚠️ **重要:**
- Client Secret は絶対にフロントエンドコードに含めないでください
- Supabase Edge Function内でのみ使用します
- GitHubなどにシークレットをプッシュしないでください
- `.env` ファイルは `.gitignore` に含まれていることを確認してください

## 次のステップ

設定が完了したら、以下の機能をテストしてください：

1. ✅ Spotifyトラックの自動取得
2. ✅ アーティスト名・曲名の編集
3. ✅ プレイリストへの追加
4. ✅ 投稿機能との連携

## 参考リンク

- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api/)
- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Client Credentials Flow](https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow)
