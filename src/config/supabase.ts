import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// 環境変数からSupabase設定を取得
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.SUPABASE_URL || '';
const supabaseAnonKey =
  Constants.expoConfig?.extra?.supabaseAnonKey || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase URL and Anon Key are required. ' +
      'Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.'
  );
}

// Supabaseクライアントを作成
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, // AsyncStorageでセッションを永続化
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
