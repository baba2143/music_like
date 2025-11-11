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
  // フォロー関連フィールド
  followersCount?: number; // フォロワー数
  followingCount?: number; // フォロー中の数
  isFollowing?: boolean; // 現在のユーザーがフォローしているか
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

  // プレイリスト投稿の場合（外部サービス）
  playlistUrl?: string;
  playlistTitle?: string;
  playlistThumbnail?: string;
  playlistTrackCount?: number;
  playlistService?: 'spotify' | 'apple_music' | 'youtube_music';

  // プレイリスト投稿の場合（アプリ内プレイリスト）
  internalPlaylistId?: string;
  internalPlaylist?: Playlist;

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

// 外部サービスのプレイリスト情報（投稿用）
export interface ExternalPlaylist {
  id: string;
  title: string;
  thumbnail?: string;
  trackCount: number;
  service: 'spotify' | 'apple_music' | 'youtube_music';
  url: string;
}

// アプリ内プレイリスト
export interface Playlist {
  id: string;
  userId: string;
  user?: User; // 作成者情報
  title: string;
  description?: string;
  coverImageUrl?: string;
  isPublic: boolean;
  tracksCount: number;
  tracks?: PlaylistTrack[]; // プレイリスト内の曲リスト
  createdAt: Date;
  updatedAt: Date;
}

// 楽曲情報（アプリ内管理）
export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  thumbnailUrl?: string;
  externalUrl?: string;
  service?: 'spotify' | 'apple_music' | 'youtube_music' | 'manual';
  externalId?: string;
  createdAt: Date;
}

// プレイリスト-曲の中間テーブル
export interface PlaylistTrack {
  id: string;
  playlistId: string;
  trackId: string;
  track?: Track; // 曲情報
  position: number;
  addedByUserId: string;
  addedBy?: User; // 追加したユーザー情報
  createdAt: Date;
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
  // プレイリスト投稿用（外部サービス）
  playlistUrl?: string;
  playlistTitle?: string;
  playlistThumbnail?: string;
  playlistTrackCount?: number;
  playlistService?: 'spotify' | 'apple_music' | 'youtube_music';
  // プレイリスト投稿用（アプリ内）
  internalPlaylistId?: string;
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

// DM（ダイレクトメッセージ）関連の型
export interface Conversation {
  id: string;
  participant1Id: string;
  participant2Id: string;
  participant1: User;
  participant2: User;
  lastMessageId?: string;
  lastMessage?: Message;
  lastMessageAt?: Date;
  unreadCount?: number; // フロントエンド用
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: User;
  content: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}
