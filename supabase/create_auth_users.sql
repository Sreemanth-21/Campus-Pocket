-- ============================================================
-- Run this AFTER schema.sql in Supabase SQL Editor
-- Creates Supabase Auth users linked to our users table
-- ============================================================

-- Create auth users with matching UUIDs
-- NOTE: In Supabase dashboard you can also create users manually via
-- Authentication > Users > Add User

-- Option 1: Use Supabase Dashboard
-- Go to Authentication > Users > "Add user"
-- Email: alex.johnson@campus.local   Password: student123
-- Email: priya.sharma@campus.local   Password: student123  
-- Email: robert.johnson@campus.local Password: parent123
-- Then copy the generated UUIDs and update the users table IDs to match.

-- Option 2: Use this SQL (requires service_role key, not anon key)
-- Run via Supabase CLI or service role client only

SELECT 'Please create auth users manually in Supabase Dashboard:' as instruction;
SELECT 'Authentication > Users > Add User' as step1;
SELECT 'alex.johnson@campus.local / student123' as user1;
SELECT 'priya.sharma@campus.local / student123' as user2;
SELECT 'robert.johnson@campus.local / parent123' as user3;
SELECT 'Then update users table IDs to match the generated auth UUIDs' as step2;
