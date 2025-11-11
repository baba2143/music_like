import { supabase } from '../config/supabase';
import { Conversation, User, Message } from '../types/models';
import { checkIsFollowing } from './followService';

/**
 * 会話サービス
 * DM会話の管理を提供
 */

export interface ConversationServiceResponse {
  data: Conversation | null;
  error: Error | null;
}

export interface ConversationsServiceResponse {
  data: Conversation[];
  error: Error | null;
}

/**
 * ユーザーの会話一覧を取得
 */
export const getConversations = async (
  userId: string
): Promise<ConversationsServiceResponse> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(
        `
        *,
        participant1:users!conversations_participant1_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          bio,
          oshi_group,
          oshi_member,
          created_at
        ),
        participant2:users!conversations_participant2_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          bio,
          oshi_group,
          oshi_member,
          created_at
        )
      `
      )
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (error) {
      throw error;
    }

    const conversations = data.map((conv: any) =>
      mapDatabaseConversationToConversation(conv, userId)
    );

    return { data: conversations, error: null };
  } catch (error) {
    console.error('Failed to get conversations:', error);
    return { data: [], error: error as Error };
  }
};

/**
 * 特定のユーザーとの会話を取得
 */
export const getConversation = async (
  currentUserId: string,
  otherUserId: string
): Promise<ConversationServiceResponse> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(
        `
        *,
        participant1:users!conversations_participant1_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          bio,
          oshi_group,
          oshi_member,
          created_at
        ),
        participant2:users!conversations_participant2_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          bio,
          oshi_group,
          oshi_member,
          created_at
        )
      `
      )
      .or(
        `and(participant1_id.eq.${currentUserId},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${currentUserId})`
      )
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!data) {
      return { data: null, error: null };
    }

    const conversation = mapDatabaseConversationToConversation(data, currentUserId);

    return { data: conversation, error: null };
  } catch (error) {
    console.error('Failed to get conversation:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * 会話を取得または作成
 */
export const getOrCreateConversation = async (
  currentUserId: string,
  otherUserId: string
): Promise<ConversationServiceResponse> => {
  try {
    // フォロー状態を確認
    const { isFollowing, error: followError } = await checkIsFollowing(currentUserId, otherUserId);

    if (followError) {
      return { data: null, error: followError };
    }

    if (!isFollowing) {
      return {
        data: null,
        error: new Error('このユーザーをフォローしていないため、メッセージを送信できません')
      };
    }

    // 既存の会話を確認
    const existingResult = await getConversation(currentUserId, otherUserId);

    if (existingResult.error) {
      return existingResult;
    }

    if (existingResult.data) {
      return existingResult;
    }

    // 会話が存在しない場合は作成
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        participant1_id: currentUserId,
        participant2_id: otherUserId,
      })
      .select(
        `
        *,
        participant1:users!conversations_participant1_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          bio,
          oshi_group,
          oshi_member,
          created_at
        ),
        participant2:users!conversations_participant2_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          bio,
          oshi_group,
          oshi_member,
          created_at
        )
      `
      )
      .single();

    if (error) {
      throw error;
    }

    const conversation = mapDatabaseConversationToConversation(data, currentUserId);

    return { data: conversation, error: null };
  } catch (error) {
    console.error('Failed to get or create conversation:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * 会話を削除
 */
export const deleteConversation = async (
  conversationId: string,
  userId: string
): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`);

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('Failed to delete conversation:', error);
    return { error: error as Error };
  }
};

/**
 * データベースの会話データをConversationオブジェクトに変換
 */
function mapDatabaseConversationToConversation(
  data: any,
  currentUserId: string
): Conversation {
  const participant1: User = {
    id: data.participant1.id,
    username: data.participant1.username,
    displayName: data.participant1.display_name,
    avatarUrl: data.participant1.avatar_url,
    bio: data.participant1.bio,
    oshiGroup: data.participant1.oshi_group,
    oshiMember: data.participant1.oshi_member,
    createdAt: new Date(data.participant1.created_at),
  };

  const participant2: User = {
    id: data.participant2.id,
    username: data.participant2.username,
    displayName: data.participant2.display_name,
    avatarUrl: data.participant2.avatar_url,
    bio: data.participant2.bio,
    oshiGroup: data.participant2.oshi_group,
    oshiMember: data.participant2.oshi_member,
    createdAt: new Date(data.participant2.created_at),
  };

  return {
    id: data.id,
    participant1Id: data.participant1_id,
    participant2Id: data.participant2_id,
    participant1,
    participant2,
    lastMessageId: data.last_message_id,
    lastMessage: undefined,
    lastMessageAt: data.last_message_at ? new Date(data.last_message_at) : undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}
