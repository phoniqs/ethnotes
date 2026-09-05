/*
# Add tune_group column to tunes table

1. Modified Tables
- `tunes`: add `tune_group` column (text, nullable)
  - Stores the ABC G: (Group) header value, e.g. "Scandinave", "Balfolk"
  - Used for display as a badge and for filtering the tune library by group

2. Security
- No RLS policy changes needed — existing owner-scoped policies on `tunes`
  already cover the new column since policies apply at the row level.
*/

ALTER TABLE tunes ADD COLUMN IF NOT EXISTS tune_group text;
