-- Migration: Create AP-R Housing Catalog and Import Audit Log Tables

CREATE TABLE IF NOT EXISTS apr_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL DEFAULT 'ap-r',
  original_url TEXT NOT NULL,
  city TEXT NOT NULL,
  complex_name TEXT NOT NULL,
  developer TEXT NOT NULL,
  address TEXT NOT NULL,
  property_type TEXT NOT NULL DEFAULT 'flat', -- flat, studio, apartment
  rooms INT NOT NULL DEFAULT 1,
  area NUMERIC(8,2) NOT NULL,
  floor INT,
  total_floors INT,
  price NUMERIC(12,2) NOT NULL,
  price_per_sqm NUMERIC(12,2) NOT NULL,
  completion_date TEXT NOT NULL,
  finishing TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  description TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for fast catalog search & filtering
CREATE INDEX IF NOT EXISTS idx_apr_properties_city ON apr_properties(city);
CREATE INDEX IF NOT EXISTS idx_apr_properties_rooms ON apr_properties(rooms);
CREATE INDEX IF NOT EXISTS idx_apr_properties_price ON apr_properties(price);
CREATE INDEX IF NOT EXISTS idx_apr_properties_is_available ON apr_properties(is_available);
CREATE INDEX IF NOT EXISTS idx_apr_properties_last_checked_at ON apr_properties(last_checked_at);

-- Table for tracking feed import pipeline runs
CREATE TABLE IF NOT EXISTS apr_import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL DEFAULT 'ap-r',
  status TEXT NOT NULL, -- success, partial_success, failed
  processed_count INT NOT NULL DEFAULT 0,
  created_count INT NOT NULL DEFAULT 0,
  updated_count INT NOT NULL DEFAULT 0,
  skipped_count INT NOT NULL DEFAULT 0,
  error_count INT NOT NULL DEFAULT 0,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  error_messages TEXT[] NOT NULL DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE apr_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE apr_import_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active properties
CREATE POLICY "Allow public read access to active APR properties"
  ON apr_properties FOR SELECT
  USING (true);

-- Allow service role full management access
CREATE POLICY "Allow service role full access to APR properties"
  ON apr_properties FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to APR import logs"
  ON apr_import_logs FOR ALL
  USING (auth.role() = 'service_role');
