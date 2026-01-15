-- ============================================
-- RAGEQUIT v13.1 - Supabase Database Schema
-- ============================================
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- Then click "Run" to execute

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE (linked to Supabase Auth)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all profiles
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Policy: Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- ============================================
-- 2. ABILITY DATABASE (40 abilities)
-- ============================================
CREATE TABLE IF NOT EXISTS public.ability_database (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('melee', 'bow', 'magic', 'utility')),
  damage INTEGER DEFAULT 0,
  mana_cost INTEGER DEFAULT 0,
  stamina_cost INTEGER DEFAULT 0,
  cooldown REAL NOT NULL,
  effects JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ability_database ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read abilities
CREATE POLICY "Abilities are viewable by everyone"
ON public.ability_database FOR SELECT
TO authenticated, anon
USING (true);

-- ============================================
-- 3. LOADOUTS TABLE (11 ability slots)
-- ============================================
CREATE TABLE IF NOT EXISTS public.loadouts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'Default Loadout',
  is_active BOOLEAN DEFAULT FALSE,
  -- 7 customizable slots
  slot_q TEXT REFERENCES public.ability_database(id),
  slot_c TEXT REFERENCES public.ability_database(id), 
  slot_1 TEXT REFERENCES public.ability_database(id),
  slot_e TEXT REFERENCES public.ability_database(id),
  slot_f TEXT REFERENCES public.ability_database(id),
  slot_x TEXT REFERENCES public.ability_database(id),
  slot_t TEXT REFERENCES public.ability_database(id),
  -- 4 fixed utility slots
  slot_r TEXT DEFAULT 'heal_self' REFERENCES public.ability_database(id),
  slot_2 TEXT DEFAULT 'transmute_stam_hp' REFERENCES public.ability_database(id),
  slot_3 TEXT DEFAULT 'transmute_hp_mana' REFERENCES public.ability_database(id),
  slot_4 TEXT DEFAULT 'transmute_mana_stam' REFERENCES public.ability_database(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.loadouts ENABLE ROW LEVEL SECURITY;

-- Ensure one active loadout per user
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_loadout_per_user 
ON public.loadouts(user_id) 
WHERE is_active = TRUE;

-- Policy: Users can read their own loadouts
CREATE POLICY "Users can view own loadouts"
ON public.loadouts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can insert their own loadouts
CREATE POLICY "Users can insert own loadouts"
ON public.loadouts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own loadouts
CREATE POLICY "Users can update own loadouts"
ON public.loadouts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can delete their own loadouts
CREATE POLICY "Users can delete own loadouts"
ON public.loadouts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- 4. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_loadouts_user_id ON public.loadouts(user_id);
CREATE INDEX IF NOT EXISTS idx_loadouts_is_active ON public.loadouts(is_active);
CREATE INDEX IF NOT EXISTS idx_ability_database_type ON public.ability_database(type);

-- ============================================
-- 5. FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_loadouts_updated_at BEFORE UPDATE ON public.loadouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ✅ SCHEMA SETUP COMPLETE
-- ============================================
-- Next steps:
-- 1. Go to Storage → Create bucket "ragequit-assets" (public)
-- 2. Configure CORS (see supabase_storage_config.sql)
-- 3. Update .env with your project credentials
