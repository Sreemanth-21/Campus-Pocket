/**
 * Campus Pocket — Teacher Portal API
 * All functions accept the supabase client as first argument.
 * Real-time subscriptions return a channel that must be unsubscribed on cleanup.
 */
import { supabase } from './supabase'

// ── HELPERS ──────────────────────────────────────────────────

/**
 * Bulk-insert notifications for all students in a classroom.
 * Uses the stored function for atomicity and performance.
 */
async function notifyClassroom(classroomId, title, message, type = 'info', refId = null, refTable = null) {
  const { data, error } = await supabase.rpc('notify_classroom_students', {
    p_classroom_id: classroomId,
    p_title:        title,
    p_message:      message,
    p_type:         type,
    p_ref_id:       refId,
    p_ref_table:    refTable,
  })
  if (error) console.error('[notifyClassroom]', error.message)
  return data // number of notifications sent
}

// ── CLASSROOMS ───────────────────────────────────────────────

/**
 * Get all classrooms for a teacher.
 */
export async function getClassrooms(teacherId) {
  const { data, error } = await supabase
    .from('classrooms')
    .select('*, classroom_students(count)')
    .eq('teacher_id', teacherId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) console.error('[getClassrooms]', error.message)
  return { data, error }
}

/**
 * Get a single classroom with full summary (uses stored function).
 */
export async function getClassroomSummary(classroomId) {
  const { data, error } = await supabase.rpc('get_classroom_summary', {
    p_classroom_id: classroomId,
  })
  if (error) console.error('[getClassroomSummary]', error.message)
  return { data, error }
}

/**
 * Create a new classroom.
 */
export async function createClassroom(teacherId, { name, grade, section, subject, schoolId = 'school-demo-001' }) {
  const { data, error } = await supabase
    .from('classrooms')
    .insert({ teacher_id: teacherId, name, grade, section, subject, school_id: schoolId })
    .select()
    .single()

  if (error) console.error('[createClassroom]', error.message)
  return { data, error }
}

/**
 * Update classroom details.
 */
export async function updateClassroom(classroomId, updates) {
  const { data, error } = await supabase
    .from('classrooms')
    .update(updates)
    .eq('id', classroomId)
    .select()
    .single()

  if (error) console.error('[updateClassroom]', error.message)
  return { data, error }
}

/**
 * Soft-delete (archive) a classroom.
 */
export async function archiveClassroom(classroomId) {
  const { data, error } = await supabase
    .from('classrooms')
    .update({ is_active: false })
    .eq('id', classroomId)
    .select()
    .single()

  if (error) console.error('[archiveClassroom]', error.message)
  return { data, error }
}

// ── CLASSROOM STUDENTS ───────────────────────────────────────

/**
 * Get all students enrolled in a classroom.
 */
export async function getClassroomStudents(classroomId) {
  const { data, error } = await supabase
    .from('classroom_students')
    .select(`
      id, joined_at,
      students(id, name, admission_number, attendance_percentage,
        users(email, username))
    `)
    .eq('classroom_id', classroomId)
    .order('joined_at')

  if (error) console.error('[getClassroomStudents]', error.message)
  return { data, error }
}

/**
 * Add a student to a classroom.
 */
export async function addStudentToClassroom(classroomId, studentId) {
  const { data, error } = await supabase
    .from('classroom_students')
    .insert({ classroom_id: classroomId, student_id: studentId })
    .select()
    .single()

  if (error) console.error('[addStudentToClassroom]', error.message)
  return { data, error }
}

/**
 * Remove a student from a classroom.
 */
export async function removeStudentFromClassroom(classroomId, studentId) {
  const { error } = await supabase
    .from('classroom_students')
    .delete()
    .eq('classroom_id', classroomId)
    .eq('student_id', studentId)

  if (error) console.error('[removeStudentFromClassroom]', error.message)
  return { error }
}

// ── ASSIGNMENTS ──────────────────────────────────────────────

/**
 * Get all assignments for a classroom.
 */
export async function getAssignments(classroomId) {
  const { data, error } = await supabase
    .from('assignments')
    .select('*, submissions(count)')
    .eq('classroom_id', classroomId)
    .order('due_date', { ascending: true })

  if (error) console.error('[getAssignments]', error.message)
  return { data, error }
}

/**
 * Create an assignment and notify all students in the classroom.
 */
export async function createAssignment(classroomId, { title, description, dueDate, maxScore = 100 }) {
  // 1. Insert assignment
  const { data: assignment, error } = await supabase
    .from('assignments')
    .insert({
      classroom_id: classroomId,
      title,
      description,
      due_date:  dueDate,
      max_score: maxScore,
    })
    .select()
    .single()

  if (error) { console.error('[createAssignment]', error.message); return { data: null, error } }

  // 2. Notify all students in classroom
  const dueDateStr = dueDate ? ` — due ${new Date(dueDate).toLocaleDateString()}` : ''
  await notifyClassroom(
    classroomId,
    `New Assignment: ${title}`,
    `${description || title}${dueDateStr}`,
    'assignment',
    assignment.id,
    'assignments'
  )

  return { data: assignment, error: null }
}

/**
 * Update an assignment.
 */
export async function updateAssignment(assignmentId, updates) {
  const { data, error } = await supabase
    .from('assignments')
    .update(updates)
    .eq('id', assignmentId)
    .select()
    .single()

  if (error) console.error('[updateAssignment]', error.message)
  return { data, error }
}

/**
 * Delete an assignment.
 */
export async function deleteAssignment(assignmentId) {
  const { error } = await supabase
    .from('assignments')
    .delete()
    .eq('id', assignmentId)

  if (error) console.error('[deleteAssignment]', error.message)
  return { error }
}

// ── SUBMISSIONS ──────────────────────────────────────────────

/**
 * Get all submissions for an assignment (teacher view).
 */
export async function getSubmissions(assignmentId) {
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      id, content, score, feedback, submitted_at, graded_at, status,
      students(id, name, admission_number)
    `)
    .eq('assignment_id', assignmentId)
    .order('submitted_at', { ascending: false })

  if (error) console.error('[getSubmissions]', error.message)
  return { data, error }
}

/**
 * Grade a submission and notify the student.
 */
export async function gradeSubmission(submissionId, score, feedback) {
  // 1. Update submission
  const { data: sub, error } = await supabase
    .from('submissions')
    .update({ score, feedback, graded_at: new Date().toISOString(), status: 'graded' })
    .eq('id', submissionId)
    .select('*, assignments(title), students(user_id, name)')
    .single()

  if (error) { console.error('[gradeSubmission]', error.message); return { data: null, error } }

  // 2. Notify student
  const studentUserId = sub.students?.user_id
  if (studentUserId) {
    await supabase.from('notifications').insert({
      user_id:   studentUserId,
      title:     `Assignment Graded: ${sub.assignments?.title}`,
      message:   `You scored ${score}/${sub.assignments?.max_score || 100}. ${feedback || ''}`.trim(),
      type:      'assignment',
      ref_id:    sub.assignment_id,
      ref_table: 'assignments',
    })
  }

  return { data: sub, error: null }
}

/**
 * Submit an assignment (student side).
 */
export async function submitAssignment(assignmentId, studentId, content) {
  const { data, error } = await supabase
    .from('submissions')
    .upsert({
      assignment_id: assignmentId,
      student_id:    studentId,
      content,
      submitted_at:  new Date().toISOString(),
      status:        'submitted',
    }, { onConflict: 'assignment_id,student_id' })
    .select()
    .single()

  if (error) console.error('[submitAssignment]', error.message)
  return { data, error }
}

// ── TESTS ────────────────────────────────────────────────────

/**
 * Get all tests for a classroom.
 */
export async function getTests(classroomId) {
  const { data, error } = await supabase
    .from('tests')
    .select('*')
    .eq('classroom_id', classroomId)
    .order('test_date', { ascending: true })

  if (error) console.error('[getTests]', error.message)
  return { data, error }
}

/**
 * Create a test and notify all students.
 */
export async function createTest(classroomId, { title, description, testDate, durationMin = 60, maxScore = 100 }) {
  const { data: test, error } = await supabase
    .from('tests')
    .insert({
      classroom_id:  classroomId,
      title,
      description,
      test_date:     testDate,
      duration_min:  durationMin,
      max_score:     maxScore,
    })
    .select()
    .single()

  if (error) { console.error('[createTest]', error.message); return { data: null, error } }

  const dateStr = testDate ? ` on ${new Date(testDate).toLocaleDateString()}` : ''
  await notifyClassroom(
    classroomId,
    `New Test Scheduled: ${title}`,
    `A test has been scheduled${dateStr}. Duration: ${durationMin} minutes.`,
    'test',
    test.id,
    'tests'
  )

  return { data: test, error: null }
}

/**
 * Update a test.
 */
export async function updateTest(testId, updates) {
  const { data, error } = await supabase
    .from('tests')
    .update(updates)
    .eq('id', testId)
    .select()
    .single()

  if (error) console.error('[updateTest]', error.message)
  return { data, error }
}

/**
 * Delete a test.
 */
export async function deleteTest(testId) {
  const { error } = await supabase.from('tests').delete().eq('id', testId)
  if (error) console.error('[deleteTest]', error.message)
  return { error }
}

// ── TEST RESULTS ─────────────────────────────────────────────

/**
 * Get all results for a test.
 */
export async function getTestResults(testId) {
  const { data, error } = await supabase
    .from('test_results')
    .select('*, students(id, name, admission_number)')
    .eq('test_id', testId)
    .order('score', { ascending: false })

  if (error) console.error('[getTestResults]', error.message)
  return { data, error }
}

/**
 * Record a test result and notify the student.
 */
export async function recordTestResult(testId, studentId, score, feedback = '') {
  // 1. Upsert result
  const { data: result, error } = await supabase
    .from('test_results')
    .upsert({ test_id: testId, student_id: studentId, score, feedback, graded_at: new Date().toISOString() },
      { onConflict: 'test_id,student_id' })
    .select('*, tests(title, max_score), students(user_id)')
    .single()

  if (error) { console.error('[recordTestResult]', error.message); return { data: null, error } }

  // 2. Notify student
  const studentUserId = result.students?.user_id
  if (studentUserId) {
    await supabase.from('notifications').insert({
      user_id:   studentUserId,
      title:     `Test Result: ${result.tests?.title}`,
      message:   `You scored ${score}/${result.tests?.max_score || 100}. ${feedback}`.trim(),
      type:      'test',
      ref_id:    testId,
      ref_table: 'tests',
    })
  }

  return { data: result, error: null }
}

/**
 * Bulk record test results for all students.
 * results: [{ studentId, score, feedback }]
 */
export async function bulkRecordTestResults(testId, results) {
  const records = results.map(r => ({
    test_id:    testId,
    student_id: r.studentId,
    score:      r.score,
    feedback:   r.feedback || '',
    graded_at:  new Date().toISOString(),
  }))

  const { data, error } = await supabase
    .from('test_results')
    .upsert(records, { onConflict: 'test_id,student_id' })
    .select()

  if (error) { console.error('[bulkRecordTestResults]', error.message); return { data: null, error } }

  // Notify each student
  const { data: testData } = await supabase.from('tests').select('title, max_score').eq('id', testId).single()
  for (const r of results) {
    const { data: student } = await supabase.from('students').select('user_id').eq('id', r.studentId).single()
    if (student?.user_id) {
      await supabase.from('notifications').insert({
        user_id:   student.user_id,
        title:     `Test Result: ${testData?.title || 'Test'}`,
        message:   `You scored ${r.score}/${testData?.max_score || 100}.`,
        type:      'test',
        ref_id:    testId,
        ref_table: 'tests',
      })
    }
  }

  return { data, error: null }
}

// ── CALENDAR EVENTS ──────────────────────────────────────────

/**
 * Get all calendar events for a classroom.
 */
export async function getCalendarEvents(classroomId, fromDate, toDate) {
  let query = supabase
    .from('calendar_events')
    .select('*')
    .eq('classroom_id', classroomId)
    .order('event_date')

  if (fromDate) query = query.gte('event_date', fromDate)
  if (toDate)   query = query.lte('event_date', toDate)

  const { data, error } = await query
  if (error) console.error('[getCalendarEvents]', error.message)
  return { data, error }
}

/**
 * Create a calendar event. Optionally notify students.
 */
export async function createCalendarEvent(classroomId, { title, description, eventDate, eventType = 'general' }, notify = true) {
  const { data: event, error } = await supabase
    .from('calendar_events')
    .insert({ classroom_id: classroomId, title, description, event_date: eventDate, event_type: eventType })
    .select()
    .single()

  if (error) { console.error('[createCalendarEvent]', error.message); return { data: null, error } }

  if (notify) {
    const dateStr = new Date(eventDate).toLocaleDateString()
    await notifyClassroom(
      classroomId,
      `Event: ${title}`,
      `${description || title} — ${dateStr}`,
      'info',
      event.id,
      'calendar_events'
    )
  }

  return { data: event, error: null }
}

/**
 * Delete a calendar event.
 */
export async function deleteCalendarEvent(eventId) {
  const { error } = await supabase.from('calendar_events').delete().eq('id', eventId)
  if (error) console.error('[deleteCalendarEvent]', error.message)
  return { error }
}

// ── ANNOUNCEMENTS ────────────────────────────────────────────

/**
 * Get all announcements for a classroom.
 */
export async function getAnnouncements(classroomId) {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('classroom_id', classroomId)
    .order('created_at', { ascending: false })

  if (error) console.error('[getAnnouncements]', error.message)
  return { data, error }
}

/**
 * Share an announcement and notify all students in the classroom.
 */
export async function shareAnnouncement(classroomId, { title, message, priority = 'normal' }) {
  // 1. Insert announcement
  const { data: ann, error } = await supabase
    .from('announcements')
    .insert({ classroom_id: classroomId, title, message, priority })
    .select()
    .single()

  if (error) { console.error('[shareAnnouncement]', error.message); return { data: null, error } }

  // 2. Notify all students
  const sent = await notifyClassroom(
    classroomId,
    title,
    message,
    'announcement',
    ann.id,
    'announcements'
  )

  return { data: ann, sent, error: null }
}

/**
 * Delete an announcement.
 */
export async function deleteAnnouncement(announcementId) {
  const { error } = await supabase.from('announcements').delete().eq('id', announcementId)
  if (error) console.error('[deleteAnnouncement]', error.message)
  return { error }
}

// ── NOTIFICATIONS ────────────────────────────────────────────

/**
 * Get all notifications for a user, newest first.
 */
export async function getNotifications(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) console.error('[getNotifications]', error.message)
  return { data, error }
}

/**
 * Get unread notification count.
 */
export async function getUnreadCount(userId) {
  const { data, error } = await supabase.rpc('get_unread_count', { p_user_id: userId })
  if (error) console.error('[getUnreadCount]', error.message)
  return { count: data || 0, error }
}

/**
 * Mark a single notification as read.
 */
export async function markNotificationRead(notificationId) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) console.error('[markNotificationRead]', error.message)
  return { error }
}

/**
 * Mark all notifications as read for a user.
 */
export async function markAllNotificationsRead(userId) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) console.error('[markAllNotificationsRead]', error.message)
  return { error }
}

/**
 * Delete a notification.
 */
export async function deleteNotification(notificationId) {
  const { error } = await supabase.from('notifications').delete().eq('id', notificationId)
  if (error) console.error('[deleteNotification]', error.message)
  return { error }
}

// ── REAL-TIME SUBSCRIPTIONS ──────────────────────────────────

/**
 * Subscribe to real-time notifications for a user.
 * Calls onNew(notification) whenever a new notification arrives.
 * Returns the channel — call channel.unsubscribe() on cleanup.
 *
 * Usage:
 *   const channel = listenNotifications(userId, (notif) => {
 *     setNotifications(prev => [notif, ...prev])
 *     showToast(notif.title)
 *   })
 *   return () => channel.unsubscribe()
 */
export function listenNotifications(userId, onNew) {
  return supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event:  'INSERT',
        schema: 'public',
        table:  'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (payload.new) onNew(payload.new)
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`[Realtime] Listening for notifications for user ${userId}`)
      }
    })
}

/**
 * Subscribe to real-time updates for a classroom's assignments.
 * Useful for students to see new assignments instantly.
 */
export function listenClassroomAssignments(classroomId, onNew) {
  return supabase
    .channel(`assignments:${classroomId}`)
    .on(
      'postgres_changes',
      {
        event:  'INSERT',
        schema: 'public',
        table:  'assignments',
        filter: `classroom_id=eq.${classroomId}`,
      },
      (payload) => { if (payload.new) onNew(payload.new) }
    )
    .subscribe()
}

/**
 * Subscribe to real-time updates for a classroom's announcements.
 */
export function listenAnnouncements(classroomId, onNew) {
  return supabase
    .channel(`announcements:${classroomId}`)
    .on(
      'postgres_changes',
      {
        event:  'INSERT',
        schema: 'public',
        table:  'announcements',
        filter: `classroom_id=eq.${classroomId}`,
      },
      (payload) => { if (payload.new) onNew(payload.new) }
    )
    .subscribe()
}

/**
 * Subscribe to submission updates (teacher side — know when students submit).
 */
export function listenSubmissions(assignmentId, onChange) {
  return supabase
    .channel(`submissions:${assignmentId}`)
    .on(
      'postgres_changes',
      {
        event:  '*',
        schema: 'public',
        table:  'submissions',
        filter: `assignment_id=eq.${assignmentId}`,
      },
      (payload) => onChange(payload)
    )
    .subscribe()
}

// ── ANALYTICS ────────────────────────────────────────────────

/**
 * Get performance analytics for a classroom.
 * Returns per-student avg grade, submission rate, test avg.
 */
export async function getClassroomAnalytics(classroomId) {
  const [studentsRes, submissionsRes, testResultsRes] = await Promise.all([
    supabase
      .from('classroom_students')
      .select('students(id, name, attendance_percentage)')
      .eq('classroom_id', classroomId),
    supabase
      .from('submissions')
      .select('student_id, score, status')
      .in('assignment_id',
        (await supabase.from('assignments').select('id').eq('classroom_id', classroomId)).data?.map(a => a.id) || []
      ),
    supabase
      .from('test_results')
      .select('student_id, score')
      .in('test_id',
        (await supabase.from('tests').select('id').eq('classroom_id', classroomId)).data?.map(t => t.id) || []
      ),
  ])

  const students = studentsRes.data?.map(cs => cs.students) || []
  const submissions = submissionsRes.data || []
  const testResults = testResultsRes.data || []

  const analytics = students.map(student => {
    const studentSubs = submissions.filter(s => s.student_id === student.id)
    const studentTests = testResults.filter(t => t.student_id === student.id)

    const avgAssignment = studentSubs.filter(s => s.score != null).length
      ? Math.round(studentSubs.filter(s => s.score != null).reduce((a, s) => a + s.score, 0) / studentSubs.filter(s => s.score != null).length)
      : null

    const avgTest = studentTests.length
      ? Math.round(studentTests.reduce((a, t) => a + t.score, 0) / studentTests.length)
      : null

    return {
      student,
      submissionCount:  studentSubs.length,
      avgAssignment,
      avgTest,
      attendance:       student.attendance_percentage,
      overallAvg:       [avgAssignment, avgTest].filter(v => v != null).length
        ? Math.round([avgAssignment, avgTest].filter(v => v != null).reduce((a, b) => a + b, 0) / [avgAssignment, avgTest].filter(v => v != null).length)
        : null,
    }
  })

  return { data: analytics, error: studentsRes.error || submissionsRes.error || testResultsRes.error }
}

