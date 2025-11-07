import { supabase } from '../config/supabase';
import { AuthError, User, Session } from '@supabase/supabase-js';

/**
 * 認証サービス
 * Supabase Authを使用したユーザー認証機能を提供
 */

export interface SignUpParams {
  email: string;
  password: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface AuthResponse<T = User> {
  data: T | null;
  error: AuthError | Error | null;
}

export interface SessionResponse {
  data: Session | null;
  error: AuthError | Error | null;
}

/**
 * メールアドレスとパスワードで新規ユーザーを作成
 */
export const signUp = async ({
  email,
  password,
}: SignUpParams): Promise<AuthResponse<User>> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { data: null, error };
    }

    return { data: data.user, error: null };
  } catch (error) {
    return {
      data: null,
      error: error as Error,
    };
  }
};

/**
 * メールアドレスとパスワードでログイン
 */
export const signIn = async ({
  email,
  password,
}: SignInParams): Promise<AuthResponse<User>> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { data: null, error };
    }

    return { data: data.user, error: null };
  } catch (error) {
    return {
      data: null,
      error: error as Error,
    };
  }
};

/**
 * ログアウト
 */
export const signOut = async (): Promise<{ error: AuthError | Error | null }> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

/**
 * 現在のセッションを取得
 */
export const getSession = async (): Promise<SessionResponse> => {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return { data: null, error };
    }

    return { data: data.session, error: null };
  } catch (error) {
    return {
      data: null,
      error: error as Error,
    };
  }
};

/**
 * 現在のユーザー情報を取得
 */
export const getCurrentUser = async (): Promise<AuthResponse<User>> => {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      return { data: null, error };
    }

    return { data: data.user, error: null };
  } catch (error) {
    return {
      data: null,
      error: error as Error,
    };
  }
};

/**
 * パスワードリセットメールを送信
 */
export const sendPasswordResetEmail = async (
  email: string
): Promise<{ error: AuthError | Error | null }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'yourapp://reset-password', // アプリのディープリンク
    });

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

/**
 * パスワードを更新
 */
export const updatePassword = async (
  newPassword: string
): Promise<{ error: AuthError | Error | null }> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

/**
 * メールアドレスを更新
 */
export const updateEmail = async (
  newEmail: string
): Promise<{ error: AuthError | Error | null }> => {
  try {
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    });

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

/**
 * 認証状態の変化を監視
 */
export const onAuthStateChange = (
  callback: (event: string, session: Session | null) => void
) => {
  const { data } = supabase.auth.onAuthStateChange(callback);
  return data.subscription;
};

/**
 * エラーメッセージを日本語化
 */
export const getJapaneseErrorMessage = (error: AuthError | Error): string => {
  const message = error.message.toLowerCase();

  if (message.includes('invalid login credentials')) {
    return 'メールアドレスまたはパスワードが正しくありません';
  }

  if (message.includes('user already registered')) {
    return 'このメールアドレスは既に登録されています';
  }

  if (message.includes('email not confirmed')) {
    return 'メールアドレスの確認が完了していません';
  }

  if (message.includes('password should be at least')) {
    return 'パスワードは6文字以上で入力してください';
  }

  if (message.includes('invalid email')) {
    return '有効なメールアドレスを入力してください';
  }

  if (message.includes('network')) {
    return 'ネットワークエラーが発生しました。接続を確認してください';
  }

  // デフォルトエラーメッセージ
  return 'エラーが発生しました。もう一度お試しください';
};
