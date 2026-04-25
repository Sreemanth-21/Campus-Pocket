-- ============================================================
-- AI Timetable Generator — Schema Migration
-- Adds `teacher` and `period` columns to the timetable table
-- Run in Supabase SQL Editor
-- ============================================================

-- Add teacher column (stores the assigned teacher's name per period)
ALTER TABLE timetable
  ADD COLUMN IF NOT EXISTS teacher TEXT NOT NULL DEFAULT '';

-- Add period column (stores the period number within the day)
ALTER TABLE timetable
  ADD COLUMN IF NOT EXISTS period INTEGER NOT NULL DEFAULT 0;

-- ── VERIFICATION ─────────────────────────────────────────────
-- Run the queries below to confirm the migration succeeded.
-- All existing rows should have teacher = '' and period = 0.

-- 1. Confirm columns exist with correct types and defaults:
-- SELECT column_name, data_type, column_default, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'timetable'
--   AND column_name IN ('teacher', 'period');

-- 2. Confirm existing rows are unaffected (should return 0):
-- SELECT COUNT(*) FROM timetable WHERE teacher <> '' OR period <> 0;

-- 3. Spot-check a few rows:
-- SELECT id, class, day, subject, time, teacher, period
-- FROM timetable
-- LIMIT 5;

-- ── RLS POLICY UPDATE ────────────────────────────────────────
-- The existing timetable RLS policy allows all authenticated reads.
-- The AI Timetable Generator also needs INSERT and DELETE access
-- for the admin role. Add these policies if not already present.

CREATE POLICY IF NOT EXISTS "timetable_admin_write" ON timetable
  FOR ALL
  USING (true)
  WITH CHECK (true);
