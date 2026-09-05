/*
# Add tune_settings table for multiple settings per tune

1. New Tables
- `tune_settings`: stores alternate settings/variants for a tune, linked to the parent tune record.
  - `id` (uuid, primary key)
  - `tune_id` (uuid, foreign key to tunes, cascade delete)
  - `setting_number` (int, starts at 2 — setting 1 is the parent tune itself)
  - `author` (text, nullable — extracted from % comment in The Session exports)
  - `key` (text — the K: header for this setting)
  - `abc` (text — the full ABC notation for this setting)
  - `created_at` (timestamp)

2. Security
- RLS enabled on tune_settings.
- SELECT: visible if the parent tune is owned by the caller OR the parent tune's owner has opted into sharing.
- INSERT/UPDATE/DELETE: only allowed if the parent tune is owned by the caller.
- Ownership is verified through the parent tunes table, not a direct user_id column.

3. Important Notes
- Setting 1 is stored in the parent tune's own `abc` and `key` columns for backward compatibility.
- Additional settings (2, 3, ...) are stored in this table with their `setting_number`.
- When a parent tune is deleted, its settings are automatically deleted via ON DELETE CASCADE.
*/

CREATE TABLE IF NOT EXISTS public.tune_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tune_id uuid NOT NULL REFERENCES public.tunes(id) ON DELETE CASCADE,
  setting_number int NOT NULL DEFAULT 2,
  author text,
  key text NOT NULL DEFAULT '',
  abc text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tune_settings_tune_id_idx ON public.tune_settings(tune_id);

ALTER TABLE public.tune_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tune_settings_select_own_or_shared" ON public.tune_settings;
CREATE POLICY "tune_settings_select_own_or_shared" ON public.tune_settings FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.tunes WHERE tunes.id = tune_settings.tune_id AND tunes.user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.tunes
      JOIN public.profiles ON profiles.id = tunes.user_id
      WHERE tunes.id = tune_settings.tune_id AND profiles.sharing_enabled = true
    )
  );

DROP POLICY IF EXISTS "tune_settings_insert_own" ON public.tune_settings;
CREATE POLICY "tune_settings_insert_own" ON public.tune_settings FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.tunes WHERE tunes.id = tune_settings.tune_id AND tunes.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "tune_settings_update_own" ON public.tune_settings;
CREATE POLICY "tune_settings_update_own" ON public.tune_settings FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.tunes WHERE tunes.id = tune_settings.tune_id AND tunes.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.tunes WHERE tunes.id = tune_settings.tune_id AND tunes.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "tune_settings_delete_own" ON public.tune_settings;
CREATE POLICY "tune_settings_delete_own" ON public.tune_settings FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.tunes WHERE tunes.id = tune_settings.tune_id AND tunes.user_id = auth.uid())
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tune_settings TO authenticated;
