-- Migration: 202607190009_nvidia_vector_and_ai_schema.sql
-- Enables vector extension and adds AI embeddings, telemetry, moderation events, audio jobs, indexes, RLS and vector RPC functions.

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- 1. AI Embeddings Table (2048-dim vectors for nvidia/nemotron-3-embed-1b)
CREATE TABLE IF NOT EXISTS public.ai_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('profile', 'property', 'group', 'document')),
    entity_id UUID NOT NULL,
    owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    model TEXT NOT NULL DEFAULT 'nvidia/nemotron-3-embed-1b',
    model_version TEXT NOT NULL DEFAULT 'v1',
    embedding_version INTEGER NOT NULL DEFAULT 1,
    source_hash TEXT NOT NULL,
    locale TEXT NOT NULL DEFAULT 'ru',
    source_updated_at TIMESTAMPTZ DEFAULT now(),
    vector extensions.vector(2048) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT ai_embeddings_unique_entity_model UNIQUE (entity_type, entity_id, model, embedding_version)
);

-- HNSW Cosine Distance Index on Embeddings Vector
CREATE INDEX IF NOT EXISTS idx_ai_embeddings_vector_hnsw 
ON public.ai_embeddings 
USING hnsw (vector extensions.vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_ai_embeddings_entity_lookup 
ON public.ai_embeddings(entity_type, entity_id);

-- 2. AI Provider Telemetry Requests Table (Locked to Service Role)
CREATE TABLE IF NOT EXISTS public.ai_provider_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL DEFAULT 'nvidia',
    model TEXT NOT NULL,
    operation TEXT NOT NULL,
    user_id UUID,
    entity_type TEXT,
    entity_id UUID,
    status TEXT NOT NULL,
    latency_ms INTEGER NOT NULL,
    input_units INTEGER DEFAULT 0,
    output_units INTEGER DEFAULT 0,
    cached BOOLEAN DEFAULT false,
    error_code TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Moderation Events Table
CREATE TABLE IF NOT EXISTS public.moderation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('profile', 'property', 'message', 'image')),
    entity_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    model TEXT NOT NULL DEFAULT 'nvidia/nemotron-3.5-content-safety',
    model_version TEXT NOT NULL DEFAULT 'v1',
    input_hash TEXT NOT NULL,
    result TEXT NOT NULL CHECK (result IN ('approved', 'flagged', 'blocked', 'review_required')),
    labels JSONB DEFAULT '{}'::jsonb,
    severity TEXT DEFAULT 'low',
    confidence DOUBLE PRECISION,
    action TEXT NOT NULL DEFAULT 'allow',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'escalated')),
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Audio Processing Jobs Table (BNR State Machine)
CREATE TABLE IF NOT EXISTS public.audio_processing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    input_storage_path TEXT NOT NULL,
    output_storage_path TEXT,
    provider TEXT NOT NULL DEFAULT 'nvidia',
    model TEXT NOT NULL DEFAULT 'nvidia/bnr',
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'succeeded', 'failed', 'cancelled')),
    progress INTEGER DEFAULT 0,
    attempt_count INTEGER DEFAULT 0,
    error_code TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- RLS Enforcement
ALTER TABLE public.ai_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_provider_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_processing_jobs ENABLE ROW LEVEL SECURITY;

-- Security Rule: RLS Completely denies raw access to client users for ai_embeddings and ai_provider_requests
DROP POLICY IF EXISTS "Deny public direct access to ai_embeddings" ON public.ai_embeddings;
CREATE POLICY "Deny public direct access to ai_embeddings"
ON public.ai_embeddings
FOR ALL
TO public, authenticated
USING (false);

DROP POLICY IF EXISTS "Deny public direct access to ai_provider_requests" ON public.ai_provider_requests;
CREATE POLICY "Deny public direct access to ai_provider_requests"
ON public.ai_provider_requests
FOR ALL
TO public, authenticated
USING (false);

-- RLS for Moderation Events (Users can view their own moderation events status, moderators view all)
DROP POLICY IF EXISTS "Users view own moderation events" ON public.moderation_events;
CREATE POLICY "Users view own moderation events"
ON public.moderation_events
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS for Audio Processing Jobs (Users view their own audio jobs)
DROP POLICY IF EXISTS "Users view own audio jobs" ON public.audio_processing_jobs;
CREATE POLICY "Users view own audio jobs"
ON public.audio_processing_jobs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own audio jobs" ON public.audio_processing_jobs;
CREATE POLICY "Users insert own audio jobs"
ON public.audio_processing_jobs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 5. RPC Functions for Vector Search with Hard SQL Filters (SECURITY DEFINER with strict search_path)

-- Roommate Vector Match Function
CREATE OR REPLACE FUNCTION public.match_roommates_vector(
    query_embedding extensions.vector(2048),
    match_threshold DOUBLE PRECISION DEFAULT 0.5,
    match_count INT DEFAULT 30,
    filter_city TEXT DEFAULT NULL,
    filter_max_budget INT DEFAULT NULL
)
RETURNS TABLE (
    entity_id UUID,
    similarity DOUBLE PRECISION,
    display_name TEXT,
    city TEXT,
    age INT,
    job_title TEXT,
    budget_max INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS entity_id,
        (1 - (e.vector <=> query_embedding))::DOUBLE PRECISION AS similarity,
        p.display_name,
        p.city,
        p.age,
        p.job_title,
        p.budget_max
    FROM public.ai_embeddings e
    JOIN public.profiles p ON p.id = e.entity_id
    WHERE e.entity_type = 'profile'
      AND p.is_public = true
      AND (filter_city IS NULL OR LOWER(p.city) = LOWER(filter_city))
      AND (filter_max_budget IS NULL OR (p.budget_min IS NULL OR p.budget_min <= filter_max_budget))
      AND (1 - (e.vector <=> query_embedding)) >= match_threshold
    ORDER BY (1 - (e.vector <=> query_embedding)) DESC
    LIMIT match_count;
END;
$$;

-- Property Vector Match Function
CREATE OR REPLACE FUNCTION public.match_properties_vector(
    query_embedding extensions.vector(2048),
    match_threshold DOUBLE PRECISION DEFAULT 0.5,
    match_count INT DEFAULT 30,
    filter_city TEXT DEFAULT NULL,
    filter_max_price INT DEFAULT NULL
)
RETURNS TABLE (
    entity_id UUID,
    similarity DOUBLE PRECISION,
    title TEXT,
    city TEXT,
    district TEXT,
    monthly_rent INT,
    rooms INT,
    area DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pr.id AS entity_id,
        (1 - (e.vector <=> query_embedding))::DOUBLE PRECISION AS similarity,
        pr.title,
        pr.city,
        pr.district,
        pr.monthly_rent,
        pr.rooms,
        pr.area
    FROM public.ai_embeddings e
    JOIN public.properties pr ON pr.id = e.entity_id
    WHERE e.entity_type = 'property'
      AND pr.status = 'published'
      AND pr.archived_at IS NULL
      AND (filter_city IS NULL OR LOWER(pr.city) = LOWER(filter_city))
      AND (filter_max_price IS NULL OR pr.monthly_rent <= filter_max_price)
      AND (1 - (e.vector <=> query_embedding)) >= match_threshold
    ORDER BY (1 - (e.vector <=> query_embedding)) DESC
    LIMIT match_count;
END;
$$;
