/**
 * プロフィール編集フォームで使用する選択肢の定数定義
 */

// オタ活スタイルの選択肢（複数選択可）
export const OTAKU_STYLES = [
  'ライブ参戦',
  'グッズ収集',
  '聖地巡礼',
  'イベント参加',
  'CD/配信購入',
  'SNS活動',
  '推し活シェア',
  'ファンクラブ会員',
] as const;

// 支援金額の範囲選択肢
export const SUPPORT_AMOUNTS = [
  '~1万円/月',
  '1-3万円/月',
  '3-5万円/月',
  '5-10万円/月',
  '10万円以上/月',
] as const;

// ファン歴の範囲選択肢
export const FAN_YEARS = [
  '1年未満',
  '1-3年',
  '3-5年',
  '5-10年',
  '10年以上',
] as const;

// 性別の選択肢
export const GENDERS = [
  { label: '男性', value: 'male' as const },
  { label: '女性', value: 'female' as const },
  { label: 'その他', value: 'other' as const },
  { label: '回答しない', value: 'private' as const },
] as const;

// 性別の値から表示名を取得
export const getGenderLabel = (value: string | undefined): string => {
  if (!value) return '未設定';
  const gender = GENDERS.find((g) => g.value === value);
  return gender ? gender.label : '未設定';
};

// 同担歓迎設定の選択肢
export const SUPPORTER_WELCOME = [
  { label: '利用する', value: 'yes' as const },
  { label: '利用しない', value: 'no' as const },
] as const;

// 現場参加頻度の選択肢
export const EVENT_FREQUENCY = [
  { label: '頻繁に参加', value: 'frequent' as const },
  { label: '時々参加', value: 'sometimes' as const },
  { label: 'ほとんど参加しない', value: 'rarely' as const },
] as const;
