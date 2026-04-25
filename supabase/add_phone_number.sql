-- ============================================================
-- Add phone_number to parents table
-- Run in Supabase SQL Editor
-- ============================================================

ALTER TABLE parents
  ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Update demo parent with phone number
-- ⚠️  Replace with your real demo phone number in E.164 format
UPDATE parents
  SET phone_number = '+919999999999'
  WHERE id = '33333333-0000-0000-0000-000000000001';
