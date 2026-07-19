-- Migration: 202607190006_postgis_and_indexes.sql
-- Description: PostGIS spatial coordinates, performance B-tree & GiST indexes, CHECK constraints, and RLS security hardening

-- 1. Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Add Geography Location Column to Buildings
ALTER TABLE public.buildings
  ADD COLUMN IF NOT EXISTS location geography(Point, 4326),
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

ALTER TABLE public.apartments_3d
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- Migrate existing JSONB coordinates to PostGIS geography points
UPDATE public.buildings
SET location = ST_SetSRID(
  ST_MakePoint(
    (coordinates->>0)::float,
    (coordinates->>1)::float
  ),
  4326
)::geography
WHERE location IS NULL AND coordinates IS NOT NULL;

-- 3. Create Spatial GiST Index & Performance B-Tree Indexes
CREATE INDEX IF NOT EXISTS idx_buildings_location ON public.buildings USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_apartments_3d_building_id ON public.apartments_3d (building_id);
CREATE INDEX IF NOT EXISTS idx_apartment_rooms_apartment_id ON public.apartment_rooms (apartment_id);
CREATE INDEX IF NOT EXISTS idx_buildings_district ON public.buildings (district);
CREATE INDEX IF NOT EXISTS idx_apartments_3d_total_rent ON public.apartments_3d (total_rent);
CREATE INDEX IF NOT EXISTS idx_apartments_3d_rooms_count ON public.apartments_3d (rooms_count);
CREATE INDEX IF NOT EXISTS idx_simulation_sessions_user_id ON public.simulation_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_simulation_sessions_created_at ON public.simulation_sessions (created_at DESC);

-- 4. Add CHECK Constraints
ALTER TABLE public.buildings
  ADD CONSTRAINT check_price_positive CHECK (price_from > 0);

ALTER TABLE public.apartments_3d
  ADD CONSTRAINT check_rent_positive CHECK (total_rent > 0),
  ADD CONSTRAINT check_rooms_positive CHECK (rooms_count > 0);

ALTER TABLE public.apartment_rooms
  ADD CONSTRAINT check_area_positive CHECK (area_m2 > 0);

ALTER TABLE public.simulation_sessions
  ADD CONSTRAINT check_score_range CHECK (compatibility_score >= 0 AND compatibility_score <= 100);

-- 5. Harden Row Level Security (RLS) Policies
DROP POLICY IF EXISTS "Public read access for buildings" ON public.buildings;
DROP POLICY IF EXISTS "Public read access for apartments_3d" ON public.apartments_3d;
DROP POLICY IF EXISTS "Users can manage their own simulation sessions" ON public.simulation_sessions;

-- Only published items accessible to public/anonymous users
CREATE POLICY "Public read access for published buildings" ON public.buildings
  FOR SELECT USING (is_published = true);

CREATE POLICY "Public read access for published apartments" ON public.apartments_3d
  FOR SELECT USING (is_published = true);

-- Authenticated user simulation session policy
CREATE POLICY "Users can manage their own authenticated simulation sessions" ON public.simulation_sessions
  FOR ALL USING (auth.uid() = user_id);
