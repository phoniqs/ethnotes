/*
# Add tags column to tunes table

1. Modified Tables
- `tunes`: add `tags` column (text[], default empty array)
  - Stores custom user-defined tags (e.g. "Scandinave", "Balfolk")
  - Used for filtering and display as badges in the tune library

2. Security
- No RLS policy changes needed — existing owner-scoped policies on `tunes`
  already cover the new column since policies apply at the row level.
*/

ALTER TABLE tunes ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';
