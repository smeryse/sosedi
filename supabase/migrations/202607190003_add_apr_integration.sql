-- Migration: 202607190003_add_apr_integration.sql
-- Description: Extensions for AP-R (Ассоциация застройщиков Юга России) catalog integration

-- 1. Add AP-R metadata columns to properties table
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'source'
  ) THEN 
    ALTER TABLE public.properties ADD COLUMN source TEXT DEFAULT 'user';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'external_id'
  ) THEN 
    ALTER TABLE public.properties ADD COLUMN external_id TEXT UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'source_url'
  ) THEN 
    ALTER TABLE public.properties ADD COLUMN source_url TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'developer_name'
  ) THEN 
    ALTER TABLE public.properties ADD COLUMN developer_name TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'complex_name'
  ) THEN 
    ALTER TABLE public.properties ADD COLUMN complex_name TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'completion_date'
  ) THEN 
    ALTER TABLE public.properties ADD COLUMN completion_date TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'finishing_type'
  ) THEN 
    ALTER TABLE public.properties ADD COLUMN finishing_type TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'floor'
  ) THEN 
    ALTER TABLE public.properties ADD COLUMN floor INT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'price_per_sqm'
  ) THEN 
    ALTER TABLE public.properties ADD COLUMN price_per_sqm INT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'fetched_at'
  ) THEN 
    ALTER TABLE public.properties ADD COLUMN fetched_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'last_verified_at'
  ) THEN 
    ALTER TABLE public.properties ADD COLUMN last_verified_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'stale_status'
  ) THEN 
    ALTER TABLE public.properties ADD COLUMN stale_status TEXT DEFAULT 'active';
  END IF;
END $$;

-- Indexes for efficient querying by source and external_id
CREATE INDEX IF NOT EXISTS idx_properties_source ON public.properties(source);
CREATE INDEX IF NOT EXISTS idx_properties_external_id ON public.properties(external_id);
CREATE INDEX IF NOT EXISTS idx_properties_stale_status ON public.properties(stale_status);

-- 2. Audit logs for AP-R feed synchronization runs
CREATE TABLE IF NOT EXISTS public.apr_import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL DEFAULT 'file',
  total_processed INT NOT NULL DEFAULT 0,
  created_count INT NOT NULL DEFAULT 0,
  updated_count INT NOT NULL DEFAULT 0,
  unchanged_count INT NOT NULL DEFAULT 0,
  stale_count INT NOT NULL DEFAULT 0,
  error_count INT NOT NULL DEFAULT 0,
  error_log JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit logs
ALTER TABLE public.apr_import_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view import logs." ON public.apr_import_logs;
CREATE POLICY "Admins can view import logs." ON public.apr_import_logs
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Service role / Admins can insert import logs." ON public.apr_import_logs;
CREATE POLICY "Service role / Admins can insert import logs." ON public.apr_import_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
