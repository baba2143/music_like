import { supabase } from '../config/supabase';
import { Message, User } from '../types/models';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * メッセージサービス
 * DM（ダイレクトメッセージ）のメッセージ管理を提供
 */

export interface MessageServiceResponse {
  data: Message[];
  error: Error | null;
}

export interface SingleMessageServiceResponse {
  data: Message | null;
  error: Error | null;
}

/**
 * 会話のメッセージ一覧を取得
 */
export const getMessages = async (
  conversationId: string,
  limit: number = 50
): Promise<MessageServiceResponse> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(
        `
        *,
        sender:users!messages_sender_id_fkey (
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
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      throw error;
    }

    const messages: Message[] = data.map((item: any) =>
      mapDatabaseMessageToMessage(item)
    );

    return { data: messages, error: null };
  } catch (error) {
    console.error('Failed to get messages:', error);
    return { data: [], error: error as Error };
  }
};

/**
 * メッセージを送信
 */
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string
): Promise<SingleMessageServiceResponse> => {
  try {
    if (!content.trim()) {
      return { data: null, error: new Error('メッセージが空です') };
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: content.trim(),
      })
      .select(
        `
        *,
        sender:users!messages_sender_id_fkey (
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

    const message = mapDatabaseMessageToMessage(data);

    return { data: message, error: null };
  } catch (error) {
    console.error('Failed to send message:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * メッセージを既読にする
 */
export const markMessageAsRead = async (
  messageId: string,
  userId: string
): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId)
      .neq('sender_id', userId); // 送信者自身のメッセージは既読にしない

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('Failed to mark message as read:', error);
    return { error: error as Error };
  }
};

/**
 * 会話内のすべてのメッセージを既読にする
 */
export const markConversationAsRead = async (
  conversationId: string,
  userId: string
): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId) // 送信者自身のメッセージは既読にしない
      .eq('is_read', false); // 未読のメッセージのみ更新

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('Failed to mark conversation as read:', error);
    return { error: error as Error };
  }
};

/**
 * メッセージを削除
 */
export const deleteMessage = async (
  messageId: string,
  userId: string
): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('sender_id', userId); // 送信者のみが削除可能

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('Failed to delete message:', error);
    return { error: error as Error };
  }
};

/**
 * 会話の未読メッセージ数を取得
 */
export const getUnreadCount = async (
  conversationId: string,
  userId: string
): Promise<{ count: number; error: Error | null }> => {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) {
      throw error;
    }

    return { count: count || 0, error: null };
  } catch (error) {
    console.error('Failed to get unread count:', error);
    return { count: 0, error: error as Error };
  }
};

/**
 * リアルタイムでメッセージを購読
 */
export const subscribeToMessages = (
  conversationId: string,
  onMessageReceived: (message: Message) => void,
  onMessageUpdated: (message: Message) => void,
  onMessageDeleted: (messageId: string) => void
): RealtimeChannel => {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      async (payload) => {
        // 新しいメッセージを取得（送信者情報を含む）
        const { data, error } = await supabase
          .from('messages')
          .select(
            `
            *,
            sender:users!messages_sender_id_fkey (
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
          .eq('id', payload.new.id)
          .single();

        if (!error && data) {
          const message = mapDatabaseMessageToMessage(data);
          onMessageReceived(message);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      async (payload) => {
        // 更新されたメッセージを取得
        const { data, error } = await supabase
          .from('messages')
          .select(
            `
            *,
            sender:users!messages_sender_id_fkey (
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
          .eq('id', payload.new.id)
          .single();

        if (!error && data) {
          const message = mapDatabaseMessageToMessage(data);
          onMessageUpdated(message);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onMessageDeleted(payload.old.id);
      }
    )
    .subscribe();

  return channel;
};

/**
 * メッセージ購読を解除
 */
export const unsubscribeFromMessages = async (
  channel: RealtimeChannel
): Promise<void> => {
  await supabase.removeChannel(channel);
};

/**
 * データベースのメッセージデータをMessageオブジェクトに変換
 */
function mapDatabaseMessageToMessage(data: any): Message {
  const sender: User = {
    id: data.sender.id,
    username: data.sender.username,
    displayName: data.sender.display_name,
    avatarUrl: data.sender.avatar_url,
    bio: data.sender.bio,
    oshiGroup: data.sender.oshi_group,
    oshiMember: data.sender.oshi_member,
    createdAt: new Date(data.sender.created_at),
  };

  return {
    id: data.id,
    conversationId: data.conversation_id,
    senderId: data.sender_id,
    sender,
    content: data.content,
    isRead: data.is_read,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}
