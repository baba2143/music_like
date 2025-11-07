// 認証プロバイダー
export type AuthProvider = 'apple' | 'line' | 'google';

// ユーザー情報（基本）
export interface User {
  id: string;
  username: string;
  avatarUrl?: string;
  createdAt: Date;
}

// 認証状態
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}
