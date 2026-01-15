# 🚀 SUPABASE SETUP GUIDE - RAGEQUIT v13.1

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"Sign in"** (or create account if needed)
3. Click **"New Project"**
4. Fill in details:
   - **Organization**: Create new or select existing
   - **Name**: `ragequit-game`
   - **Database Password**: Generate strong password (SAVE THIS!)
   - **Region**: `Europe (eu-central-1)` (closest to Railway)
5. Click **"Create new project"**
6. Wait 2-3 minutes for provisioning

---

## Step 2: Get API Credentials

✅ **Your Project Credentials** (Already configured):

```
Project URL: https://vgtyecaegcjhewkuusal.supabase.co
Project ID: vgtyecaegcjhewkuusal
Anon Public Key: sb_publishable_x2ziQaGc93PjDuVc7EkakQ_4gelOX5v
Service Role Key: sb_secret_hE6WpnhFsNVLxSJRoCXbEA_QMPIiG8p
```

3. **✅ `.env` file already updated** in `E:\TEST\02_Active_Game\`
   (credentials automatically applied from .env.example)

---

## Step 3: Create Database Tables

1. Go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open `supabase_schema.sql` from this folder
4. **Copy ALL contents** and paste into SQL Editor
5. Click **"Run"** button (or Ctrl+Enter)
6. Verify success: Should see ✅ "Success. No rows returned"

**Tables created:**
- ✅ `profiles` (user data)
- ✅ `ability_database` (40 abilities)
- ✅ `loadouts` (player loadouts with 11 slots)

---

## Step 4: Setup Storage Bucket

### 4.1 Create Bucket (Dashboard)
1. Go to **Storage** (left sidebar)
2. Click **"Create bucket"**
3. Settings:
   - **Name**: `ragequit-assets`
   - **Public bucket**: ✅ **ENABLED** (important!)
   - **File size limit**: 50MB
4. Click **"Create bucket"**

### 4.2 Configure Bucket (SQL)
1. Go back to **SQL Editor**
2. Click **"New query"**
3. Open `supabase_storage_config.sql` from this folder
4. **Copy ALL contents** and paste
5. Click **"Run"**

---

## Step 5: Verify Setup

### 5.1 Check Tables
1. Go to **Table Editor** (left sidebar)
2. Verify you see:
   - `ability_database`
   - `loadouts`
   - `profiles`

### 5.2 Check Storage
1. Go to **Storage** → `ragequit-assets`
2. Bucket should be **Public** (green badge)
3. Try uploading a test file to verify

### 5.3 Test Connection
```powershell
# In E:\TEST\02_Active_Game
cd E:\TEST\02_Active_Game
pnpm run dev:client
```

Open browser console, should see:
```
✅ Supabase connected successfully
```

---

## Step 6: Enable Authentication

1. Go to **Authentication** (left sidebar) → **Providers**
2. **Email** provider: Should be ✅ enabled by default
3. **Anonymous/Guest** provider: ✅ enabled by default
4. (Optional) **Google OAuth**:
   - Enable toggle
   - Add Client ID & Secret from Google Cloud Console
   - Redirect URL: `https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback`

---

## ✅ Setup Complete Checklist

- [ ] Supabase project created
- [ ] `.env` file updated with credentials
- [ ] Database schema executed (3 tables created)
- [ ] Storage bucket `ragequit-assets` created (public)
- [ ] Storage policies configured
- [ ] Test connection successful

---

## 🔗 Important URLs

**Dashboard**: https://supabase.com/dashboard/project/vgtyecaegcjhewkuusal
**CDN Base**: https://vgtyecaegcjhewkuusal.supabase.co/storage/v1/object/public/ragequit-assets/
**Database**: https://vgtyecaegcjhewkuusal.supabase.co/rest/v1/

---

## 🚨 Common Issues

### "Missing environment variables" error
→ Make sure `.env` file exists in `02_Active_Game/` folder
→ Verify all 3 variables are set (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY)

### "Failed to fetch" error
→ Check project URL is correct (no trailing slash)
→ Verify API keys are correct (copy from Settings → API)

### Storage 404 errors
→ Verify bucket is PUBLIC (check Storage dashboard)
→ Run `supabase_storage_config.sql` to set policies

---

**Next Step**: After setup complete, run Phase 4 (Three.js rendering) or upload assets to CDN
