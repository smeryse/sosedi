-- Migration: 202607190008_demo_schema_enhancements.sql
-- Description: Add is_demo and seed_key columns, notification tables, and enforce strict RLS policies for demo & production entities

-- 1. Profiles Enhancements
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_demo') THEN 
    ALTER TABLE public.profiles ADD COLUMN is_demo BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'seed_key') THEN 
    ALTER TABLE public.profiles ADD COLUMN seed_key TEXT UNIQUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'age') THEN 
    ALTER TABLE public.profiles ADD COLUMN age INT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'job_title') THEN 
    ALTER TABLE public.profiles ADD COLUMN job_title TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'city') THEN 
    ALTER TABLE public.profiles ADD COLUMN city TEXT DEFAULT 'Краснодар';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'budget_min') THEN 
    ALTER TABLE public.profiles ADD COLUMN budget_min INT DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'budget_max') THEN 
    ALTER TABLE public.profiles ADD COLUMN budget_max INT DEFAULT 100000;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'move_in_date') THEN 
    ALTER TABLE public.profiles ADD COLUMN move_in_date DATE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'lease_months') THEN 
    ALTER TABLE public.profiles ADD COLUMN lease_months INT DEFAULT 12;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'archived_at') THEN 
    ALTER TABLE public.profiles ADD COLUMN archived_at TIMESTAMPTZ;
  END IF;
END $$;

-- 2. Properties Enhancements
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'is_demo') THEN 
    ALTER TABLE public.properties ADD COLUMN is_demo BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'seed_key') THEN 
    ALTER TABLE public.properties ADD COLUMN seed_key TEXT UNIQUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'status') THEN 
    ALTER TABLE public.properties ADD COLUMN status TEXT DEFAULT 'published';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'description') THEN 
    ALTER TABLE public.properties ADD COLUMN description TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'area') THEN 
    ALTER TABLE public.properties ADD COLUMN area NUMERIC DEFAULT 35;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'rooms') THEN 
    ALTER TABLE public.properties ADD COLUMN rooms INT DEFAULT 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'total_floors') THEN 
    ALTER TABLE public.properties ADD COLUMN total_floors INT DEFAULT 9;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'archived_at') THEN 
    ALTER TABLE public.properties ADD COLUMN archived_at TIMESTAMPTZ;
  END IF;
END $$;

-- 3. Groups & Applications Enhancements
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'is_demo') THEN 
    ALTER TABLE public.groups ADD COLUMN is_demo BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'seed_key') THEN 
    ALTER TABLE public.groups ADD COLUMN seed_key TEXT UNIQUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'move_in_date') THEN 
    ALTER TABLE public.groups ADD COLUMN move_in_date DATE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'is_demo') THEN 
    ALTER TABLE public.applications ADD COLUMN is_demo BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'seed_key') THEN 
    ALTER TABLE public.applications ADD COLUMN seed_key TEXT UNIQUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'viewing_date') THEN 
    ALTER TABLE public.applications ADD COLUMN viewing_date DATE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'viewing_time_slot') THEN 
    ALTER TABLE public.applications ADD COLUMN viewing_time_slot TEXT;
  END IF;
END $$;

-- 4. Conversations & Messages Enhancements
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'is_demo') THEN 
    ALTER TABLE public.conversations ADD COLUMN is_demo BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'seed_key') THEN 
    ALTER TABLE public.conversations ADD COLUMN seed_key TEXT UNIQUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'is_demo') THEN 
    ALTER TABLE public.messages ADD COLUMN is_demo BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'seed_key') THEN 
    ALTER TABLE public.messages ADD COLUMN seed_key TEXT UNIQUE;
  END IF;
END $$;

-- 5. Property Images Table
CREATE TABLE IF NOT EXISTS public.property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  is_main BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  link_url TEXT,
  is_read BOOLEAN DEFAULT false,
  is_demo BOOLEAN DEFAULT false,
  seed_key TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Favorites Table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('profile', 'property')),
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id)
);

-- Indexes for performance and demo queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_demo ON public.profiles(is_demo);
CREATE INDEX IF NOT EXISTS idx_profiles_seed_key ON public.profiles(seed_key);
CREATE INDEX IF NOT EXISTS idx_properties_is_demo ON public.properties(is_demo);
CREATE INDEX IF NOT EXISTS idx_properties_seed_key ON public.properties(seed_key);
CREATE INDEX IF NOT EXISTS idx_groups_is_demo ON public.groups(is_demo);
CREATE INDEX IF NOT EXISTS idx_applications_is_demo ON public.applications(is_demo);
CREATE INDEX IF NOT EXISTS idx_conversations_is_demo ON public.conversations(is_demo);
CREATE INDEX IF NOT EXISTS idx_messages_is_demo ON public.messages(is_demo);
CREATE INDEX IF NOT EXISTS idx_notifications_profile_id ON public.notifications(profile_id);

-- Enable RLS on new tables
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- 8. Additional RLS Policies
DROP POLICY IF EXISTS "Property images are viewable by everyone." ON public.property_images;
CREATE POLICY "Property images are viewable by everyone." ON public.property_images
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view their own notifications." ON public.notifications;
CREATE POLICY "Users can view their own notifications." ON public.notifications
  FOR SELECT USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can update their own notifications." ON public.notifications;
CREATE POLICY "Users can update their own notifications." ON public.notifications
  FOR UPDATE USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can view their own favorites." ON public.favorites;
CREATE POLICY "Users can view their own favorites." ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own favorites." ON public.favorites;
CREATE POLICY "Users can manage their own favorites." ON public.favorites
  FOR ALL USING (auth.uid() = user_id);

-- Ensure Applications RLS policy allows owner of property or tenant applicant to update
DROP POLICY IF EXISTS "Applicants or property owners can view applications." ON public.applications;
CREATE POLICY "Applicants or property owners can view applications." ON public.applications
  FOR SELECT USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.group_members gm WHERE gm.group_id = applications.group_id AND gm.profile_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.properties p WHERE p.id = applications.property_id AND p.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Applicants or property owners can update applications." ON public.applications;
CREATE POLICY "Applicants or property owners can update applications." ON public.applications
  FOR UPDATE USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.properties p WHERE p.id = applications.property_id AND p.owner_id = auth.uid()
    )
  );
