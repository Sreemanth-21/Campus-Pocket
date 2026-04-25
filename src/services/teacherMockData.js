import { demoStudents, demoGrades, demoAttendance } from './mockData'

export const TEACHER_ID = 'user-teacher-1'

export const mockClassrooms = [
  { id: 'cls-1', teacher_id: TEACHER_ID, name: 'Mathematics 10A', grade: '10', section: 'A', subject: 'Mathematics', school_id: 'school-demo-001' },
  { id: 'cls-2', teacher_id: TEACHER_ID, name: 'Mathematics 10B', grade: '10', section: 'B', subject: 'Mathematics', school_id: 'school-demo-001' },
]

export const mockClassroomStudents = {
  'cls-1': demoStudents.filter(s => s.class === '10' && s.section === 'A'),
  'cls-2': demoStudents.filter(s => s.class === '10' && s.section === 'B'),
}

export const mockAssignments = [
  { id: 'asgn-1', classroom_id: 'cls-1', title: 'Chapter 4 — Quadratic Equations', description: 'Solve exercises 4.1 to 4.5 from the textbook.', due_date: '2025-05-10T23:59:00Z', max_score: 20, created_at: '2025-04-20T10:00:00Z' },
  { id: 'asgn-2', classroom_id: 'cls-1', title: 'Arithmetic Progressions Worksheet', description: 'Complete the worksheet distributed in class.', due_date: '2025-05-15T23:59:00Z', max_score: 15, created_at: '2025-04-22T10:00:00Z' },
  { id: 'asgn-3', classroom_id: 'cls-2', title: 'Real Numbers — Practice Set', description: 'Practice problems on HCF, LCM and Euclid\'s lemma.', due_date: '2025-05-12T23:59:00Z', max_score: 20, created_at: '2025-04-21T10:00:00Z' },
]

export const mockSubmissions = [
  { id: 'sub-1', assignment_id: 'asgn-1', student_id: 'student-1', content: 'Completed all exercises.', score: 18, feedback: 'Excellent work!', status: 'graded', submitted_at: '2025-05-08T14:00:00Z' },
  { id: 'sub-2', assignment_id: 'asgn-1', student_id: 'student-2', content: 'Attempted most questions.', score: null, feedback: null, status: 'submitted', submitted_at: '2025-05-09T16:00:00Z' },
]

export const mockTests = [
  { id: 'test-1', classroom_id: 'cls-1', title: 'Unit Test — Polynomials', description: 'Covers chapters 2 and 3.', test_date: '2025-05-20T09:00:00Z', duration_min: 60, max_score: 50, created_at: '2025-04-25T10:00:00Z' },
  { id: 'test-2', classroom_id: 'cls-1', title: 'Mid-Term Examination', description: 'Chapters 1–5.', test_date: '2025-06-05T09:00:00Z', duration_min: 120, max_score: 100, created_at: '2025-04-28T10:00:00Z' },
  { id: 'test-3', classroom_id: 'cls-2', title: 'Unit Test — Real Numbers', description: 'Chapter 1.', test_date: '2025-05-18T09:00:00Z', duration_min: 45, max_score: 30, created_at: '2025-04-26T10:00:00Z' },
]

export const mockAnnouncements = [
  { id: 'ann-1', classroom_id: 'cls-1', title: 'Syllabus Update', message: 'Chapter 6 (Triangles) has been added to the mid-term syllabus. Please prepare accordingly.', priority: 'high', created_at: '2025-04-24T10:00:00Z' },
  { id: 'ann-2', classroom_id: 'cls-1', title: 'Extra Class Tomorrow', message: 'There will be an extra class tomorrow at 7:30 AM to cover Arithmetic Progressions.', priority: 'normal', created_at: '2025-04-23T15:00:00Z' },
  { id: 'ann-3', classroom_id: 'cls-2', title: 'Assignment Deadline Extended', message: 'The deadline for the Real Numbers practice set has been extended to May 14th.', priority: 'normal', created_at: '2025-04-22T12:00:00Z' },
]

export const mockEvents = [
  { id: 'evt-1', classroom_id: 'cls-1', title: 'Unit Test — Polynomials', description: 'Chapters 2 & 3', event_date: '2025-05-20T09:00:00Z', event_type: 'exam' },
  { id: 'evt-2', classroom_id: 'cls-1', title: 'Assignment Due', description: 'Quadratic Equations worksheet', event_date: '2025-05-10T23:59:00Z', event_type: 'deadline' },
  { id: 'evt-3', classroom_id: 'cls-1', title: 'Mid-Term Exam', description: 'Chapters 1–5', event_date: '2025-06-05T09:00:00Z', event_type: 'exam' },
  { id: 'evt-4', classroom_id: 'cls-2', title: 'Unit Test — Real Numbers', description: 'Chapter 1', event_date: '2025-05-18T09:00:00Z', event_type: 'exam' },
]

