-- ============================================================
-- Campus Pocket — Teacher Portal Schema
-- Run in Supabase SQL Editor after admin_schema.sql
-- ============================================================

-- ── CLASSROOMS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.classrooms (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id  UUID REFERENCES public.teachers(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  grade       TEXT,
  section     TEXT,
  subject     TEXT,
  school_id   TEXT NOT NULL DEFAULT 'school-demo-001',
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── CLASSROOM STUDENTS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.classroom_students (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE,
  student_id   UUID REFERENCES public.students(id)   ON DELETE CASCADE,
  joined_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(classroom_id, student_id)
);

-- ── ASSIGNMENTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.assignments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  due_date     TIMESTAMPTZ,
  max_score    NUMERIC DEFAULT 100,
  is_published BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── ASSIGNMENT SUBMISSIONS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.submissions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id    UUID REFERENCES public.students(id)    ON DELETE CASCADE,
  content       TEXT,
  score         NUMERIC,
  feedback      TEXT,
  submitted_at  TIMESTAMPTZ DEFAULT NOW(),
  graded_at     TIMESTAMPTZ,
  status        TEXT DEFAULT 'submitted' CHECK (status IN ('submitted','graded','late')),
  UNIQUE(assignment_id, student_id)
);

-- ── TESTS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tests (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  test_date    TIMESTAMPTZ,
  duration_min INT DEFAULT 60,
  max_score    NUMERIC DEFAULT 100,
  is_published BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── TEST RESULTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.test_results (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id    UUID REFERENCES public.tests(id)    ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  score      NUMERIC,
  feedback   TEXT,
  graded_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(test_id, student_id)
);

-- ── CALENDAR EVENTS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  event_date   TIMESTAMPTZ NOT NULL,
  event_type   TEXT DEFAULT 'general' CHECK (event_type IN ('general','exam','holiday','meeting','deadline')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── ANNOUNCEMENTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.announcements (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  message      TEXT NOT NULL,
  priority     TEXT DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── NOTIFICATIONS (REAL-TIME) ────────────────────────────────
-- Drop and recreate to ensure correct schema
DROP TABLE IF EXISTS public.notifications CASCADE;
CREATE TABLE public.notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL,   -- references users.id (not auth.users)
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  type       TEXT DEFAULT 'info' CHECK (type IN ('info','assignment','test','announcement','fee','attendance','exam')),
  ref_id     UUID,            -- optional: id of the related record
  ref_table  TEXT,            -- optional: table name of related record
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── INDEXES ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_classrooms_teacher    ON public.classrooms(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_school     ON public.classrooms(school_id);
CREATE INDEX IF NOT EXISTS idx_cs_classroom          ON public.classroom_students(classroom_id);
CREATE INDEX IF NOT EXISTS idx_cs_student            ON public.classroom_students(student_id);
CREATE INDEX IF NOT EXISTS idx_assignments_classroom ON public.assignments(classroom_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON public.submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student   ON public.submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_tests_classroom       ON public.tests(classroom_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test     ON public.test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_test_results_student  ON public.test_results(student_id);
CREATE INDEX IF NOT EXISTS idx_events_classroom      ON public.calendar_events(classroom_id);
CREATE INDEX IF NOT EXISTS idx_events_date           ON public.calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_announcements_class   ON public.announcements(classroom_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user    ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read    ON public.notifications(user_id, is_read);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.classrooms          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_students  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications       ENABLE ROW LEVEL SECURITY;

-- Classrooms: teacher owns, students in class can read, admin full
CREATE POLICY "classrooms_teacher_own"  ON public.classrooms FOR ALL
  USING (teacher_id IN (SELECT id FROM public.teachers WHERE user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())));
CREATE POLICY "classrooms_student_read" ON public.classrooms FOR SELECT
  USING (id IN (SELECT classroom_id FROM public.classroom_students cs JOIN public.students s ON s.id = cs.student_id JOIN public.users u ON u.id = s.user_id WHERE u.auth_id = auth.uid()));
CREATE POLICY "classrooms_admin"        ON public.classrooms FOR ALL
  USING (current_user_role() = 'admin');

-- Classroom students: teacher manages, student reads own
CREATE POLICY "cs_teacher"  ON public.classroom_students FOR ALL
  USING (classroom_id IN (SELECT id FROM public.classrooms WHERE teacher_id IN (SELECT id FROM public.teachers WHERE user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()))));
CREATE POLICY "cs_student"  ON public.classroom_students FOR SELECT
  USING (student_id IN (SELECT id FROM public.students WHERE user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())));
CREATE POLICY "cs_admin"    ON public.classroom_students FOR ALL
  USING (current_user_role() = 'admin');

-- Assignments: teacher creates, students in class read
CREATE POLICY "assign_teacher" ON public.assignments FOR ALL
  USING (classroom_id IN (SELECT id FROM public.classrooms WHERE teacher_id IN (SELECT id FROM public.teachers WHERE user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()))));
CREATE POLICY "assign_student" ON public.assignments FOR SELECT
  USING (classroom_id IN (SELECT classroom_id FROM public.classroom_students cs JOIN public.students s ON s.id = cs.student_id JOIN public.users u ON u.id = s.user_id WHERE u.auth_id = auth.uid()));
CREATE POLICY "assign_admin"   ON public.assignments FOR ALL
  USING (current_user_role() = 'admin');

-- Submissions: student owns, teacher reads/grades
CREATE POLICY "sub_student"  ON public.submissions FOR ALL
  USING (student_id IN (SELECT id FROM public.students WHERE user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())));
CREATE POLICY "sub_teacher"  ON public.submissions FOR ALL
  USING (assignment_id IN (SELECT id FROM public.assignments WHERE classroom_id IN (SELECT id FROM public.classrooms WHERE teacher_id IN (SELECT id FROM public.teachers WHERE user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())))));
CREATE POLICY "sub_admin"    ON public.submissions FOR ALL
  USING (current_user_role() = 'admin');

-- Tests: same pattern as assignments
CREATE POLICY "tests_teacher" ON public.tests FOR ALL
  USING (classroom_id IN (SELECT id FROM public.classrooms WHERE teacher_id IN (SELECT id FROM public.teachers WHERE user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()))));
CREATE POLICY "tests_student" ON public.tests FOR SELECT
  USING (classroom_id IN (SELECT classroom_id FROM public.classroom_students cs JOIN public.students s ON s.id = cs.student_id JOIN public.users u ON u.id = s.user_id WHERE u.auth_id = auth.uid()));
CREATE POLICY "tests_admin"   ON public.tests FOR ALL
  USING (current_user_role() = 'admin');

-- Test results: student reads own, teacher reads/writes
CREATE POLICY "tr_student"  ON public.test_results FOR SELECT
  USING (student_id IN (SELECT id FROM public.students WHERE user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())));
CREATE POLICY "tr_teacher"  ON public.test_results FOR ALL
  USING (test_id IN (SELECT id FROM public.tests WHERE classroom_id IN (SELECT id FROM public.classrooms WHERE teacher_id IN (SELECT id FROM public.teachers WHERE user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())))));
CREATE POLICY "tr_admin"    ON public.test_results FOR ALL
  USING (current_user_role() = 'admin');

-- Calendar events, announcements: teacher writes, students read
CREATE POLICY "events_teacher" ON public.calendar_events FOR ALL
  USING (classroom_id IN (SELECT id FROM public.classrooms WHERE teacher_id IN (SELECT id FROM public.teachers WHERE user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()))));
CREATE POLICY "events_student" ON public.calendar_events FOR SELECT
  USING (classroom_id IN (SELECT classroom_id FROM public.classroom_students cs JOIN public.students s ON s.id = cs.student_id JOIN public.users u ON u.id = s.user_id WHERE u.auth_id = auth.uid()));

CREATE POLICY "ann_teacher"    ON public.announcements FOR ALL
  USING (classroom_id IN (SELECT id FROM public.classrooms WHERE teacher_id IN (SELECT id FROM public.teachers WHERE user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()))));
CREATE POLICY "ann_student"    ON public.announcements FOR SELECT
  USING (classroom_id IN (SELECT classroom_id FROM public.classroom_students cs JOIN public.students s ON s.id = cs.student_id JOIN public.users u ON u.id = s.user_id WHERE u.auth_id = auth.uid()));

-- Notifications: user reads/updates own; system inserts
CREATE POLICY "notif_own"    ON public.notifications FOR SELECT
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "notif_update" ON public.notifications FOR UPDATE
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "notif_insert" ON public.notifications FOR INSERT
  WITH CHECK (true);  -- server-side inserts from functions
CREATE POLICY "notif_admin"  ON public.notifications FOR ALL
  USING (current_user_role() = 'admin');

-- ── STORED FUNCTIONS ─────────────────────────────────────────

-- Bulk notify all students in a classroom
CREATE OR REPLACE FUNCTION notify_classroom_students(
  p_classroom_id UUID,
  p_title        TEXT,
  p_message      TEXT,
  p_type         TEXT DEFAULT 'info',
  p_ref_id       UUID DEFAULT NULL,
  p_ref_table    TEXT DEFAULT NULL
) RETURNS INT AS $$
DECLARE
  student_user_id UUID;
  count_sent      INT := 0;
BEGIN
  FOR student_user_id IN
    SELECT s.user_id
    FROM public.classroom_students cs
    JOIN public.students s ON s.id = cs.student_id
    WHERE cs.classroom_id = p_classroom_id
  LOOP
    INSERT INTO public.notifications(user_id, title, message, type, ref_id, ref_table)
    VALUES (student_user_id, p_title, p_message, p_type, p_ref_id, p_ref_table);
    count_sent := count_sent + 1;
  END LOOP;
  RETURN count_sent;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get classroom summary for teacher dashboard
CREATE OR REPLACE FUNCTION get_classroom_summary(p_classroom_id UUID)
RETURNS JSON AS $$
SELECT json_build_object(
  'classroom',        row_to_json(c),
  'student_count',    (SELECT COUNT(*) FROM public.classroom_students WHERE classroom_id = p_classroom_id),
  'assignment_count', (SELECT COUNT(*) FROM public.assignments WHERE classroom_id = p_classroom_id),
  'test_count',       (SELECT COUNT(*) FROM public.tests WHERE classroom_id = p_classroom_id),
  'pending_submissions', (
    SELECT COUNT(*) FROM public.submissions sub
    JOIN public.assignments a ON a.id = sub.assignment_id
    WHERE a.classroom_id = p_classroom_id AND sub.status = 'submitted' AND sub.score IS NULL
  ),
  'upcoming_events',  (
    SELECT json_agg(e ORDER BY e.event_date)
    FROM public.calendar_events e
    WHERE e.classroom_id = p_classroom_id AND e.event_date >= NOW()
    LIMIT 5
  ),
  'recent_announcements', (
    SELECT json_agg(a ORDER BY a.created_at DESC)
    FROM public.announcements a
    WHERE a.classroom_id = p_classroom_id
    LIMIT 3
  )
)
FROM public.classrooms c
WHERE c.id = p_classroom_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Get unread notification count for a user
CREATE OR REPLACE FUNCTION get_unread_count(p_user_id UUID)
RETURNS INT AS $$
  SELECT COUNT(*)::INT FROM public.notifications
  WHERE user_id = p_user_id AND is_read = FALSE;
$$ LANGUAGE sql SECURITY DEFINER STABLE;
