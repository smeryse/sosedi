-- Migration: 202607190007_scene_documents_and_editor.sql
-- Description: Database tables for scene documents, versions, editor drafts, asset catalog, and RLS security policies

-- 1. Scene Documents Table
CREATE TABLE IF NOT EXISTS public.scene_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id TEXT NOT NULL REFERENCES public.apartments_3d(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Планировка квартиры',
  schema_version TEXT NOT NULL DEFAULT '1.0.0',
  current_version_number INT NOT NULL DEFAULT 1,
  document_json JSONB NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Scene Document Versions Table
CREATE TABLE IF NOT EXISTS public.scene_document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_document_id UUID NOT NULL REFERENCES public.scene_documents(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  document_json JSONB NOT NULL,
  created_by UUID NOT NULL,
  commit_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (scene_document_id, version_number)
);

-- 3. Editor Drafts Table (Auto-saves)
CREATE TABLE IF NOT EXISTS public.editor_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  apartment_id TEXT NOT NULL,
  draft_json JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (owner_id, apartment_id)
);

-- 4. Asset Catalog Table
CREATE TABLE IF NOT EXISTS public.asset_catalog (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  model_url TEXT NOT NULL,
  preview_url TEXT,
  dimensions_meters FLOAT[] NOT NULL DEFAULT ARRAY[1.0, 1.0, 1.0],
  placement_type TEXT NOT NULL DEFAULT 'floor',
  license_type TEXT NOT NULL DEFAULT 'MIT',
  attribution TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Publication Jobs Table
CREATE TABLE IF NOT EXISTS public.publication_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_document_id UUID NOT NULL REFERENCES public.scene_documents(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT,
  published_glb_url TEXT,
  published_manifest_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_scene_documents_apartment_id ON public.scene_documents(apartment_id);
CREATE INDEX IF NOT EXISTS idx_scene_documents_owner_id ON public.scene_documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_editor_drafts_owner_id ON public.editor_drafts(owner_id);
CREATE INDEX IF NOT EXISTS idx_asset_catalog_category ON public.asset_catalog(category);

-- 7. Row Level Security (RLS) Policies
ALTER TABLE public.scene_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scene_document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editor_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publication_jobs ENABLE ROW LEVEL SECURITY;

-- Public read for published scene documents
CREATE POLICY "Public read access for published scene documents" ON public.scene_documents
  FOR SELECT USING (is_published = true);

-- Owners can manage their own scene documents and drafts
CREATE POLICY "Owners can manage their own scene documents" ON public.scene_documents
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Owners can manage their own editor drafts" ON public.editor_drafts
  FOR ALL USING (auth.uid() = owner_id);

-- Public read for active asset catalog items
CREATE POLICY "Public read access for active asset catalog" ON public.asset_catalog
  FOR SELECT USING (is_active = true);
