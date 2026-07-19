-- Migration: 202607190001_chat_enhancements.sql
-- Description: Add group_id to conversations, extra fields to messages, message_reactions table, and RLS policies

-- 1. Add group_id to conversations if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversations' AND column_name = 'group_id'
  ) THEN 
    ALTER TABLE public.conversations ADD COLUMN group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2. Add is_pinned and last_read_at to conversation_members if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversation_members' AND column_name = 'is_pinned'
  ) THEN 
    ALTER TABLE public.conversation_members ADD COLUMN is_pinned BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversation_members' AND column_name = 'last_read_at'
  ) THEN 
    ALTER TABLE public.conversation_members ADD COLUMN last_read_at TIMESTAMPTZ;
  END IF;
END $$;

-- 3. Add reply_to_id and extra_data to messages if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'reply_to_id'
  ) THEN 
    ALTER TABLE public.messages ADD COLUMN reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'extra_data'
  ) THEN 
    ALTER TABLE public.messages ADD COLUMN extra_data JSONB DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'edited_at'
  ) THEN 
    ALTER TABLE public.messages ADD COLUMN edited_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'deleted_at'
  ) THEN 
    ALTER TABLE public.messages ADD COLUMN deleted_at TIMESTAMPTZ;
  END IF;
END $$;

-- 4. Create message_reactions table if not exists
CREATE TABLE IF NOT EXISTS public.message_reactions (
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (message_id, profile_id, emoji)
);

-- 5. Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- 6. Conversations Policies
DROP POLICY IF EXISTS "Conversation members can view conversations." ON public.conversations;
CREATE POLICY "Conversation members can view conversations." ON public.conversations
  FOR SELECT USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.conversation_members cm 
      WHERE cm.conversation_id = conversations.id AND cm.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authenticated users can create conversations." ON public.conversations;
CREATE POLICY "Authenticated users can create conversations." ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Members can update conversations." ON public.conversations;
CREATE POLICY "Members can update conversations." ON public.conversations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.conversation_members cm 
      WHERE cm.conversation_id = conversations.id AND cm.profile_id = auth.uid()
    )
  );

-- 7. Conversation Members Policies
DROP POLICY IF EXISTS "Members can view conversation members." ON public.conversation_members;
CREATE POLICY "Members can view conversation members." ON public.conversation_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_members cm 
      WHERE cm.conversation_id = conversation_members.conversation_id AND cm.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Members can add or be added to conversations." ON public.conversation_members;
CREATE POLICY "Members can add or be added to conversations." ON public.conversation_members
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Members can update their own membership." ON public.conversation_members;
CREATE POLICY "Members can update their own membership." ON public.conversation_members
  FOR UPDATE USING (profile_id = auth.uid());

-- 8. Messages Policies
DROP POLICY IF EXISTS "Members can view messages." ON public.messages;
CREATE POLICY "Members can view messages." ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_members cm 
      WHERE cm.conversation_id = messages.conversation_id AND cm.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Members can send messages." ON public.messages;
CREATE POLICY "Members can send messages." ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.conversation_members cm 
      WHERE cm.conversation_id = conversation_id AND cm.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Senders can edit or delete their messages." ON public.messages;
CREATE POLICY "Senders can edit or delete their messages." ON public.messages
  FOR UPDATE USING (sender_id = auth.uid());

-- 9. Message Reactions Policies
DROP POLICY IF EXISTS "Members can view reactions." ON public.message_reactions;
CREATE POLICY "Members can view reactions." ON public.message_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.conversation_members cm ON cm.conversation_id = m.conversation_id
      WHERE m.id = message_reactions.message_id AND cm.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Members can toggle their reactions." ON public.message_reactions;
CREATE POLICY "Members can toggle their reactions." ON public.message_reactions
  FOR INSERT WITH CHECK (
    profile_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.conversation_members cm ON cm.conversation_id = m.conversation_id
      WHERE m.id = message_id AND cm.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can remove their reactions." ON public.message_reactions;
CREATE POLICY "Users can remove their reactions." ON public.message_reactions
  FOR DELETE USING (profile_id = auth.uid());
