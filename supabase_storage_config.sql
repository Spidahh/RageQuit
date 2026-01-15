-- ============================================
-- RAGEQUIT - Supabase Storage Configuration
-- ============================================
-- Run AFTER creating the "ragequit-assets" bucket

-- 1. CREATE STORAGE BUCKET (via Dashboard)
-- Dashboard → Storage → Create bucket
-- Name: ragequit-assets
-- Public bucket: ✅ ENABLED
-- File size limit: 50MB

-- 2. CONFIGURE BUCKET SETTINGS (SQL)
-- Run this in SQL Editor:

-- Enable public access
INSERT INTO storage.buckets (id, name, public)
VALUES ('ragequit-assets', 'ragequit-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Configure CORS
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'model/gltf-binary',
  'model/gltf+json',
  'application/octet-stream',
  'audio/ogg',
  'audio/wav',
  'audio/mpeg'
]
WHERE id = 'ragequit-assets';

-- Set file size limit (50MB in bytes)
UPDATE storage.buckets
SET file_size_limit = 52428800
WHERE id = 'ragequit-assets';

-- 3. STORAGE POLICIES
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'ragequit-assets');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ragequit-assets');

-- ============================================
-- ✅ STORAGE SETUP COMPLETE
-- ============================================
-- Test URL format:
-- https://vgtyecaegcjhewkuusal.supabase.co/storage/v1/object/public/ragequit-assets/characters/player/sk_player_character.fbx
