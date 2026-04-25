-- ============================================================
-- Campus Pocket — Full Schema + RLS + Seed Data
-- Run this entire file in Supabase SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables (clean slate)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS timetable CASCADE;
DROP TABLE IF EXISTS fees CASCADE;
DROP TABLE IF EXISTS grades CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS parent_child CASCADE;
DROP TABLE IF EXISTS parents CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS circulars CASCADE;
DROP TABLE IF EXISTS requests CASCADE;
DROP TABLE IF EXISTS helpdesk CASCADE;
DROP TABLE IF EXISTS transport_routes CASCADE;
DROP TABLE IF EXISTS transport_assignments CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- ── USERS ────────────────────────────────────────────────────
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'parent')),
  school_id TEXT NOT NULL DEFAULT 'school-demo-001',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── STUDENTS ─────────────────────────────────────────────────
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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

-- ── PARENTS ──────────────────────────────────────────────────
CREATE TABLE parents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  school_id TEXT NOT NULL DEFAULT 'school-demo-001',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── PARENT-CHILD LINK ────────────────────────────────────────
CREATE TABLE parent_child (
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  PRIMARY KEY (parent_id, student_id)
);

-- ── ATTENDANCE ───────────────────────────────────────────────
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- ── GRADES ───────────────────────────────────────────────────
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  score NUMERIC NOT NULL CHECK (score >= 0 AND score <= 100),
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── FEES ─────────────────────────────────────────────────────
CREATE TABLE fees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PAID', 'PENDING', 'OVERDUE')),
  amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── TIMETABLE ────────────────────────────────────────────────
CREATE TABLE timetable (
  id      UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  class   TEXT    NOT NULL,
  day     TEXT    NOT NULL,
  subject TEXT    NOT NULL,
  time    TEXT    NOT NULL,
  teacher TEXT    NOT NULL DEFAULT '',   -- assigned teacher name; '' for legacy rows
  period  INTEGER NOT NULL DEFAULT 0     -- period number within the day; 0 for legacy rows
);

-- ── EXAMS ────────────────────────────────────────────────────
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  date DATE NOT NULL,
  score NUMERIC CHECK (score >= 0 AND score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── MESSAGES ─────────────────────────────────────────────────
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  teacher_name TEXT NOT NULL,
  message TEXT NOT NULL,
  reply TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── CIRCULARS ────────────────────────────────────────────────
CREATE TABLE circulars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id TEXT NOT NULL DEFAULT 'school-demo-001',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  has_file BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── REQUESTS ─────────────────────────────────────────────────
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Approved','Rejected','In Progress')),
  response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── HELPDESK ─────────────────────────────────────────────────
CREATE TABLE helpdesk (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Complaint','Feedback','Query')),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','In Progress','Resolved','Rejected')),
  response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── TRANSPORT ROUTES ─────────────────────────────────────────
CREATE TABLE transport_routes (
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

-- ── TRANSPORT ASSIGNMENTS ────────────────────────────────────
CREATE TABLE transport_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE UNIQUE,
  route_id UUID REFERENCES transport_routes(id),
  stop TEXT NOT NULL,
  bus_number TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  driver_contact TEXT NOT NULL
);

-- ── NOTIFICATIONS ────────────────────────────────────────────
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
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

-- Allow all authenticated reads (app uses user_id scoping in queries)
CREATE POLICY "auth_read_users" ON users FOR SELECT USING (true);
CREATE POLICY "auth_read_students" ON students FOR SELECT USING (true);
CREATE POLICY "auth_read_parents" ON parents FOR SELECT USING (true);
CREATE POLICY "auth_read_parent_child" ON parent_child FOR SELECT USING (true);
CREATE POLICY "auth_read_attendance" ON attendance FOR SELECT USING (true);
CREATE POLICY "auth_read_grades" ON grades FOR SELECT USING (true);
CREATE POLICY "auth_read_fees" ON fees FOR SELECT USING (true);
CREATE POLICY "auth_read_timetable" ON timetable FOR SELECT USING (true);
CREATE POLICY "auth_read_exams" ON exams FOR SELECT USING (true);
CREATE POLICY "auth_read_messages" ON messages FOR ALL USING (true);
CREATE POLICY "auth_read_circulars" ON circulars FOR SELECT USING (true);
CREATE POLICY "auth_read_requests" ON requests FOR ALL USING (true);
CREATE POLICY "auth_read_helpdesk" ON helpdesk FOR ALL USING (true);
CREATE POLICY "auth_read_transport_routes" ON transport_routes FOR SELECT USING (true);
CREATE POLICY "auth_read_transport_assignments" ON transport_assignments FOR SELECT USING (true);
CREATE POLICY "auth_read_notifications" ON notifications FOR ALL USING (true);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Users
INSERT INTO users (id, username, role, school_id) VALUES
  ('11111111-0000-0000-0000-000000000001', 'alex.johnson',   'student', 'school-demo-001'),
  ('11111111-0000-0000-0000-000000000002', 'priya.sharma',   'student', 'school-demo-001'),
  ('11111111-0000-0000-0000-000000000003', 'robert.johnson', 'parent',  'school-demo-001');

-- Students
INSERT INTO students (id, user_id, name, class, section, attendance_percentage, school_id,
  admission_number, date_of_birth, gender, joining_date, guardian_name, contact, email, blood_group, address) VALUES
  ('22222222-0000-0000-0000-000000000001',
   '11111111-0000-0000-0000-000000000001',
   'Alex Johnson', '10', 'A', 82, 'school-demo-001',
   'ADM-2021-001', '2008-04-15', 'Male', '2021-06-01',
   'Robert Johnson', '+1 (555) 012-3456', 'alex.johnson@demo.edu', 'O+', '42 Maple Street, Springfield'),
  ('22222222-0000-0000-0000-000000000002',
   '11111111-0000-0000-0000-000000000002',
   'Priya Sharma', '10', 'B', 68, 'school-demo-001',
   'ADM-2021-002', '2008-09-22', 'Female', '2021-06-01',
   'Robert Johnson', '+1 (555) 098-7654', 'priya.sharma@demo.edu', 'B+', '18 Oak Avenue, Springfield');

-- Parents
INSERT INTO parents (id, user_id, name, school_id) VALUES
  ('33333333-0000-0000-0000-000000000001',
   '11111111-0000-0000-0000-000000000003',
   'Robert Johnson', 'school-demo-001');

-- Parent-child links
INSERT INTO parent_child (parent_id, student_id) VALUES
  ('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001'),
  ('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000002');

-- Attendance (Alex — 82%, Priya — 68%, last 60 weekdays)
DO $$
DECLARE
  d DATE;
  i INT;
  rand_val FLOAT;
BEGIN
  FOR i IN 0..59 LOOP
    d := CURRENT_DATE - (i * INTERVAL '1 day');
    IF EXTRACT(DOW FROM d) NOT IN (0, 6) THEN
      rand_val := random() * 100;
      INSERT INTO attendance (student_id, date, status) VALUES (
        '22222222-0000-0000-0000-000000000001', d,
        CASE WHEN rand_val < 77 THEN 'present' WHEN rand_val < 87 THEN 'late' ELSE 'absent' END
      ) ON CONFLICT DO NOTHING;
      rand_val := random() * 100;
      INSERT INTO attendance (student_id, date, status) VALUES (
        '22222222-0000-0000-0000-000000000002', d,
        CASE WHEN rand_val < 63 THEN 'present' WHEN rand_val < 73 THEN 'late' ELSE 'absent' END
      ) ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- Grades
INSERT INTO grades (student_id, subject, score, date) VALUES
  ('22222222-0000-0000-0000-000000000001', 'Mathematics', 88, '2024-01-15'),
  ('22222222-0000-0000-0000-000000000001', 'Science',     92, '2024-01-20'),
  ('22222222-0000-0000-0000-000000000001', 'English',     76, '2024-02-05'),
  ('22222222-0000-0000-0000-000000000001', 'History',     84, '2024-02-10'),
  ('22222222-0000-0000-0000-000000000001', 'Mathematics', 91, '2024-02-20'),
  ('22222222-0000-0000-0000-000000000001', 'Science',     87, '2024-03-01'),
  ('22222222-0000-0000-0000-000000000001', 'English',     80, '2024-03-10'),
  ('22222222-0000-0000-0000-000000000001', 'Mathematics', 94, '2024-03-20'),
  ('22222222-0000-0000-0000-000000000002', 'Mathematics', 72, '2024-01-15'),
  ('22222222-0000-0000-0000-000000000002', 'Science',     65, '2024-01-20'),
  ('22222222-0000-0000-0000-000000000002', 'English',     88, '2024-02-05'),
  ('22222222-0000-0000-0000-000000000002', 'History',     79, '2024-02-10'),
  ('22222222-0000-0000-0000-000000000002', 'Mathematics', 68, '2024-02-20'),
  ('22222222-0000-0000-0000-000000000002', 'Science',     71, '2024-03-01');

-- Fees
INSERT INTO fees (student_id, term, status, amount) VALUES
  ('22222222-0000-0000-0000-000000000001', 'Term 1 2024', 'PAID',    15000),
  ('22222222-0000-0000-0000-000000000001', 'Term 2 2024', 'PAID',    15000),
  ('22222222-0000-0000-0000-000000000001', 'Term 3 2024', 'PENDING', 15000),
  ('22222222-0000-0000-0000-000000000002', 'Term 1 2024', 'PAID',    15000),
  ('22222222-0000-0000-0000-000000000002', 'Term 2 2024', 'OVERDUE', 15000),
  ('22222222-0000-0000-0000-000000000002', 'Term 3 2024', 'OVERDUE', 15000);

-- Timetable
INSERT INTO timetable (class, day, subject, time) VALUES
  ('10','Monday','Mathematics','08:00 - 09:00'),
  ('10','Monday','Science','09:00 - 10:00'),
  ('10','Monday','English','10:30 - 11:30'),
  ('10','Monday','History','11:30 - 12:30'),
  ('10','Tuesday','Physics','08:00 - 09:00'),
  ('10','Tuesday','Chemistry','09:00 - 10:00'),
  ('10','Tuesday','Mathematics','10:30 - 11:30'),
  ('10','Tuesday','PE','11:30 - 12:30'),
  ('10','Wednesday','English','08:00 - 09:00'),
  ('10','Wednesday','Art','09:00 - 10:00'),
  ('10','Wednesday','Science','10:30 - 11:30'),
  ('10','Wednesday','Mathematics','11:30 - 12:30'),
  ('10','Thursday','History','08:00 - 09:00'),
  ('10','Thursday','Physics','09:00 - 10:00'),
  ('10','Thursday','English','10:30 - 11:30'),
  ('10','Thursday','Chemistry','11:30 - 12:30'),
  ('10','Friday','Mathematics','08:00 - 09:00'),
  ('10','Friday','Science','09:00 - 10:00'),
  ('10','Friday','PE','10:30 - 11:30'),
  ('10','Friday','Art','11:30 - 12:30');

-- Exams
INSERT INTO exams (student_id, subject, date, score) VALUES
  ('22222222-0000-0000-0000-000000000001', 'Mathematics', '2024-04-10', 91),
  ('22222222-0000-0000-0000-000000000001', 'Science',     '2024-04-12', 88),
  ('22222222-0000-0000-0000-000000000001', 'English',     '2024-04-15', 79),
  ('22222222-0000-0000-0000-000000000001', 'History',     '2025-06-20', NULL),
  ('22222222-0000-0000-0000-000000000001', 'Physics',     '2025-06-22', NULL),
  ('22222222-0000-0000-0000-000000000002', 'Mathematics', '2024-04-10', 70),
  ('22222222-0000-0000-0000-000000000002', 'Science',     '2024-04-12', 65),
  ('22222222-0000-0000-0000-000000000002', 'English',     '2024-04-15', 85),
  ('22222222-0000-0000-0000-000000000002', 'History',     '2025-06-20', NULL);

-- Messages
INSERT INTO messages (parent_id, teacher_name, message, reply, created_at) VALUES
  ('33333333-0000-0000-0000-000000000001', 'Ms. Williams',
   'Alex has been performing exceptionally well in Mathematics this semester.',
   'Thank you for the update! We are very proud of Alex.',
   '2024-03-15T10:00:00Z'),
  ('33333333-0000-0000-0000-000000000001', 'Mr. Davis',
   'Priya needs to improve her attendance. She has missed several Science classes.',
   NULL,
   '2024-03-20T14:00:00Z');

-- Circulars
INSERT INTO circulars (school_id, title, description, has_file, created_at) VALUES
  ('school-demo-001', 'Annual Sports Day 2024',
   'Annual Sports Day will be held on April 20th. All students must participate. Parents are cordially invited to attend the event from 9:00 AM onwards at the school ground.',
   TRUE, '2024-04-01T00:00:00Z'),
  ('school-demo-001', 'Summer Vacation Notice',
   'School will remain closed for summer vacation from May 1st to June 15th. Classes will resume on June 17th. Students are advised to complete their holiday homework.',
   TRUE, '2024-03-25T00:00:00Z'),
  ('school-demo-001', 'Parent-Teacher Meeting',
   'PTM is scheduled for March 30th between 10:00 AM – 1:00 PM. Parents are requested to meet the respective class teachers to discuss their ward''s academic progress.',
   FALSE, '2024-03-18T00:00:00Z'),
  ('school-demo-001', 'Fee Payment Reminder',
   'Term 3 fee payment deadline is April 15th. Parents are requested to clear dues before the deadline to avoid late fee charges.',
   FALSE, '2024-03-10T00:00:00Z'),
  ('school-demo-001', 'New Library Books Available',
   'The school library has added 200+ new books across Science, Literature, and History. Students can borrow up to 2 books at a time for 14 days.',
   FALSE, '2024-03-05T00:00:00Z');

-- Requests
INSERT INTO requests (parent_id, student_id, type, reason, status, response, created_at) VALUES
  ('33333333-0000-0000-0000-000000000001',
   '22222222-0000-0000-0000-000000000001',
   'Bonafide Request', 'Required for bank account opening',
   'Approved', 'Certificate ready for collection from the office.',
   '2024-03-10T00:00:00Z'),
  ('33333333-0000-0000-0000-000000000001',
   '22222222-0000-0000-0000-000000000002',
   'TC Request', 'School transfer to another city',
   'Pending', NULL,
   '2024-03-20T00:00:00Z');

-- Helpdesk
INSERT INTO helpdesk (parent_id, subject, category, description, status, response, created_at) VALUES
  ('33333333-0000-0000-0000-000000000001',
   'Fee receipt not received', 'Query',
   'I paid Term 2 fees online but did not receive the receipt.',
   'Resolved', 'Receipt has been emailed to your registered email address. Please check your spam folder.',
   '2024-03-05T00:00:00Z'),
  ('33333333-0000-0000-0000-000000000001',
   'Bus timing issue', 'Complaint',
   'The school bus on Route A is consistently arriving 15 minutes late.',
   'In Progress', 'We have escalated this to the transport department. Will be resolved by next week.',
   '2024-03-22T00:00:00Z');

-- Transport routes
INSERT INTO transport_routes (id, school_id, name, stops, morning_timing, return_timing, fee, total_seats, available_seats) VALUES
  ('44444444-0000-0000-0000-000000000001', 'school-demo-001',
   'Route A — North Zone',
   ARRAY['City Center','Park Street','Lake View','Green Colony','School'],
   '7:30 AM – 8:15 AM', '3:30 PM – 4:15 PM', 2500, 40, 5),
  ('44444444-0000-0000-0000-000000000002', 'school-demo-001',
   'Route B — South Zone',
   ARRAY['Railway Station','Market Road','Sunrise Apartments','Hill View','School'],
   '7:15 AM – 8:10 AM', '3:30 PM – 4:25 PM', 2800, 35, 2),
  ('44444444-0000-0000-0000-000000000003', 'school-demo-001',
   'Route C — East Zone',
   ARRAY['Tech Park','Sector 5','Old Town','River Bridge','School'],
   '7:45 AM – 8:20 AM', '3:30 PM – 4:05 PM', 2200, 45, 12);

-- Transport assignment
INSERT INTO transport_assignments (student_id, route_id, stop, bus_number, driver_name, driver_contact) VALUES
  ('22222222-0000-0000-0000-000000000001',
   '44444444-0000-0000-0000-000000000001',
   'Park Street', 'KA-01-AB-1234', 'Mr. Ramesh Kumar', '+91 98765 43210');

-- Notifications
INSERT INTO notifications (user_id, type, message, severity, read) VALUES
  ('11111111-0000-0000-0000-000000000003', 'fee',        'Fee for Term 3 is due in 5 days',          'warning',  FALSE),
  ('11111111-0000-0000-0000-000000000003', 'attendance', 'Priya''s attendance dropped below 75%',    'critical', FALSE),
  ('11111111-0000-0000-0000-000000000001', 'exam',       'History exam scheduled on June 20',        'info',     FALSE),
  ('11111111-0000-0000-0000-000000000001', 'exam',       'Physics exam scheduled on June 22',        'info',     FALSE);
