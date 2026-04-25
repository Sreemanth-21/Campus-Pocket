-- ============================================================
-- STEP 1: Run this entire file in Supabase SQL Editor
-- https://supabase.com/dashboard/project/vyxotymuqnpzgcdguvbe/sql/new
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tables
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'parent')),
  school_id TEXT NOT NULL DEFAULT 'school-demo-001',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  section TEXT NOT NULL,
  attendance_percentage NUMERIC DEFAULT 0,
  school_id TEXT NOT NULL DEFAULT 'school-demo-001',
  admission_number TEXT,
  date_of_birth DATE,
  gender TEXT,
  joining_date DATE,
  guardian_name TEXT,
  contact TEXT,
  email TEXT,
  blood_group TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  school_id TEXT NOT NULL DEFAULT 'school-demo-001',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parent_child (
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  PRIMARY KEY (parent_id, student_id)
);

CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)
);

CREATE TABLE IF NOT EXISTS grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  score NUMERIC NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PAID', 'PENDING', 'OVERDUE')),
  amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS timetable (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class TEXT NOT NULL,
  day TEXT NOT NULL,
  subject TEXT NOT NULL,
  time TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  date DATE NOT NULL,
  score NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  teacher_name TEXT NOT NULL,
  message TEXT NOT NULL,
  reply TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS circulars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id TEXT NOT NULL DEFAULT 'school-demo-001',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  has_file BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS helpdesk (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transport_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id TEXT NOT NULL DEFAULT 'school-demo-001',
  name TEXT NOT NULL,
  stops TEXT[] NOT NULL,
  morning_timing TEXT NOT NULL,
  return_timing TEXT NOT NULL,
  fee NUMERIC NOT NULL,
  total_seats INT NOT NULL,
  available_seats INT NOT NULL
);

CREATE TABLE IF NOT EXISTS transport_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE UNIQUE,
  route_id UUID REFERENCES transport_routes(id),
  stop TEXT NOT NULL,
  bus_number TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  driver_contact TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: enable but allow all (app handles scoping)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_child ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE circulars ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE helpdesk ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all" ON users               FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON students            FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON parents             FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON parent_child        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON attendance          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON grades              FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON fees                FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON timetable           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON exams               FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON messages            FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON circulars           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON requests            FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON helpdesk            FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON transport_routes    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON transport_assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON notifications       FOR ALL USING (true) WITH CHECK (true);
