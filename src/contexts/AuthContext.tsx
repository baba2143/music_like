import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import * as authService from '../services/authService';

/**
 * 認証コンテキスト
 * アプリ全体で認証状態を共有
 */

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string) => Promise<authService.AuthResponse<User>>;
  signIn: (email: string, password: string) => Promise<authService.AuthResponse<User>>;
  signOut: () => Promise<{ error: Error | null }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初期化時にセッションを復元
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 保存されているセッションを取得
        const { data: sessionData } = await authService.getSession();
        if (sessionData) {
          setSession(sessionData);
          setUser(sessionData.user);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // 認証状態の変化を監視
    const subscription = authService.onAuthStateChange((event, newSession) => {
      console.log('Auth state changed:', event);
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * サインアップ
   */
  const signUp = async (
    email: string,
    password: string
  ): Promise<authService.AuthResponse<User>> => {
    setIsLoading(true);
    try {
      const response = await authService.signUp({ email, password });

      if (response.data) {
        setUser(response.data);
      }

      return response;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * サインイン
   */
  const signIn = async (
    email: string,
    password: string
  ): Promise<authService.AuthResponse<User>> => {
    setIsLoading(true);
    try {
      const response = await authService.signIn({ email, password });

      if (response.data) {
        setUser(response.data);
        // セッションも更新
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

  /**
   * サインアウト
   */
  const signOut = async (): Promise<{ error: Error | null }> => {
    setIsLoading(true);
    try {
      const { error } = await authService.signOut();

      if (!error) {
        setUser(null);
        setSession(null);
      }

      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * ユーザー情報を再取得
   */
  const refreshUser = async (): Promise<void> => {
    try {
      const { data: userData } = await authService.getCurrentUser();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * 認証コンテキストを使用するカスタムフック
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
