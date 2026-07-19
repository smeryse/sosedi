-- Migration: 202607190009_production_schema_consolidation.sql
-- Description: Consolidate and expand schema for commercial productionization. Adds missing tables, constraints, and fixes relationships.

-- 1. Device Sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_type TEXT,
  browser TEXT,
  ip_address TEXT, -- Note: Hashed or anonymized application-side
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- 2. User Settings
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT DEFAULT 'ru',
  timezone TEXT DEFAULT 'Europe/Moscow',
  reduced_motion BOOLEAN DEFAULT false,
  high_contrast BOOLEAN DEFAULT false,
  message_privacy TEXT DEFAULT 'everyone' CHECK (message_privacy IN ('everyone', 'verified', 'none')),
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'verified', 'hidden')),
  ai_consent BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Social Blocks & Invitations
CREATE TABLE IF NOT EXISTS public.candidate_blocks (
  blocker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id)
);

CREATE TABLE IF NOT EXISTS public.group_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  inviter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  invitee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Message Enhancements (Idempotency, Reactions, Edits, Deletions)
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS client_generated_id UUID UNIQUE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS reply_to_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.message_reactions (
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id, emoji)
);

CREATE TABLE IF NOT EXISTS public.message_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  old_body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversation_pins (
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  pinned_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (conversation_id, message_id)
);

CREATE TABLE IF NOT EXISTS public.user_message_hidden (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  hidden_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, message_id)
);

-- 5. Read Receipts & Unread Counts
ALTER TABLE public.conversation_members ADD COLUMN IF NOT EXISTS last_read_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL;
ALTER TABLE public.conversation_members ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
ALTER TABLE public.conversation_members ADD COLUMN IF NOT EXISTS muted_until TIMESTAMPTZ;

-- 6. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  title TEXT,
  body TEXT,
  action_url TEXT,
  read_at TIMESTAMPTZ,
  deduplication_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notification_settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  marketing_enabled BOOLEAN DEFAULT false,
  types_config JSONB DEFAULT '{}'::jsonb
);

-- 7. Chore Engine
CREATE TABLE IF NOT EXISTS public.chore_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chore_id UUID REFERENCES public.chores(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chore_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chore_id UUID REFERENCES public.chores(id) ON DELETE CASCADE,
  completed_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  note TEXT
);

-- 8. Expenses exact integer math
-- Currently expenses has total_amount INT.
CREATE TABLE IF NOT EXISTS public.settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  payer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  payee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 9. Moderation & Reports
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('profile', 'message', 'property', 'group')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Simulation & 3D Ext.
CREATE TABLE IF NOT EXISTS public.room_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  room_id TEXT NOT NULL,
  assignee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  version INT DEFAULT 1,
  UNIQUE (property_id, room_id)
);

CREATE TABLE IF NOT EXISTS public.simulation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  scenario_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Constraints and Indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON public.messages(conversation_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_group_invitations_status ON public.group_invitations(invitee_id, status);

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ 
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name IN ('user_settings', 'group_invitations', 'reports')
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I;
      CREATE TRIGGER update_%I_updated_at
      BEFORE UPDATE ON public.%I
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    ', t, t, t, t);
  END LOOP;
END;
$$;
