-- ============================================================
-- WALLVERSE AI — COMPLETE SUPABASE SETUP
-- Run this entire file once in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 0. Extensions ────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. TABLES
-- ============================================================

-- ── Profiles (extends auth.users) ────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
    id                UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username          TEXT UNIQUE,
    full_name         TEXT,
    avatar_url        TEXT,
    bio               TEXT,
    website           TEXT,
    is_premium        BOOLEAN DEFAULT false,
    subscription_tier TEXT DEFAULT 'free',   -- 'free' | 'premium' | 'premium_plus'
    ai_credits        INTEGER DEFAULT 10,
    total_downloads   INTEGER DEFAULT 0,
    total_likes       INTEGER DEFAULT 0,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Categories ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
    id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name        TEXT UNIQUE NOT NULL,
    slug        TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url   TEXT,
    icon        TEXT,
    color       TEXT,
    sort_order  INTEGER DEFAULT 0,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Wallpapers ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wallpapers (
    id                 UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title              TEXT NOT NULL,
    description        TEXT,
    creator_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    category_id        UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    image_url_4k       TEXT NOT NULL,
    image_url_mobile   TEXT,
    image_url_thumbnail TEXT,
    tags               TEXT[] DEFAULT '{}',
    color_palette      TEXT[] DEFAULT '{}',
    is_ai_generated    BOOLEAN DEFAULT false,
    ai_prompt          TEXT,
    ai_model           TEXT,
    is_premium_only    BOOLEAN DEFAULT false,
    is_featured        BOOLEAN DEFAULT false,
    width              INTEGER,
    height             INTEGER,
    file_size_kb       INTEGER,
    views              INTEGER DEFAULT 0,
    downloads          INTEGER DEFAULT 0,
    likes_count        INTEGER DEFAULT 0,
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Likes ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.likes (
    user_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    wallpaper_id UUID REFERENCES public.wallpapers(id) ON DELETE CASCADE,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, wallpaper_id)
);

-- ── Collections ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.collections (
    id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    description TEXT,
    cover_url   TEXT,
    is_public   BOOLEAN DEFAULT true,
    sort_order  INTEGER DEFAULT 0,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Collection Items ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.collection_items (
    collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
    wallpaper_id  UUID REFERENCES public.wallpapers(id) ON DELETE CASCADE,
    added_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (collection_id, wallpaper_id)
);

-- ── AI Generations ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_generations (
    id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    prompt      TEXT NOT NULL,
    style       TEXT,
    resolution  TEXT,
    model_used  TEXT,
    result_url  TEXT,
    status      TEXT DEFAULT 'processing',  -- 'processing' | 'completed' | 'failed'
    error_msg   TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Download History ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.download_history (
    id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    wallpaper_id UUID REFERENCES public.wallpapers(id) ON DELETE CASCADE,
    format       TEXT DEFAULT '4k',   -- '4k' | 'fhd' | 'mobile' | '8k'
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Subscriptions ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id                    UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id               UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    stripe_customer_id    TEXT,
    stripe_subscription_id TEXT,
    plan_id               TEXT,
    status                TEXT,
    current_period_end    TIMESTAMP WITH TIME ZONE,
    created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 2. INDEXES  (speed up common queries)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_wallpapers_category   ON public.wallpapers(category_id);
CREATE INDEX IF NOT EXISTS idx_wallpapers_creator    ON public.wallpapers(creator_id);
CREATE INDEX IF NOT EXISTS idx_wallpapers_views      ON public.wallpapers(views DESC);
CREATE INDEX IF NOT EXISTS idx_wallpapers_likes      ON public.wallpapers(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_wallpapers_downloads  ON public.wallpapers(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_wallpapers_created    ON public.wallpapers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallpapers_featured   ON public.wallpapers(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_wallpapers_tags       ON public.wallpapers USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_likes_wallpaper       ON public.likes(wallpaper_id);
CREATE INDEX IF NOT EXISTS idx_likes_user            ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_user      ON public.collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_coll ON public.collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_ai_gen_user           ON public.ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_download_hist_user    ON public.download_history(user_id);
CREATE INDEX IF NOT EXISTS idx_download_hist_wall    ON public.download_history(wallpaper_id);

-- ============================================================
-- 3. FUNCTIONS & TRIGGERS
-- ============================================================

-- ── Auto-create profile when user signs up ────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'username'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ── updated_at trigger ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_collections_updated_at ON public.collections;
CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- ── increment_views RPC ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.increment_views(wallpaper_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.wallpapers
  SET views = views + 1
  WHERE id = wallpaper_id;
END;
$$;

-- ── increment_likes RPC ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.increment_likes(wallpaper_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.wallpapers
  SET likes_count = likes_count + 1
  WHERE id = wallpaper_id;
END;
$$;

-- ── decrement_likes RPC ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.decrement_likes(wallpaper_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.wallpapers
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = wallpaper_id;
END;
$$;

-- ── increment_downloads RPC ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.increment_downloads(wallpaper_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.wallpapers
  SET downloads = downloads + 1
  WHERE id = wallpaper_id;
END;
$$;

-- ── Reset AI credits monthly (call via Supabase Cron / pg_cron) ──
-- To enable: Dashboard → Database → Extensions → enable pg_cron
-- Then uncomment the lines below:
-- SELECT cron.schedule('reset-ai-credits', '0 0 1 * *',
--   $$UPDATE public.profiles
--     SET ai_credits = CASE subscription_tier
--       WHEN 'premium_plus' THEN 500
--       WHEN 'premium'      THEN 100
--       ELSE 10
--     END$$
-- );

-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- ── profiles ─────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_all"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"   ON public.profiles;

CREATE POLICY "profiles_select_all"   ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own"   ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own"   ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ── categories ───────────────────────────────────────────────
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "categories_select_all" ON public.categories;
CREATE POLICY "categories_select_all" ON public.categories FOR SELECT USING (true);

-- ── wallpapers ───────────────────────────────────────────────
ALTER TABLE public.wallpapers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wallpapers_select_all"   ON public.wallpapers;
DROP POLICY IF EXISTS "wallpapers_insert_auth"  ON public.wallpapers;
DROP POLICY IF EXISTS "wallpapers_update_own"   ON public.wallpapers;
DROP POLICY IF EXISTS "wallpapers_delete_own"   ON public.wallpapers;

CREATE POLICY "wallpapers_select_all"   ON public.wallpapers FOR SELECT USING (true);
CREATE POLICY "wallpapers_insert_auth"  ON public.wallpapers FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "wallpapers_update_own"   ON public.wallpapers FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "wallpapers_delete_own"   ON public.wallpapers FOR DELETE USING (auth.uid() = creator_id);

-- ── likes ─────────────────────────────────────────────────────
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "likes_select_all"   ON public.likes;
DROP POLICY IF EXISTS "likes_insert_own"   ON public.likes;
DROP POLICY IF EXISTS "likes_delete_own"   ON public.likes;

CREATE POLICY "likes_select_all"   ON public.likes FOR SELECT USING (true);
CREATE POLICY "likes_insert_own"   ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete_own"   ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- ── collections ──────────────────────────────────────────────
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "collections_select_public"  ON public.collections;
DROP POLICY IF EXISTS "collections_select_own"     ON public.collections;
DROP POLICY IF EXISTS "collections_insert_own"     ON public.collections;
DROP POLICY IF EXISTS "collections_update_own"     ON public.collections;
DROP POLICY IF EXISTS "collections_delete_own"     ON public.collections;

CREATE POLICY "collections_select_public" ON public.collections FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "collections_insert_own"    ON public.collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "collections_update_own"    ON public.collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "collections_delete_own"    ON public.collections FOR DELETE USING (auth.uid() = user_id);

-- ── collection_items ─────────────────────────────────────────
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "collection_items_select" ON public.collection_items;
DROP POLICY IF EXISTS "collection_items_insert" ON public.collection_items;
DROP POLICY IF EXISTS "collection_items_delete" ON public.collection_items;

CREATE POLICY "collection_items_select" ON public.collection_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND (c.is_public = true OR c.user_id = auth.uid())));
CREATE POLICY "collection_items_insert" ON public.collection_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND c.user_id = auth.uid()));
CREATE POLICY "collection_items_delete" ON public.collection_items FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND c.user_id = auth.uid()));

-- ── ai_generations ────────────────────────────────────────────
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ai_gen_select_own" ON public.ai_generations;
DROP POLICY IF EXISTS "ai_gen_insert_own" ON public.ai_generations;

CREATE POLICY "ai_gen_select_own" ON public.ai_generations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ai_gen_insert_own" ON public.ai_generations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── download_history ─────────────────────────────────────────
ALTER TABLE public.download_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "dl_hist_select_own" ON public.download_history;
DROP POLICY IF EXISTS "dl_hist_insert_any" ON public.download_history;

CREATE POLICY "dl_hist_select_own" ON public.download_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "dl_hist_insert_any" ON public.download_history FOR INSERT WITH CHECK (true);

-- ── subscriptions ─────────────────────────────────────────────
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "subs_select_own" ON public.subscriptions;

CREATE POLICY "subs_select_own" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- 5. STORAGE BUCKET
-- ============================================================
-- Create a public bucket called "wallpapers" for image uploads.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wallpapers',
  'wallpapers',
  true,
  52428800,   -- 50 MB max per file
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Anyone can read (download) from the bucket
DROP POLICY IF EXISTS "wallpapers_bucket_select" ON storage.objects;
CREATE POLICY "wallpapers_bucket_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'wallpapers');

-- Only authenticated users can upload
DROP POLICY IF EXISTS "wallpapers_bucket_insert" ON storage.objects;
CREATE POLICY "wallpapers_bucket_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'wallpapers' AND auth.role() = 'authenticated');

-- Users can only delete their own uploads
DROP POLICY IF EXISTS "wallpapers_bucket_delete" ON storage.objects;
CREATE POLICY "wallpapers_bucket_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'wallpapers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- 6. SEED DATA — Categories
-- ============================================================
INSERT INTO public.categories (name, slug, description, icon, color, sort_order) VALUES
  ('Space',        'space',        'Galaxies, nebulae, planets, and cosmic wonders',       '🌌', '#7c3aed', 1),
  ('Cyberpunk',    'cyberpunk',    'Neon cities, rain-soaked streets, dystopian futures',  '⚡', '#ec4899', 2),
  ('Nature',       'nature',       'Forests, oceans, mountains, and natural landscapes',   '🌿', '#10b981', 3),
  ('Abstract',     'abstract',     'Geometric art, fluid shapes, and surreal compositions','◈',  '#f59e0b', 4),
  ('Minimal',      'minimal',      'Clean, simple, and elegant wallpapers',                '□',  '#6b7280', 5),
  ('Anime',        'anime',        'Illustrated scenes and characters in anime style',     '✨', '#06b6d4', 6),
  ('Dark',         'dark',         'Moody dark themes, noir, and dramatic lighting',       '◉',  '#1e1b4b', 7),
  ('Landscape',    'landscape',    'Sweeping scenic views and breathtaking horizons',      '🏔', '#0ea5e9', 8),
  ('Urban',        'urban',        'City life, architecture, and street photography',      '🏙', '#64748b', 9),
  ('Fantasy',      'fantasy',      'Magical worlds, mythical creatures, and epic scenes',  '🐉', '#a855f7', 10),
  ('Architecture', 'architecture', 'Stunning buildings, interiors, and structural art',    '🏛', '#84cc16', 11),
  ('Watercolour',  'watercolour',  'Soft watercolour art and painted illustrations',       '🎨', '#f472b6', 12)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 7. SEED DATA — Sample Wallpapers (Unsplash images)
--    These give the gallery real content immediately.
--    Replace image_url_4k with your own hosted images later.
-- ============================================================

-- Store category IDs in variables for cleaner inserts
DO $$
DECLARE
  cat_space        UUID := (SELECT id FROM public.categories WHERE slug='space');
  cat_cyberpunk    UUID := (SELECT id FROM public.categories WHERE slug='cyberpunk');
  cat_nature       UUID := (SELECT id FROM public.categories WHERE slug='nature');
  cat_abstract     UUID := (SELECT id FROM public.categories WHERE slug='abstract');
  cat_minimal      UUID := (SELECT id FROM public.categories WHERE slug='minimal');
  cat_anime        UUID := (SELECT id FROM public.categories WHERE slug='anime');
  cat_dark         UUID := (SELECT id FROM public.categories WHERE slug='dark');
  cat_landscape    UUID := (SELECT id FROM public.categories WHERE slug='landscape');
  cat_urban        UUID := (SELECT id FROM public.categories WHERE slug='urban');
  cat_fantasy      UUID := (SELECT id FROM public.categories WHERE slug='fantasy');
BEGIN

INSERT INTO public.wallpapers
  (title, description, category_id, image_url_4k, image_url_thumbnail, tags, is_featured, views, downloads, likes_count)
VALUES

-- Space
('Nebula Dreams',
 'Vivid purple and blue nebula with swirling gas clouds and distant stars.',
 cat_space,
 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=3840&q=90',
 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&q=80',
 ARRAY['space','nebula','purple','galaxy'], true, 14200, 3100, 892),

('Milky Way Arc',
 'The full arc of the Milky Way stretching over a dark silhouetted landscape.',
 cat_space,
 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=3840&q=90',
 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=600&q=80',
 ARRAY['space','milky way','stars','night'], true, 21000, 5400, 1340),

('Deep Space Portal',
 'A swirling galaxy core photographed from orbit — a portal to infinity.',
 cat_space,
 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=3840&q=90',
 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&q=80',
 ARRAY['space','galaxy','dark','cosmic'], false, 8900, 2200, 640),

-- Cyberpunk
('Neon Tokyo',
 'Rain-soaked Tokyo alleyway lit by neon signs in pink and cyan.',
 cat_cyberpunk,
 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=3840&q=90',
 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80',
 ARRAY['cyberpunk','neon','tokyo','rain','city'], true, 33000, 8900, 2100),

('Electric City',
 'A futuristic skyline bathed in electric blues and purples at night.',
 cat_cyberpunk,
 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=3840&q=90',
 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80',
 ARRAY['cyberpunk','city','lights','night','urban'], false, 18500, 4300, 980),

-- Nature
('Aurora Borealis',
 'The northern lights dance in vivid greens and purples over a snowy mountain.',
 cat_nature,
 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=3840&q=90',
 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80',
 ARRAY['nature','aurora','northern lights','snow','mountains'], true, 44000, 12000, 3200),

('Foggy Forest',
 'Dense ancient forest wrapped in morning mist — ethereal and peaceful.',
 cat_nature,
 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=3840&q=90',
 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80',
 ARRAY['nature','forest','fog','mist','trees'], false, 11200, 2900, 720),

('Deep Ocean',
 'Bioluminescent ocean floor with soft blue light radiating from the depths.',
 cat_nature,
 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=3840&q=90',
 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=600&q=80',
 ARRAY['nature','ocean','water','blue','deep'], true, 16800, 4100, 1050),

('Lavender Fields',
 'Rolling lavender fields at sunset — purple haze stretching to the horizon.',
 cat_nature,
 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=3840&q=90',
 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=600&q=80',
 ARRAY['nature','lavender','purple','fields','sunset'], false, 9400, 2600, 810),

-- Abstract
('Abstract Flow',
 'Fluid violet and magenta shapes forming an organic abstract composition.',
 cat_abstract,
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=3840&q=90',
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
 ARRAY['abstract','purple','fluid','art','modern'], true, 22000, 5800, 1420),

('Geometric Prism',
 'Low-poly geometric triangles in gradient gold and orange tones.',
 cat_abstract,
 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=3840&q=90',
 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=80',
 ARRAY['abstract','geometric','gold','gradient','pattern'], false, 7600, 1900, 490),

-- Landscape
('Mountain Zenith',
 'Snow-capped mountain peaks piercing a sea of clouds at golden hour.',
 cat_landscape,
 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=3840&q=90',
 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80',
 ARRAY['landscape','mountains','snow','clouds','golden hour'], true, 28000, 7200, 1890),

('Desert Dunes',
 'Perfect crescent sand dunes casting dramatic shadows in the Sahara.',
 cat_landscape,
 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=3840&q=90',
 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=80',
 ARRAY['landscape','desert','sand','dunes','africa'], false, 12400, 3300, 820),

-- Dark / Minimal
('Dark Void',
 'Pure black with a single geometric neon line — the essence of minimal dark.',
 cat_dark,
 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=3840&q=90',
 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=600&q=80',
 ARRAY['dark','minimal','black','neon','geometric'], false, 19000, 5100, 1240),

('Obsidian Stone',
 'Close-up of black obsidian rock with reflective metallic veins.',
 cat_dark,
 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=3840&q=90',
 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=600&q=80',
 ARRAY['dark','stone','texture','black','macro'], false, 8200, 2100, 560),

-- Urban
('Rainy Street',
 'Long exposure of a wet city street with streaking car lights at night.',
 cat_urban,
 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=3840&q=90',
 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&q=80',
 ARRAY['urban','street','rain','night','long exposure'], false, 14600, 3800, 940),

('Skyscraper Glass',
 'Abstract upward shot of glass skyscrapers reflecting blue sky and clouds.',
 cat_urban,
 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=3840&q=90',
 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80',
 ARRAY['urban','architecture','glass','skyscraper','blue'], false, 9800, 2500, 620)

ON CONFLICT DO NOTHING;

END $$;

-- ============================================================
-- 8. EMAIL AUTH CONFIG REMINDER
-- ============================================================
-- In your Supabase Dashboard, go to:
--   Authentication → URL Configuration
-- Set these values:
--
--   Site URL:            http://localhost:3000          (dev)
--                        https://yourdomain.com         (prod)
--
--   Redirect URLs:       http://localhost:3000/auth/callback
--                        https://yourdomain.com/auth/callback
--
-- ============================================================
-- DONE! All tables, indexes, RLS policies, triggers, RPCs,
-- storage bucket, categories, and sample wallpapers are ready.
-- ============================================================
