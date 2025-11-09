# 本番環境セキュリティ設定ガイド

**Music Like アプリケーションを本番環境にデプロイする前に必ず実施すべきセキュリティ設定**

> ⚠️ **重要**: 現在の開発環境設定はセキュリティが緩和されています。本番リリース前に必ずこのガイドに従って設定を強化してください。

---

## 📋 目次

1. [開発環境 vs 本番環境の違い](#開発環境-vs-本番環境の違い)
2. [Supabase本番設定](#supabase本番設定)
3. [コード修正](#コード修正)
4. [追加セキュリティ対策](#追加セキュリティ対策)
5. [デプロイ前チェックリスト](#デプロイ前チェックリスト)

---

## 開発環境 vs 本番環境の違い

### 認証設定の比較

| 設定項目 | 開発環境（現在） | 本番環境（推奨） |
|---------|----------------|----------------|
| **メール確認** | ❌ OFF（無効） | ✅ ON（必須） |
| **SMTP設定** | 不要 | 必須（SendGrid等） |
| **reCAPTCHA** | なし | 推奨 |
| **レート制限** | なし | 必須 |
| **パスワード強度** | 6文字以上 | 8文字以上 + 複雑性要件 |

### なぜ開発環境ではセキュリティを緩めているか？

**開発環境（現在の設定）:**
- メール確認OFF = テストアカウントを素早く作成できる
- SMTP不要 = Supabase無料プランで開発可能
- 開発サイクルの高速化

**本番環境のリスク（現在の設定のまま）:**
- ⚠️ メールアドレスの所有者確認ができない
- ⚠️ 他人のメールアドレスで勝手にアカウント作成可能
- ⚠️ スパムアカウント大量作成が容易
- ⚠️ なりすまし・不正利用のリスク

---

## Supabase本番設定

### 1. メール確認の有効化

#### ステップ1: Supabaseダッシュボード設定

1. **Supabaseダッシュボード** → **Authentication** → **Sign In / Providers**
2. **「Supabase Auth」タブ**を選択
3. **「User Signups」セクション**で以下を設定：

```yaml
Allow new users to sign up: ON（有効）
Confirm email: ON（必須）★重要★
```

4. **「Save」**をクリック

#### ステップ2: SMTP設定（メール送信サービス）

本番環境では外部SMTPサービスの設定が必須です。

**推奨サービス:**
- **SendGrid** (無料枠: 100通/日)
- **AWS SES** (低コスト)
- **Mailgun** (開発者向け)
- **Postmark** (高到達率)

**設定手順（SendGridの例）:**

1. **SendGridアカウント作成**
   - https://sendgrid.com/
   - 無料プランでOK

2. **API Key発行**
   - Settings → API Keys → Create API Key
   - "Mail Send"権限を付与

3. **Supabaseに設定**
   - Supabaseダッシュボード → Settings → Auth → SMTP Settings

   ```yaml
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [SendGrid API Key]
   Sender email: noreply@yourdomain.com
   Sender name: Music Like
   ```

4. **独自ドメインのメール推奨**
   - SendGridでドメイン認証（SPF/DKIM設定）
   - 到達率向上のため

### 2. メールテンプレートのカスタマイズ

1. **Supabaseダッシュボード** → **Authentication** → **Email Templates**
2. 以下のテンプレートを編集：

#### 確認メールテンプレート（Confirm sign up）

```html
<h2>Music Likeへようこそ！</h2>
<p>アカウントを有効化するには、以下のリンクをクリックしてください：</p>
<p><a href="{{ .ConfirmationURL }}">メールアドレスを確認</a></p>
<p>このメールに心当たりがない場合は、無視してください。</p>
<p>Music Like チーム</p>
```

### 3. レート制限設定

1. **Supabaseダッシュボード** → **Authentication** → **Rate Limits**
2. 以下の制限を設定：

```yaml
サインアップ:
  - 5回/時間（同一IPアドレス）
  - 3回/時間（同一メールアドレス）

ログイン:
  - 10回/時間（同一IPアドレス）
  - 5回/時間（同一メールアドレス）
```

---

## コード修正

### 1. LoginScreen.tsx の修正

**ファイル:** `src/screens/auth/LoginScreen.tsx`

**現在のコード（開発環境用）:**
```typescript
if (data) {
  // メール確認が無効の場合は直接ProfileSetupへ遷移
  navigation.navigate('ProfileSetupStep1');
}
```

**本番環境用コード:**
```typescript
if (data) {
  // 本番環境：メール確認が必要
  Alert.alert(
    'サインアップ成功',
    'ご登録のメールアドレスに確認メールを送信しました。メール内のリンクをクリックしてアカウントを有効化してください。',
    [
      {
        text: 'OK',
        onPress: () => {
          setIsSignUp(false);
          setEmail('');
          setPassword('');
          setConfirmPassword('');
        },
      },
    ]
  );
}
```

### 2. メール未確認ユーザーへの対応

**AuthContext.tsx への追加:**

```typescript
// src/contexts/AuthContext.tsx

const signIn = async (
  email: string,
  password: string
): Promise<authService.AuthResponse<User>> => {
  setIsLoading(true);
  try {
    const response = await authService.signIn({ email, password });

    if (response.data) {
      // メール確認チェック
      if (!response.data.email_confirmed_at) {
        return {
          data: null,
          error: new Error('メールアドレスが確認されていません。確認メールをご確認ください。'),
        };
      }

      setUser(response.data);
      const { data: sessionData } = await authService.getSession();
      if (sessionData) {
        setSession(sessionData);
      }
    }

    return response;
  } finally {
    setIsLoading(false);
  }
};
```

### 3. 環境変数による切り替え

**app.config.ts に環境設定を追加:**

```typescript
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  extra: {
    // 既存の設定
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,

    // 本番環境フラグ
    isProduction: process.env.APP_ENV === 'production',
    requireEmailConfirmation: process.env.APP_ENV === 'production',
  },
});
```

**.env に環境フラグ追加:**

```bash
# 開発環境
APP_ENV=development

# 本番環境（デプロイ時に変更）
# APP_ENV=production
```

**LoginScreen.tsx で環境に応じた処理:**

```typescript
import Constants from 'expo-constants';

const requireEmailConfirmation = Constants.expoConfig?.extra?.requireEmailConfirmation ?? true;

// サインアップ成功時
if (data) {
  if (requireEmailConfirmation) {
    // 本番環境：メール確認必須
    Alert.alert('サインアップ成功', 'メールを確認してアカウントを有効化してください。');
  } else {
    // 開発環境：直接遷移
    navigation.navigate('ProfileSetupStep1');
  }
}
```

---

## 追加セキュリティ対策

### 1. reCAPTCHA導入（ボット対策）

**必要なパッケージ:**
```bash
npm install react-google-recaptcha
npm install --save-dev @types/react-google-recaptcha
```

**実装例:**

```typescript
// src/screens/auth/LoginScreen.tsx
import ReCAPTCHA from "react-google-recaptcha";

const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

const handleRecaptchaChange = (token: string | null) => {
  setRecaptchaToken(token);
};

// サインアップ処理
const handleEmailAuth = async () => {
  if (isSignUp && !recaptchaToken) {
    Alert.alert('エラー', 'reCAPTCHA認証を完了してください');
    return;
  }

  // ... 既存の処理
};

// JSX
<ReCAPTCHA
  sitekey="YOUR_RECAPTCHA_SITE_KEY"
  onChange={handleRecaptchaChange}
/>
```

**Google reCAPTCHA設定:**
1. https://www.google.com/recaptcha/admin/create
2. reCAPTCHA v2 を選択
3. ドメイン登録
4. Site KeyとSecret Keyを取得

### 2. パスワード強度チェック強化

**zod スキーマ更新:**

```typescript
// src/validation/authSchema.ts (新規作成)
import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'パスワードは8文字以上で入力してください')
  .regex(/[A-Z]/, 'パスワードには大文字を1文字以上含めてください')
  .regex(/[a-z]/, 'パスワードには小文字を1文字以上含めてください')
  .regex(/[0-9]/, 'パスワードには数字を1文字以上含めてください')
  .regex(/[^A-Za-z0-9]/, 'パスワードには記号を1文字以上含めてください');

export const signUpSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
});
```

**LoginScreen.tsx で使用:**

```typescript
import { signUpSchema } from '../validation/authSchema';

const handleEmailAuth = async () => {
  if (isSignUp) {
    try {
      signUpSchema.parse({ email, password, confirmPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        Alert.alert('入力エラー', error.errors[0].message);
        return;
      }
    }
  }

  // ... サインアップ処理
};
```

### 3. セキュアな環境変数管理

**.env ファイルは絶対にGitにコミットしない:**

```bash
# .gitignore に追加（すでに含まれているか確認）
.env
.env.local
.env.production
```

**本番環境変数の管理:**

1. **EAS Secrets使用（Expo推奨）:**
```bash
eas secret:create --scope project --name SUPABASE_URL --value "https://..."
eas secret:create --scope project --name SUPABASE_ANON_KEY --value "eyJ..."
```

2. **Vercel/Netlify等のホスティング:**
   - 各プラットフォームの環境変数設定UI使用
   - ビルド時に注入

---

## デプロイ前チェックリスト

### 🔐 セキュリティ設定

- [ ] Supabase「Confirm email」をONに設定
- [ ] SMTP設定完了（SendGrid/AWS SES等）
- [ ] メールテンプレートをカスタマイズ
- [ ] レート制限を設定（サインアップ・ログイン）
- [ ] RLSポリシー全テーブルで有効化確認
- [ ] Storageポリシー設定確認

### 📝 コード修正

- [ ] LoginScreen.tsx のメール確認フロー復活
- [ ] AuthContext.tsx のメール確認チェック追加
- [ ] 環境変数による開発/本番切り替え実装
- [ ] パスワード強度チェック強化（8文字以上 + 複雑性）
- [ ] reCAPTCHA導入（推奨）

### 🔧 環境変数

- [ ] `.env`ファイルがGit管理外であることを確認
- [ ] 本番用環境変数をホスティングプラットフォームに設定
- [ ] `APP_ENV=production`を本番環境に設定
- [ ] APIキー・シークレットが漏洩していないか確認

### 🧪 テスト

- [ ] サインアップ → メール確認 → ログインのフロー全体をテスト
- [ ] メール未確認ユーザーがログインできないことを確認
- [ ] パスワード強度チェックが機能することを確認
- [ ] レート制限が正しく動作することを確認

### 📊 監視・ログ

- [ ] Supabase Auth Logsで不審なアクティビティ監視
- [ ] エラーログ収集設定（Sentry等）
- [ ] 認証失敗のアラート設定

---

## 本番環境移行手順

### ステップ1: Supabase設定変更（1-2時間）

1. メール確認を有効化
2. SMTP設定
3. メールテンプレートカスタマイズ
4. レート制限設定

### ステップ2: コード修正（2-3時間）

1. LoginScreen.tsx修正
2. AuthContext.tsx修正
3. パスワード強度チェック実装
4. 環境変数切り替え実装

### ステップ3: テスト（1-2時間）

1. 開発環境で動作確認
2. ステージング環境でE2Eテスト
3. 本番環境で最終確認

### ステップ4: デプロイ

1. 環境変数を本番用に切り替え
2. アプリケーションビルド
3. デプロイ実行
4. 動作確認

---

## 参考リンク

- [Supabase Authentication Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Email Auth Best Practices](https://supabase.com/docs/guides/auth/auth-email)
- [SendGrid Getting Started](https://docs.sendgrid.com/for-developers/sending-email/getting-started-smtp)
- [Google reCAPTCHA v2](https://developers.google.com/recaptcha/docs/display)

---

## トラブルシューティング

### メールが届かない

1. **SMTP設定を確認**
   - Host, Port, Username, Passwordが正しいか
   - SendGrid/SESのAPIキーが有効か

2. **スパムフォルダを確認**
   - SPF/DKIM設定（ドメイン認証）
   - 送信元メールアドレスが信頼できるドメインか

3. **Supabase Auth Logsで確認**
   - メール送信エラーログをチェック

### ログインできない（メール確認済みなのに）

1. **メール確認状態をSupabaseで確認**
   - Dashboard → Authentication → Users
   - `email_confirmed_at`カラムに日時が入っているか

2. **セッションをクリア**
   - ブラウザのローカルストレージをクリア
   - アプリを再起動

---

**最終更新:** 2025年11月8日
**次回レビュー:** 本番リリース1週間前
