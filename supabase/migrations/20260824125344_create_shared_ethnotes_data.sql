/*
# Create shared Ethnotes data and privacy controls

1. New Tables
- `profiles`: one row per signed-in user with display name, optional approximate location, and an explicit sharing switch.
- `tunes`: each user's repertoire, including ABC content and searchable metadata.

2. Security
- Row-level security is enabled on both tables.
- Users can fully manage their own profile and tunes.
- Nearby discovery only exposes profiles that opted into sharing.
- Shared tune rows are readable only when their owner has opted into repertoire sharing.
- Location fields are optional and intended for approximate coordinates or a city name.

3. Important Notes
- Authentication uses Supabase's built-in `auth.users` records; no custom passwords are stored.
- `user_id` defaults to the authenticated session and is not trusted from browser input.
- Four separate CRUD policies are defined for each table.
*/

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'Ethnotes player',
  sharing_enabled boolean NOT NULL DEFAULT false,
  location_label text,
  latitude double precision,
  longitude double precision,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tunes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL DEFAULT 'Other',
  key text NOT NULL DEFAULT '',
  region text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  abc text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tunes_user_id_idx ON public.tunes(user_id);
CREATE INDEX IF NOT EXISTS tunes_title_idx ON public.tunes USING gin (to_tsvector('simple', title));

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tunes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_visible" ON public.profiles;
CREATE POLICY "profiles_select_visible" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR sharing_enabled = true);
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "tunes_select_own_or_shared" ON public.tunes;
CREATE POLICY "tunes_select_own_or_shared" ON public.tunes FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = tunes.user_id AND profiles.sharing_enabled = true
    )
  );
DROP POLICY IF EXISTS "tunes_insert_own" ON public.tunes;
CREATE POLICY "tunes_insert_own" ON public.tunes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "tunes_update_own" ON public.tunes;
CREATE POLICY "tunes_update_own" ON public.tunes FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "tunes_delete_own" ON public.tunes;
CREATE POLICY "tunes_delete_own" ON public.tunes FOR DELETE TO authenticated
  USING (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tunes TO authenticated;
