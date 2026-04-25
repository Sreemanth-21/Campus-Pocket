/**
 * schoolStore.js — Global shared state for Campus Pocket
 * All portals (Student, Parent, Teacher, Admin) read from and write to this store.
 * Uses Zustand for reactive state management.
 *
 * Install: npm install zustand  (already in package.json)
 */
import { create } from 'zustand'
import { demoStudents, demoGrades, demoFees, demoAttendance, demoExams, demoTimetable, demoMessages, demoCirculars, demoNotifications } from '../services/mockData'
import { mockAssignments, mockTests, mockAnnouncements, mockClassrooms, mockClassroomStudents, mockEvents } from '../services/teacherMockData'

// ── helpers ──────────────────────────────────────────────────
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
const now = () => new Date().toISOString()

// ── store ─────────────────────────────────────────────────────
export const useSchoolStore = create((set, get) => ({

  // ── DATA ────────────────────────────────────────────────────
  students:     demoStudents,
  grades:       demoGrades,
  fees:         demoFees,
  attendance:   demoAttendance,
  exams:        demoExams,
  timetable:    demoTimetable,
  messages:     demoMessages,
  circulars:    demoCirculars,
  notifications: demoNotifications,

  // Teacher data
  assignments:  mockAssignments,
  tests:        mockTests,
  announcements: mockAnnouncements,
  classrooms:   mockClassrooms,
  classroomStudents: mockClassroomStudents,
  calendarEvents: mockEvents,
  submissions:  [
    { id:'sub-1', assignment_id:'asgn-1', student_id:'student-1', content:'Completed all exercises.', score:18, feedback:'Excellent work!', status:'graded', submitted_at:'2025-05-08T14:00:00Z' },
    { id:'sub-2', assignment_id:'asgn-1', student_id:'student-2', content:'Attempted most questions.', score:null, feedback:null, status:'submitted', submitted_at:'2025-05-09T16:00:00Z' },
  ],

  // ── ASSIGNMENTS ─────────────────────────────────────────────
  addAssignment: (data) => {
    const assignment = { id: `asgn-${uid()}`, ...data, created_at: now() }
    set(s => ({ assignments: [assignment, ...s.assignments] }))

    // Notify all students in the classroom
    const students = get().classroomStudents[data.classroom_id] || []
    const classroom = get().classrooms.find(c => c.id === data.classroom_id)
    const dueStr = data.due_date ? ` — due ${new Date(data.due_date).toLocaleDateString()}` : ''
    const newNotifs = students.map(student => ({
      id: `notif-${uid()}`,
      type: 'assignment',
      student_id: student.id,
      message: `📝 New assignment: "${data.title}" in ${classroom?.name || 'your class'}${dueStr}`,
      severity: 'info',
      read: false,
      created_at: now(),
    }))
    set(s => ({ notifications: [...newNotifs, ...s.notifications] }))
    return assignment
  },

  updateAssignment: (id, updates) =>
    set(s => ({ assignments: s.assignments.map(a => a.id === id ? { ...a, ...updates } : a) })),

  deleteAssignment: (id) =>
    set(s => ({ assignments: s.assignments.filter(a => a.id !== id) })),

  // ── SUBMISSIONS ─────────────────────────────────────────────
  submitAssignment: (assignmentId, studentId, content) => {
    const existing = get().submissions.find(s => s.assignment_id === assignmentId && s.student_id === studentId)
    if (existing) {
      set(s => ({ submissions: s.submissions.map(sub =>
        sub.assignment_id === assignmentId && sub.student_id === studentId
          ? { ...sub, content, submitted_at: now(), status: 'submitted' }
          : sub
      )}))
    } else {
      set(s => ({ submissions: [...s.submissions, {
        id: `sub-${uid()}`, assignment_id: assignmentId, student_id: studentId,
        content, score: null, feedback: null, status: 'submitted', submitted_at: now(),
      }]}))
    }
  },

  gradeSubmission: (assignmentId, studentId, score, feedback) => {
    set(s => ({ submissions: s.submissions.map(sub =>
      sub.assignment_id === assignmentId && sub.student_id === studentId
        ? { ...sub, score, feedback, status: 'graded', graded_at: now() }
        : sub
    )}))
    // Notify student
    const assignment = get().assignments.find(a => a.id === assignmentId)
    set(s => ({ notifications: [{
      id: `notif-${uid()}`,
      type: 'grade',
      student_id: studentId,
      message: `✅ "${assignment?.title}" graded: ${score}/${assignment?.max_score || 100}. ${feedback || ''}`.trim(),
      severity: 'info',
      read: false,
      created_at: now(),
    }, ...s.notifications]}))
  },

  // ── TESTS ───────────────────────────────────────────────────
  addTest: (data) => {
    const test = { id: `test-${uid()}`, ...data, created_at: now() }
    set(s => ({ tests: [...s.tests, test] }))

    // Notify students
    const students = get().classroomStudents[data.classroom_id] || []
    const classroom = get().classrooms.find(c => c.id === data.classroom_id)
    const dateStr = data.test_date ? ` on ${new Date(data.test_date).toLocaleDateString()}` : ''
    const newNotifs = students.map(student => ({
      id: `notif-${uid()}`,
      type: 'test',
      student_id: student.id,
      message: `📋 New test scheduled: "${data.title}"${dateStr} in ${classroom?.name || 'your class'}`,
      severity: 'warning',
      read: false,
      created_at: now(),
    }))
    set(s => ({ notifications: [...newNotifs, ...s.notifications] }))
    return test
  },

  updateTest: (id, updates) =>
    set(s => ({ tests: s.tests.map(t => t.id === id ? { ...t, ...updates } : t) })),

  deleteTest: (id) =>
    set(s => ({ tests: s.tests.filter(t => t.id !== id) })),

  // ── ANNOUNCEMENTS ────────────────────────────────────────────
  addAnnouncement: (data) => {
    const ann = { id: `ann-${uid()}`, ...data, created_at: now() }
    set(s => ({ announcements: [ann, ...s.announcements] }))

    // Notify students
    const students = get().classroomStudents[data.classroom_id] || []
    const newNotifs = students.map(student => ({
      id: `notif-${uid()}`,
      type: 'announcement',
      student_id: student.id,
      message: `📢 ${data.title}: ${data.message.slice(0, 80)}${data.message.length > 80 ? '...' : ''}`,
      severity: data.priority === 'urgent' || data.priority === 'high' ? 'critical' : 'info',
      read: false,
      created_at: now(),
    }))
    set(s => ({ notifications: [...newNotifs, ...s.notifications] }))
    return ann
  },

  deleteAnnouncement: (id) =>
    set(s => ({ announcements: s.announcements.filter(a => a.id !== id) })),

  // ── CALENDAR EVENTS ──────────────────────────────────────────
  addCalendarEvent: (data) => {
    const event = { id: `evt-${uid()}`, ...data, created_at: now() }
    set(s => ({ calendarEvents: [...s.calendarEvents, event] }))
    return event
  },

  deleteCalendarEvent: (id) =>
    set(s => ({ calendarEvents: s.calendarEvents.filter(e => e.id !== id) })),

  // ── ATTENDANCE (teacher marks) ───────────────────────────────
  markAttendance: (studentId, date, status) => {
    const existing = get().attendance.find(a => a.student_id === studentId && a.date === date)
    if (existing) {
      set(s => ({ attendance: s.attendance.map(a =>
        a.student_id === studentId && a.date === date ? { ...a, status } : a
      )}))
    } else {
      set(s => ({ attendance: [...s.attendance, {
        id: `att-${uid()}`, student_id: studentId, date, status, created_at: now(),
      }]}))
    }
    // Recalculate attendance_percentage for student
    const allAtt = get().attendance.filter(a => a.student_id === studentId)
    const total   = allAtt.length
    const present = allAtt.filter(a => a.status === 'present' || a.status === 'late').length
    const pct     = total ? Math.round((present / total) * 100) : 0
    set(s => ({ students: s.students.map(st =>
      st.id === studentId ? { ...st, attendance_percentage: pct } : st
    )}))
    // Alert if below 75%
    if (pct < 75) {
      const student = get().students.find(s => s.id === studentId)
      set(s => ({ notifications: [{
        id: `notif-${uid()}`,
        type: 'attendance',
        student_id: studentId,
        message: `⚠️ ${student?.name}'s attendance dropped to ${pct}% — below 75%`,
        severity: 'critical',
        read: false,
        created_at: now(),
      }, ...s.notifications]}))
    }
  },

  // ── GRADES (admin/teacher adds) ──────────────────────────────
  addGrade: (studentId, subject, score, date) => {
    set(s => ({ grades: [...s.grades, {
      id: `g-${uid()}`, student_id: studentId, subject, score, date: date || now().split('T')[0],
    }]}))
  },

  // ── FEES ────────────────────────────────────────────────────
  updateFeeStatus: (feeId, status) =>
    set(s => ({ fees: s.fees.map(f => f.id === feeId ? { ...f, status } : f) })),

  // ── MESSAGES ────────────────────────────────────────────────
  addMessage: (parentId, teacherName, message) => {
    const msg = { id: `m-${uid()}`, parent_id: parentId, teacher_name: teacherName, message, reply: null, created_at: now() }
    set(s => ({ messages: [msg, ...s.messages] }))
    return msg
  },

  replyMessage: (messageId, reply) =>
    set(s => ({ messages: s.messages.map(m => m.id === messageId ? { ...m, reply } : m) })),

  // ── CIRCULARS ────────────────────────────────────────────────
  addCircular: (data) => {
    const circ = { id: `c-${uid()}`, ...data, date: now().split('T')[0], created_at: now() }
    set(s => ({ circulars: [circ, ...s.circulars] }))
    return circ
  },

  // ── NOTIFICATIONS ────────────────────────────────────────────
  markNotificationRead: (id) =>
    set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n) })),

  markAllNotificationsRead: () =>
    set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: true })) })),

  // Get notifications for a specific student
  getStudentNotifications: (studentId) =>
    get().notifications.filter(n => n.student_id === studentId || !n.student_id),

  // Get assignments for a student (based on their class/section)
  getStudentAssignments: (student) => {
    const studentClassrooms = Object.entries(get().classroomStudents)
      .filter(([, students]) => students.some(s => s.id === student.id))
      .map(([classroomId]) => classroomId)
    return get().assignments.filter(a => studentClassrooms.includes(a.classroom_id))
  },

  // Get tests for a student
  getStudentTests: (student) => {
    const studentClassrooms = Object.entries(get().classroomStudents)
      .filter(([, students]) => students.some(s => s.id === student.id))
      .map(([classroomId]) => classroomId)
    return get().tests.filter(t => studentClassrooms.includes(t.classroom_id))
  },

  // Get announcements for a student
  getStudentAnnouncements: (student) => {
    const studentClassrooms = Object.entries(get().classroomStudents)
      .filter(([, students]) => students.some(s => s.id === student.id))
      .map(([classroomId]) => classroomId)
    return get().announcements.filter(a => studentClassrooms.includes(a.classroom_id))
  },
}))
