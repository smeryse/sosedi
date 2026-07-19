-- Migration: 202607190005_3d_co_living_schema.sql
-- Description: Production 3D Co-Living schema for buildings, 3D apartments, room assignments and simulation sessions

-- 1. Buildings
CREATE TABLE IF NOT EXISTS public.buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  coordinates JSONB NOT NULL DEFAULT '[38.976, 45.035]',
  price_from INT NOT NULL DEFAULT 20000,
  height_m INT DEFAULT 45,
  time_to_kubsu_min INT DEFAULT 18,
  match_percentage INT DEFAULT 87,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Apartments 3D
CREATE TABLE IF NOT EXISTS public.apartments_3d (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES public.buildings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  rooms_count INT DEFAULT 3,
  area_m2 NUMERIC(6,2) DEFAULT 78.00,
  total_rent INT NOT NULL DEFAULT 40000,
  glb_url TEXT,
  glb_mobile_url TEXT,
  manifest_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Apartment Rooms
CREATE TABLE IF NOT EXISTS public.apartment_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id UUID REFERENCES public.apartments_3d(id) ON DELETE CASCADE,
  room_code TEXT NOT NULL,
  name TEXT NOT NULL,
  room_type TEXT NOT NULL CHECK (room_type IN ('private', 'common')),
  area_m2 NUMERIC(5,2) NOT NULL,
  has_balcony BOOLEAN DEFAULT false,
  has_workplace BOOLEAN DEFAULT false,
  window_size TEXT DEFAULT 'medium',
  noise_level TEXT DEFAULT 'moderate',
  weight NUMERIC(5,2) DEFAULT 15.00
);

-- 4. District Metrics & Heatmaps
CREATE TABLE IF NOT EXISTS public.district_metrics (
  district TEXT PRIMARY KEY,
  transport_score INT DEFAULT 80,
  comfort_score INT DEFAULT 85,
  eco_score INT DEFAULT 90,
  noise_level TEXT DEFAULT 'quiet',
  compatible_roommates_count INT DEFAULT 14
);

-- 5. Simulation Sessions
CREATE TABLE IF NOT EXISTS public.simulation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  apartment_id UUID REFERENCES public.apartments_3d(id) ON DELETE SET NULL,
  selected_rooms JSONB NOT NULL DEFAULT '{}',
  roommate_assignments JSONB NOT NULL DEFAULT '[]',
  calculated_rent INT NOT NULL DEFAULT 40000,
  game_answers JSONB NOT NULL DEFAULT '{}',
  compatibility_score INT DEFAULT 87,
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apartments_3d ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apartment_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.district_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for buildings" ON public.buildings FOR SELECT USING (true);
CREATE POLICY "Public read access for apartments_3d" ON public.apartments_3d FOR SELECT USING (true);
CREATE POLICY "Public read access for apartment_rooms" ON public.apartment_rooms FOR SELECT USING (true);
CREATE POLICY "Public read access for district_metrics" ON public.district_metrics FOR SELECT USING (true);

CREATE POLICY "Users can manage their own simulation sessions" ON public.simulation_sessions
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);
