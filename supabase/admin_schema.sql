-- ============================================================
-- Campus Pocket — Admin Backend Schema
-- Run in Supabase SQL Editor (project: vyxotymuqnpzgcdguvbe)
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================

-- Users (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('student','teacher','admin','parent')),
  school_id   TEXT NOT NULL DEFAULT 'school-demo-001',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Students
CREATE TABLE IF NOT EXISTS public.students (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  class_id              UUID,
  name                  TEXT NOT NULL,
  admission_number      TEXT UNIQUE,
  date_of_birth         DATE,
  gender                TEXT CHECK (gender IN ('Male','Female','Other')),
  joining_date          DATE DEFAULT CURRENT_DATE,
  guardian_name         TEXT,
  contact               TEXT,
  blood_group           TEXT,
  address               TEXT,
  attendance_percentage NUMERIC DEFAULT 0,
  school_id             TEXT NOT NULL DEFAULT 'school-demo-001',
  is_active             BOOLEAN DEFAULT TRUE,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Teachers
CREATE TABLE IF NOT EXISTS public.teachers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  name        TEXT NOT NULL,
  subject     TEXT,
  phone       TEXT,
  school_id   TEXT NOT NULL DEFAULT 'school-demo-001',
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Classrooms
CREATE TABLE IF NOT EXISTS public.classrooms (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  grade       TEXT NOT NULL,
  section     TEXT NOT NULL,
  teacher_id  UUID REFERENCES public.teachers(id),
  school_id   TEXT NOT NULL DEFAULT 'school-demo-001',
  capacity    INT DEFAULT 40,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(grade, section, school_id)
);

-- Attendance
CREATE TABLE IF NOT EXISTS public.attendance (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  UUID REFERENCES public.students(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('present','absent','late')),
  marked_by   UUID REFERENCES public.teachers(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- Grades
CREATE TABLE IF NOT EXISTS public.grades (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  UUID REFERENCES public.students(id) ON DELETE CASCADE,
  subject     TEXT NOT NULL,
  score       NUMERIC NOT NULL CHECK (score >= 0 AND score <= 100),
  date        DATE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Fees
CREATE TABLE IF NOT EXISTS public.fees (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  UUID REFERENCES public.students(id) ON DELETE CASCADE,
  term        TEXT NOT NULL,
  amount      NUMERIC NOT NULL CHECK (amount > 0),
  status      TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PAID','PENDING','OVERDUE')),
  due_date    DATE,
  paid_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Exams
CREATE TABLE IF NOT EXISTS public.exams (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  UUID REFERENCES public.students(id) ON DELETE CASCADE,
  subject     TEXT NOT NULL,
  date        DATE NOT NULL,
  score       NUMERIC CHECK (score >= 0 AND score <= 100),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Leads (admissions kiosk)
CREATE TABLE IF NOT EXISTS public.leads (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_name  TEXT NOT NULL,
  parent_name   TEXT,
  phone         TEXT,
  email         TEXT,
  grade_applying TEXT,
  status        TEXT DEFAULT 'new' CHECK (status IN ('new','contacted','enrolled','rejected')),
  notes         TEXT,
  school_id     TEXT NOT NULL DEFAULT 'school-demo-001',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log
CREATE TABLE IF NOT EXISTS public.audit_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action      TEXT NOT NULL,
  table_name  TEXT NOT NULL,
  record_id   UUID,
  performed_by UUID REFERENCES public.users(id),
  details     JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_students_school    ON public.students(school_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date    ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_grades_student     ON public.grades(student_id);
CREATE INDEX IF NOT EXISTS idx_fees_student       ON public.fees(student_id);
CREATE INDEX IF NOT EXISTS idx_fees_status        ON public.fees(status);
CREATE INDEX IF NOT EXISTS idx_users_role         ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_school       ON public.users(school_id);

-- ============================================================
-- AUTO-UPDATE updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- AUTO-UPDATE attendance_percentage on students
-- ============================================================
CREATE OR REPLACE FUNCTION recalc_attendance_percentage()
RETURNS TRIGGER AS $$
DECLARE
  total_days   INT;
  present_days INT;
BEGIN
  SELECT COUNT(*) INTO total_days
    FROM public.attendance WHERE student_id = NEW.student_id;
  SELECT COUNT(*) INTO present_days
    FROM public.attendance WHERE student_id = NEW.student_id AND status IN ('present','late');
  IF total_days > 0 THEN
    UPDATE public.students
      SET attendance_percentage = ROUND((present_days::NUMERIC / total_days) * 100, 1)
      WHERE id = NEW.student_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recalc_attendance
  AFTER INSERT OR UPDATE ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION recalc_attendance_percentage();

-- ============================================================
-- STORED FUNCTIONS
-- ============================================================

-- Dashboard stats
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_school_id TEXT DEFAULT 'school-demo-001')
RETURNS JSON AS $$
SELECT json_build_object(
  'total_students',    (SELECT COUNT(*) FROM public.students  WHERE school_id = p_school_id AND is_active = TRUE),
  'total_teachers',    (SELECT COUNT(*) FROM public.teachers  WHERE school_id = p_school_id AND is_active = TRUE),
  'total_classrooms',  (SELECT COUNT(*) FROM public.classrooms WHERE school_id = p_school_id),
  'total_revenue',     (SELECT COALESCE(SUM(amount),0) FROM public.fees f JOIN public.students s ON s.id = f.student_id WHERE s.school_id = p_school_id AND f.status = 'PAID'),
  'pending_fees',      (SELECT COALESCE(SUM(amount),0) FROM public.fees f JOIN public.students s ON s.id = f.student_id WHERE s.school_id = p_school_id AND f.status = 'PENDING'),
  'overdue_fees',      (SELECT COALESCE(SUM(amount),0) FROM public.fees f JOIN public.students s ON s.id = f.student_id WHERE s.school_id = p_school_id AND f.status = 'OVERDUE'),
  'low_attendance',    (SELECT COUNT(*) FROM public.students WHERE school_id = p_school_id AND attendance_percentage < 75 AND is_active = TRUE),
  'avg_attendance',    (SELECT ROUND(AVG(attendance_percentage),1) FROM public.students WHERE school_id = p_school_id AND is_active = TRUE),
  'avg_grade',         (SELECT ROUND(AVG(score),1) FROM public.grades g JOIN public.students s ON s.id = g.student_id WHERE s.school_id = p_school_id),
  'total_leads',       (SELECT COUNT(*) FROM public.leads WHERE school_id = p_school_id AND status = 'new')
);
$$ LANGUAGE sql SECURITY DEFINER;

-- Student full profile
CREATE OR REPLACE FUNCTION get_student_profile(p_student_id UUID)
RETURNS JSON AS $$
SELECT json_build_object(
  'student',    row_to_json(s),
  'user',       row_to_json(u),
  'attendance', (SELECT json_agg(a ORDER BY a.date DESC) FROM public.attendance a WHERE a.student_id = s.id),
  'grades',     (SELECT json_agg(g ORDER BY g.date DESC) FROM public.grades g WHERE g.student_id = s.id),
  'fees',       (SELECT json_agg(f ORDER BY f.created_at DESC) FROM public.fees f WHERE f.student_id = s.id),
  'exams',      (SELECT json_agg(e ORDER BY e.date DESC) FROM public.exams e WHERE e.student_id = s.id),
  'att_summary', json_build_object(
    'total',   (SELECT COUNT(*) FROM public.attendance WHERE student_id = s.id),
    'present', (SELECT COUNT(*) FROM public.attendance WHERE student_id = s.id AND status = 'present'),
    'absent',  (SELECT COUNT(*) FROM public.attendance WHERE student_id = s.id AND status = 'absent'),
    'late',    (SELECT COUNT(*) FROM public.attendance WHERE student_id = s.id AND status = 'late')
  ),
  'grade_summary', json_build_object(
    'avg',     (SELECT ROUND(AVG(score),1) FROM public.grades WHERE student_id = s.id),
    'highest', (SELECT MAX(score) FROM public.grades WHERE student_id = s.id),
    'lowest',  (SELECT MIN(score) FROM public.grades WHERE student_id = s.id)
  )
)
FROM public.students s
JOIN public.users u ON u.id = s.user_id
WHERE s.id = p_student_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Fee summary per student
CREATE OR REPLACE FUNCTION get_fee_summary(p_school_id TEXT DEFAULT 'school-demo-001')
RETURNS TABLE (
  student_id   UUID,
  student_name TEXT,
  class        TEXT,
  total_paid   NUMERIC,
  total_due    NUMERIC,
  fee_status   TEXT
) AS $$
SELECT
  s.id,
  s.name,
  s.class_id::TEXT,
  COALESCE(SUM(CASE WHEN f.status = 'PAID'    THEN f.amount ELSE 0 END), 0),
  COALESCE(SUM(CASE WHEN f.status != 'PAID'   THEN f.amount ELSE 0 END), 0),
  CASE
    WHEN bool_or(f.status = 'OVERDUE') THEN 'OVERDUE'
    WHEN bool_or(f.status = 'PENDING') THEN 'PENDING'
    ELSE 'PAID'
  END
FROM public.students s
LEFT JOIN public.fees f ON f.student_id = s.id
WHERE s.school_id = p_school_id AND s.is_active = TRUE
GROUP BY s.id, s.name, s.class_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Mark attendance for a class (bulk)
CREATE OR REPLACE FUNCTION mark_bulk_attendance(
  p_records JSONB  -- [{ student_id, date, status }]
) RETURNS JSON AS $$
DECLARE
  rec     JSONB;
  success INT := 0;
  failed  INT := 0;
BEGIN
  FOR rec IN SELECT * FROM jsonb_array_elements(p_records)
  LOOP
    BEGIN
      INSERT INTO public.attendance(student_id, date, status)
      VALUES (
        (rec->>'student_id')::UUID,
        (rec->>'date')::DATE,
        rec->>'status'
      )
      ON CONFLICT (student_id, date) DO UPDATE SET status = EXCLUDED.status;
      success := success + 1;
    EXCEPTION WHEN OTHERS THEN
      failed := failed + 1;
    END;
  END LOOP;
  RETURN json_build_object('success', success, 'failed', failed);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log   ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get current user's school
CREATE OR REPLACE FUNCTION current_user_school()
RETURNS TEXT AS $$
  SELECT school_id FROM public.users WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- USERS: admin sees all in school; others see own record
CREATE POLICY "users_admin_all"   ON public.users FOR ALL
  USING (current_user_role() = 'admin' AND school_id = current_user_school());
CREATE POLICY "users_self"        ON public.users FOR SELECT
  USING (auth_id = auth.uid());

-- STUDENTS: admin full access; student sees own; parent sees linked children
CREATE POLICY "students_admin"    ON public.students FOR ALL
  USING (current_user_role() = 'admin' AND school_id = current_user_school());
CREATE POLICY "students_self"     ON public.students FOR SELECT
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "students_parent"   ON public.students FOR SELECT
  USING (id IN (
    SELECT pc.student_id FROM public.parent_child pc
    JOIN public.parents p ON p.id = pc.parent_id
    JOIN public.users u ON u.id = p.user_id
    WHERE u.auth_id = auth.uid()
  ));

-- TEACHERS: admin full; teacher sees own
CREATE POLICY "teachers_admin"    ON public.teachers FOR ALL
  USING (current_user_role() = 'admin' AND school_id = current_user_school());
CREATE POLICY "teachers_self"     ON public.teachers FOR SELECT
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- CLASSROOMS: admin full; others read
CREATE POLICY "classrooms_admin"  ON public.classrooms FOR ALL
  USING (current_user_role() = 'admin' AND school_id = current_user_school());
CREATE POLICY "classrooms_read"   ON public.classrooms FOR SELECT
  USING (school_id = current_user_school());

-- ATTENDANCE: admin full; teacher insert/update; student/parent read own
CREATE POLICY "att_admin"         ON public.attendance FOR ALL
  USING (current_user_role() = 'admin');
CREATE POLICY "att_teacher_write" ON public.attendance FOR INSERT
  WITH CHECK (current_user_role() = 'teacher');
CREATE POLICY "att_teacher_update"ON public.attendance FOR UPDATE
  USING (current_user_role() = 'teacher');
CREATE POLICY "att_student_read"  ON public.attendance FOR SELECT
  USING (student_id IN (
    SELECT s.id FROM public.students s
    JOIN public.users u ON u.id = s.user_id WHERE u.auth_id = auth.uid()
  ));

-- GRADES: admin full; student/parent read own
CREATE POLICY "grades_admin"      ON public.grades FOR ALL
  USING (current_user_role() = 'admin');
CREATE POLICY "grades_student"    ON public.grades FOR SELECT
  USING (student_id IN (
    SELECT s.id FROM public.students s
    JOIN public.users u ON u.id = s.user_id WHERE u.auth_id = auth.uid()
  ));

-- FEES: admin full; student/parent read own
CREATE POLICY "fees_admin"        ON public.fees FOR ALL
  USING (current_user_role() = 'admin');
CREATE POLICY "fees_student"      ON public.fees FOR SELECT
  USING (student_id IN (
    SELECT s.id FROM public.students s
    JOIN public.users u ON u.id = s.user_id WHERE u.auth_id = auth.uid()
  ));

-- LEADS: admin only
CREATE POLICY "leads_admin"       ON public.leads FOR ALL
  USING (current_user_role() = 'admin' AND school_id = current_user_school());
CREATE POLICY "leads_insert_anon" ON public.leads FOR INSERT
  WITH CHECK (true); -- allow kiosk inserts without auth

-- AUDIT LOG: admin read; system insert
CREATE POLICY "audit_admin"       ON public.audit_log FOR SELECT
  USING (current_user_role() = 'admin');
CREATE POLICY "audit_insert"      ON public.audit_log FOR INSERT
  WITH CHECK (true);
