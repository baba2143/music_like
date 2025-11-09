// ユーザー情報
export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  oshiGroup?: string; // 推しグループ
  oshiMember?: string; // 推しメンバー
  gender?: 'male' | 'female' | 'other' | 'private'; // 性別
  birthDate?: Date; // 誕生日
  location?: string; // 居住地
  fanYears?: string; // ファン歴
  supportAmount?: string; // 支援金額の範囲
  otakuStyles?: string[]; // オタ活スタイル（複数選択）
  supporterWelcome?: 'yes' | 'no'; // 同担歓迎設定
  eventFrequency?: 'frequent' | 'sometimes' | 'rarely'; // 現場参加頻度
  createdAt: Date;
}

// 投稿タイプ
export type PostType = 'playlist' | 'track' | 'text';

// 投稿
export interface Post {
  id: string;
  userId: string;
  author: User; // ユーザー情報を含む
  contentType: PostType;
  caption?: string;
  hashtags?: string[];

  // プレイリスト投稿の場合
  playlistUrl?: string;
  playlistTitle?: string;
  playlistThumbnail?: string;
  playlistTrackCount?: number;
  playlistService?: 'spotify' | 'apple_music' | 'youtube_music';

  // 今聴いてる曲投稿の場合
  trackTitle?: string;
  trackArtist?: string;
  trackAlbum?: string;
  trackThumbnail?: string;
  trackUrl?: string;

  // エンゲージメント
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  isLiked: boolean; // 現在のユーザーがいいねしているか
  isSaved: boolean; // 現在のユーザーが保存しているか

  createdAt: Date;
  updatedAt: Date;
}

// プレイリスト情報
export interface Playlist {
  id: string;
  title: string;
  thumbnail?: string;
  trackCount: number;
  service: 'spotify' | 'apple_music' | 'youtube_music';
  url: string;
}

// 楽曲情報
export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  thumbnail?: string;
  url?: string;
  duration?: number; // 秒
}

// コメント
export interface Comment {
  id: string;
  postId: string;
  userId: string;
  author: User;
  content: string;
  createdAt: Date;
}

// いいね
export interface Like {
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
}

// フォロー
export interface Follow {
  id: string;
  followerId: string; // フォローする人
  followingId: string; // フォローされる人
  createdAt: Date;
}

// 通知タイプ
export type NotificationType = 'like' | 'comment' | 'follow' | 'mention';

// 通知
export interface Notification {
  id: string;
  userId: string; // 通知を受け取るユーザー
  type: NotificationType;
  actorId: string; // 通知を発生させたユーザー
  actor: User;
  postId?: string;
  commentId?: string;
  isRead: boolean;
  createdAt: Date;
}

// アイドルグループ情報
export interface IdolGroup {
  id: string;
  name: string;
  category: 'nogizaka' | 'hinata' | 'sakura' | 'hello' | 'johnny' | 'other';
  members?: string[];
}

// 投稿作成用の型
export interface CreatePostInput {
  contentType: PostType;
  caption?: string;
  hashtags?: string[];
  // プレイリスト投稿用
  playlistUrl?: string;
  playlistTitle?: string;
  playlistThumbnail?: string;
  playlistTrackCount?: number;
  playlistService?: 'spotify' | 'apple_music' | 'youtube_music';
  // トラック投稿用
  trackTitle?: string;
  trackArtist?: string;
  trackAlbum?: string;
  trackThumbnail?: string;
  trackUrl?: string;
}

// アーティスト情報（ユーザー生成）
export interface Artist {
  id: string;
  name: string; // 表示名（ユーザーが入力した形式）
  normalizedName: string; // 正規化名（重複チェック用）
  createdBy: string; // 作成したユーザーID
  usageCount: number; // 何人のユーザーが選択しているか
  createdAt: Date;
  updatedAt: Date;
}

// フィードの型（ページネーション用）
export interface FeedResponse {
  posts: Post[];
  nextCursor?: string;
  hasMore: boolean;
}
