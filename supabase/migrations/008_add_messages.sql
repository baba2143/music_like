-- =============================================
-- DM（ダイレクトメッセージ）機能
-- =============================================

-- =============================================
-- テーブル: conversations (会話)
-- =============================================
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant1_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  participant2_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  last_message_id UUID,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- 自分自身との会話は禁止
  CONSTRAINT no_self_conversation CHECK (participant1_id != participant2_id)
  -- 注: 会話の一意性はユニークインデックスで保証（インデックスセクション参照）
);

-- =============================================
-- テーブル: messages (メッセージ)
-- =============================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- インデックス
-- =============================================
-- conversationsテーブル
CREATE INDEX idx_conversations_participant1 ON public.conversations(participant1_id);
CREATE INDEX idx_conversations_participant2 ON public.conversations(participant2_id);
CREATE INDEX idx_conversations_last_message_at ON public.conversations(last_message_at DESC);

-- 会話の一意性を保証するインデックス（同じユーザー同士の会話は1つだけ）
CREATE UNIQUE INDEX unique_conversation_participants
  ON public.conversations (
    LEAST(participant1_id, participant2_id),
    GREATEST(participant1_id, participant2_id)
  );

-- messagesテーブル
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_is_read ON public.messages(is_read) WHERE is_read = FALSE;

-- =============================================
-- RLS (Row Level Security) ポリシー
-- =============================================

-- conversationsテーブルのRLS有効化
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- conversationsの参加者のみが閲覧可能
CREATE POLICY "Users can view their own conversations"
  ON public.conversations
  FOR SELECT
  USING (
    auth.uid() = participant1_id OR auth.uid() = participant2_id
  );

-- conversationsの作成は認証済みユーザーのみ
CREATE POLICY "Authenticated users can create conversations"
  ON public.conversations
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (participant1_id, participant2_id)
  );

-- conversationsの更新は参加者のみ
CREATE POLICY "Participants can update conversations"
  ON public.conversations
  FOR UPDATE
  USING (
    auth.uid() = participant1_id OR auth.uid() = participant2_id
  );

-- messagesテーブルのRLS有効化
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- messagesは会話の参加者のみが閲覧可能
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
        AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
    )
  );

-- messagesの作成は会話の参加者のみ
CREATE POLICY "Participants can send messages"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = conversation_id
        AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
    )
  );

-- messagesの更新（既読状態など）は会話の参加者のみ
CREATE POLICY "Participants can update messages"
  ON public.messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
        AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
    )
  );

-- messagesの削除は送信者のみ
CREATE POLICY "Senders can delete their own messages"
  ON public.messages
  FOR DELETE
  USING (sender_id = auth.uid());

-- =============================================
-- トリガー: updated_at自動更新
-- =============================================
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- トリガー: conversationのlast_message自動更新
-- =============================================
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.conversations
    SET
      last_message_id = NEW.id,
      last_message_at = NEW.created_at,
      updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    -- メッセージ削除時は最新のメッセージを再取得
    UPDATE public.conversations
    SET
      last_message_id = (
        SELECT id FROM public.messages
        WHERE conversation_id = OLD.conversation_id
        ORDER BY created_at DESC
        LIMIT 1
      ),
      last_message_at = (
        SELECT created_at FROM public.messages
        WHERE conversation_id = OLD.conversation_id
        ORDER BY created_at DESC
        LIMIT 1
      ),
      updated_at = NOW()
    WHERE id = OLD.conversation_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_last_message_on_insert
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

CREATE TRIGGER update_conversation_last_message_on_delete
  AFTER DELETE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();
