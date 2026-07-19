-- Migration: 202607190004_add_apr_scraper_tables.sql
-- Description: Add scraper page log table and content_hash / raw_payload columns for AP-R scraper

DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'content_hash'
  ) THEN 
    ALTER TABLE public.properties ADD COLUMN content_hash TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'raw_payload'
  ) THEN 
    ALTER TABLE public.properties ADD COLUMN raw_payload JSONB DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'last_scraped_at'
  ) THEN 
    ALTER TABLE public.properties ADD COLUMN last_scraped_at TIMESTAMPTZ;
  END IF;
END $$;

-- Track visited scraper URLs, HTTP status, content hash, and processing status
CREATE TABLE IF NOT EXISTS public.apr_scraped_pages (
  url TEXT PRIMARY KEY,
  status_code INT NOT NULL DEFAULT 200,
  content_hash TEXT,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processed', 'failed', 'skipped_unchanged')),
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_apr_scraped_pages_status ON public.apr_scraped_pages(processing_status);
CREATE INDEX IF NOT EXISTS idx_properties_content_hash ON public.properties(content_hash);

-- Enable RLS
ALTER TABLE public.apr_scraped_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view scraped page logs." ON public.apr_scraped_pages;
CREATE POLICY "Admins can view scraped page logs." ON public.apr_scraped_pages
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can insert or update scraped page logs." ON public.apr_scraped_pages;
CREATE POLICY "Admins can insert or update scraped page logs." ON public.apr_scraped_pages
  FOR ALL USING (auth.uid() IS NOT NULL);
