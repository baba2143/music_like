// プロフィールセットアップのデータ型定義

// 年齢グループ
export type AgeGroup = '10代' | '20代' | '30代' | '40代' | '50代以上';

// 性別
export type Gender = '男性' | '女性' | 'その他' | '回答しない';

// 都道府県
export type Prefecture =
  | '北海道'
  | '青森県'
  | '岩手県'
  | '宮城県'
  | '秋田県'
  | '山形県'
  | '福島県'
  | '茨城県'
  | '栃木県'
  | '群馬県'
  | '埼玉県'
  | '千葉県'
  | '東京都'
  | '神奈川県'
  | '新潟県'
  | '富山県'
  | '石川県'
  | '福井県'
  | '山梨県'
  | '長野県'
  | '岐阜県'
  | '静岡県'
  | '愛知県'
  | '三重県'
  | '滋賀県'
  | '京都府'
  | '大阪府'
  | '兵庫県'
  | '奈良県'
  | '和歌山県'
  | '鳥取県'
  | '島根県'
  | '岡山県'
  | '広島県'
  | '山口県'
  | '徳島県'
  | '香川県'
  | '愛媛県'
  | '高知県'
  | '福岡県'
  | '佐賀県'
  | '長崎県'
  | '熊本県'
  | '大分県'
  | '宮崎県'
  | '鹿児島県'
  | '沖縄県'
  | '海外';

// ファン歴
export type FanDuration = '1年未満' | '1〜3年' | '3〜5年' | '5〜10年' | '10年以上';

// 活動スタイル
export type ActivityStyle = 'ライブ重視' | 'CD・グッズ重視' | 'SNS・配信重視' | 'バランス型';

// 投稿頻度
export type PostFrequency = '毎日' | '週に数回' | '週1回' | '月に数回' | '不定期';

// プロフィール設定（Step 3）
export interface ProfileSettings {
  // 公開設定
  isProfilePublic: boolean; // プロフィールを公開
  showAge: boolean; // 年齢を表示
  showLocation: boolean; // 地域を表示

  // 通知設定
  notifyLikes: boolean; // いいね通知
  notifyComments: boolean; // コメント通知
  notifyFollows: boolean; // フォロー通知
  notifyMessages: boolean; // メッセージ通知
}

// プロフィールデータ（全ステップ）
export interface ProfileData {
  // Step 1: 基本情報
  nickname: string; // ニックネーム
  age?: AgeGroup; // 年齢（任意）
  gender?: Gender; // 性別（任意）
  prefecture?: Prefecture; // 都道府県（任意）

  // Step 2: 音楽・ファン情報
  favoriteGroups: string[]; // 好きなグループ・アーティスト
  favoriteMembers: string[]; // 推しメンバー
  fanDuration?: FanDuration; // ファン歴（任意）
  activityStyle?: ActivityStyle; // 活動スタイル（任意）

  // Step 3: その他設定
  postFrequency?: PostFrequency; // 投稿頻度（任意）
  introduction?: string; // 自己紹介文（任意）
  settings: ProfileSettings; // プロフィール設定
}

// プロフィールセットアップの進行状況
export interface ProfileSetupState {
  currentStep: 1 | 2 | 3;
  data: Partial<ProfileData>;
  isComplete: boolean;
}
