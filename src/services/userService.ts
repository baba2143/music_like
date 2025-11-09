import { supabase } from '../config/supabase';
import { User } from '../types/models';

/**
 * ユーザーサービス
 * ユーザープロフィール関連のCRUD操作を提供
 */

export interface CreateUserProfileParams {
  id: string; // auth.users.id
  username: string;
  displayName: string;
  bio?: string;
  oshiGroup?: string;
  oshiMember?: string;
}

export interface UpdateUserProfileParams {
  username?: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  oshiGroup?: string;
  oshiMember?: string;
  gender?: 'male' | 'female' | 'other' | 'private';
  birthDate?: Date;
  location?: string;
  fanYears?: string;
  supportAmount?: string;
  otakuStyles?: string[];
  supporterWelcome?: 'yes' | 'no';
  eventFrequency?: 'frequent' | 'sometimes' | 'rarely';
}

export interface UserServiceResponse<T = User> {
  data: T | null;
  error: Error | null;
}

export interface UsernameCheckResponse {
  isAvailable: boolean;
  error: Error | null;
}

/**
 * ユーザープロフィールを作成
 * サインアップ後に呼び出される
 */
export const createUserProfile = async (
  params: CreateUserProfileParams
): Promise<UserServiceResponse<User>> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: params.id,
        username: params.username,
        display_name: params.displayName,
        bio: params.bio || null,
        oshi_group: params.oshiGroup || null,
        oshi_member: params.oshiMember || null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Supabaseのスネークケースをキャメルケースに変換
    const user = mapDatabaseUserToUser(data);

    return { data: user, error: null };
  } catch (error) {
    console.error('Failed to create user profile:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * ユーザープロフィールを取得（ID指定）
 */
export const getUserProfile = async (userId: string): Promise<UserServiceResponse<User>> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return { data: null, error: new Error('User profile not found') };
    }

    const user = mapDatabaseUserToUser(data);

    return { data: user, error: null };
  } catch (error) {
    console.error('Failed to get user profile:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * ユーザープロフィールを取得（ユーザー名指定）
 */
export const getUserByUsername = async (
  username: string
): Promise<UserServiceResponse<User>> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return { data: null, error: new Error('User not found') };
    }

    const user = mapDatabaseUserToUser(data);

    return { data: user, error: null };
  } catch (error) {
    console.error('Failed to get user by username:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * ユーザープロフィールを更新
 */
export const updateUserProfile = async (
  userId: string,
  updates: UpdateUserProfileParams
): Promise<UserServiceResponse<User>> => {
  try {
    // スネークケースに変換
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.username !== undefined) updateData.username = updates.username;
    if (updates.displayName !== undefined) updateData.display_name = updates.displayName;
    if (updates.bio !== undefined) updateData.bio = updates.bio;
    if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl;
    if (updates.oshiGroup !== undefined) updateData.oshi_group = updates.oshiGroup;
    if (updates.oshiMember !== undefined) updateData.oshi_member = updates.oshiMember;
    if (updates.gender !== undefined) updateData.gender = updates.gender;
    if (updates.birthDate !== undefined) updateData.birth_date = updates.birthDate?.toISOString().split('T')[0];
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.fanYears !== undefined) updateData.fan_years = updates.fanYears;
    if (updates.supportAmount !== undefined) updateData.support_amount = updates.supportAmount;
    if (updates.otakuStyles !== undefined) updateData.otaku_styles = updates.otakuStyles;
    if (updates.supporterWelcome !== undefined) updateData.supporter_welcome = updates.supporterWelcome;
    if (updates.eventFrequency !== undefined) updateData.event_frequency = updates.eventFrequency;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    const user = mapDatabaseUserToUser(data);

    return { data: user, error: null };
  } catch (error) {
    console.error('Failed to update user profile:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * ユーザー名の利用可能性をチェック
 */
export const checkUsernameAvailability = async (
  username: string
): Promise<UsernameCheckResponse> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      throw error;
    }

    // データが存在しない = 利用可能
    return { isAvailable: !data, error: null };
  } catch (error) {
    console.error('Failed to check username availability:', error);
    return { isAvailable: false, error: error as Error };
  }
};

/**
 * ユーザー検索（部分一致）
 */
export const searchUsers = async (
  query: string,
  limit: number = 20
): Promise<{ data: User[]; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(limit);

    if (error) {
      throw error;
    }

    const users: User[] = (data || []).map((item) => mapDatabaseUserToUser(item));

    return { data: users, error: null };
  } catch (error) {
    console.error('Failed to search users:', error);
    return { data: [], error: error as Error };
  }
};

/**
 * 複数ユーザーの情報を取得
 */
export const getUsersByIds = async (
  userIds: string[]
): Promise<{ data: User[]; error: Error | null }> => {
  try {
    if (userIds.length === 0) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase.from('users').select('*').in('id', userIds);

    if (error) {
      throw error;
    }

    const users: User[] = (data || []).map((item) => mapDatabaseUserToUser(item));

    return { data: users, error: null };
  } catch (error) {
    console.error('Failed to get users by ids:', error);
    return { data: [], error: error as Error };
  }
};

/**
 * データベース行をUserオブジェクトにマッピング
 */
function mapDatabaseUserToUser(data: any): User {
  return {
    id: data.id,
    username: data.username,
    displayName: data.display_name,
    bio: data.bio,
    avatarUrl: data.avatar_url,
    oshiGroup: data.oshi_group,
    oshiMember: data.oshi_member,
    gender: data.gender,
    birthDate: data.birth_date ? new Date(data.birth_date) : undefined,
    location: data.location,
    fanYears: data.fan_years,
    supportAmount: data.support_amount,
    otakuStyles: data.otaku_styles || [],
    supporterWelcome: data.supporter_welcome,
    eventFrequency: data.event_frequency,
    createdAt: new Date(data.created_at),
  };
}
