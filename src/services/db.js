/**
 * db.js — Data service with Supabase + mock fallback
 * If Supabase returns an error, falls back to mock data automatically.
 */
import { supabase } from './supabase'
import {
  demoStudents, demoParents, demoParentChild,
  demoAttendance, demoGrades, demoFees, demoTimetable,
  demoExams, demoMessages, demoCirculars, demoRequests,
  demoTransport, demoHelpdesk, demoNotifications, demoUsers,
} from './mockData'

// ── STUDENTS ─────────────────────────────────────────────────
export async function getStudentByUserId(userId) {
  const { data, error } = await supabase.from('students').select('*').eq('user_id', userId).single()
  if (error) return demoStudents.find(s => s.user_id === userId) || null
  return data
}

export async function getParentByUserId(userId) {
  const { data, error } = await supabase.from('parents').select('*').eq('user_id', userId).single()
  if (error) return demoParents.find(p => p.user_id === userId) || null
  return data
}

/**
 * Get the parent's phone number for a given student.
 * Used by WhatsAppButton to know where to send the alert.
 */
export async function getParentPhoneForStudent(studentId) {
  // Try Supabase
  const { data, error } = await supabase
    .from('parent_child')
    .select('parent_id, parents(phone_number)')
    .eq('student_id', studentId)
    .single()

  if (!error && data?.parents?.phone_number) return data.parents.phone_number

  // Fallback to mock data
  const link = demoParentChild.find(pc => pc.student_id === studentId)
  if (!link) return null
  const parent = demoParents.find(p => p.id === link.parent_id)
  return parent?.phone_number || null
}

export async function getChildrenOfParent(parentId) {
  const { data: links, error } = await supabase.from('parent_child').select('student_id').eq('parent_id', parentId)
  if (error) {
    const mockLinks = demoParentChild.filter(pc => pc.parent_id === parentId)
    return demoStudents.filter(s => mockLinks.some(l => l.student_id === s.id))
  }
  if (!links?.length) return []
  const ids = links.map(l => l.student_id)
  const { data, error: e2 } = await supabase.from('students').select('*').in('id', ids)
  if (e2) return demoStudents.filter(s => ids.includes(s.id))
  return data || []
}

export async function findStudentByUsername(username) {
  const { data: user } = await supabase.from('users').select('id').eq('username', username).eq('role', 'student').single()
  if (!user) return null
  const { data } = await supabase.from('students').select('*').eq('user_id', user.id).single()
  return data || null
}

/**
 * Find a student by username AND verify their password.
 * Returns the student profile if credentials match, null if not found,
 * or throws with 'Invalid password' if username exists but password is wrong.
 */
export async function findStudentByCredentials(username, password) {
  // Try Supabase first — verify credentials via the users table
  const { data: user, error } = await supabase
    .from('users')
    .select('id, password')
    .eq('username', username)
    .eq('role', 'student')
    .single()

  if (!error && user) {
    // Supabase user found — check password
    if (user.password !== password) throw new Error('Invalid password')
    const { data: student } = await supabase.from('students').select('*').eq('user_id', user.id).single()
    return student || null
  }

  // Fallback to mock data
  const mockUser = demoUsers.find(u => u.username === username && u.role === 'student')
  if (!mockUser) return null
  if (mockUser.password !== password) throw new Error('Invalid password')
  return demoStudents.find(s => s.user_id === mockUser.id) || null
}

export async function linkChildToParent(parentId, studentId) {
  const { error } = await supabase.from('parent_child').insert({ parent_id: parentId, student_id: studentId })
  if (error) throw new Error(error.message)
}

// ── ATTENDANCE ───────────────────────────────────────────────
export async function getAttendance(studentId) {
  const { data, error } = await supabase.from('attendance').select('*').eq('student_id', studentId).order('date', { ascending: true })
  if (error) return demoAttendance.filter(a => a.student_id === studentId)
  return data?.length ? data : demoAttendance.filter(a => a.student_id === studentId)
}

// ── GRADES ───────────────────────────────────────────────────
export async function getGrades(studentId) {
  const { data, error } = await supabase.from('grades').select('*').eq('student_id', studentId).order('date', { ascending: true })
  if (error) return demoGrades.filter(g => g.student_id === studentId)
  return data?.length ? data : demoGrades.filter(g => g.student_id === studentId)
}

// ── FEES ─────────────────────────────────────────────────────
export async function getFees(studentId) {
  const { data, error } = await supabase.from('fees').select('*').eq('student_id', studentId)
  if (error) return demoFees.filter(f => f.student_id === studentId)
  return data?.length ? data : demoFees.filter(f => f.student_id === studentId)
}

// ── TIMETABLE ────────────────────────────────────────────────
export async function getTimetable(cls) {
  const { data, error } = await supabase.from('timetable').select('*').eq('class', cls)
  if (error) return demoTimetable.filter(t => t.class === cls)
  return data?.length ? data : demoTimetable.filter(t => t.class === cls)
}

// ── EXAMS ────────────────────────────────────────────────────
export async function getExams(studentId) {
  const { data, error } = await supabase.from('exams').select('*').eq('student_id', studentId).order('date', { ascending: true })
  if (error) return demoExams.filter(e => e.student_id === studentId)
  return data?.length ? data : demoExams.filter(e => e.student_id === studentId)
}

// ── MESSAGES ─────────────────────────────────────────────────
export async function getMessages(parentId) {
  const { data, error } = await supabase.from('messages').select('*').eq('parent_id', parentId).order('created_at', { ascending: false })
  if (error) return demoMessages.filter(m => m.parent_id === parentId)
  return data?.length ? data : demoMessages.filter(m => m.parent_id === parentId)
}

export async function sendMessage(parentId, teacherName, message) {
  const { data, error } = await supabase.from('messages').insert({ parent_id: parentId, teacher_name: teacherName, message }).select().single()
  if (error) return { id: Date.now().toString(), parent_id: parentId, teacher_name: teacherName, message, reply: null, created_at: new Date().toISOString() }
  return data
}

export async function replyMessage(messageId, reply) {
  const { data, error } = await supabase.from('messages').update({ reply }).eq('id', messageId).select().single()
  if (error) return null
  return data
}

// ── CIRCULARS ────────────────────────────────────────────────
export async function getCirculars() {
  const { data, error } = await supabase.from('circulars').select('*').order('created_at', { ascending: false })
  if (error) return demoCirculars
  return data?.length ? data : demoCirculars
}

// ── REQUESTS ─────────────────────────────────────────────────
export async function getRequests(parentId) {
  const { data, error } = await supabase.from('requests').select('*, students(name)').eq('parent_id', parentId).order('created_at', { ascending: false })
  if (error) return demoRequests.filter(r => r.parent_id === parentId)
  return (data || []).map(r => ({ ...r, student_name: r.students?.name }))
}

export async function submitRequest(parentId, studentId, type, reason) {
  const { data, error } = await supabase.from('requests').insert({ parent_id: parentId, student_id: studentId, type, reason }).select().single()
  if (error) return { id: Date.now().toString(), parent_id: parentId, student_id: studentId, type, reason, status: 'Pending', response: null, created_at: new Date().toISOString() }
  return data
}

// ── HELPDESK ─────────────────────────────────────────────────
export async function getHelpdesk(parentId) {
  const { data, error } = await supabase.from('helpdesk').select('*').eq('parent_id', parentId).order('created_at', { ascending: false })
  if (error) return demoHelpdesk.filter(h => h.parent_id === parentId)
  return data?.length ? data : demoHelpdesk.filter(h => h.parent_id === parentId)
}

export async function submitHelpdesk(parentId, subject, category, description) {
  const { data, error } = await supabase.from('helpdesk').insert({ parent_id: parentId, subject, category, description }).select().single()
  if (error) return { id: Date.now().toString(), parent_id: parentId, subject, category, description, status: 'Pending', response: null, created_at: new Date().toISOString() }
  return data
}

// ── TRANSPORT ────────────────────────────────────────────────
export async function getTransportRoutes() {
  const { data, error } = await supabase.from('transport_routes').select('*')
  if (error) return demoTransport.routes
  return data?.length ? data : demoTransport.routes
}

export async function getTransportAssignment(studentId) {
  const { data, error } = await supabase.from('transport_assignments').select('*, transport_routes(*)').eq('student_id', studentId).single()
  if (error) {
    if (demoTransport.assigned?.student_id === studentId) {
      const route = demoTransport.routes.find(r => r.id === demoTransport.assigned.route_id)
      return { ...demoTransport.assigned, transport_routes: route }
    }
    return null
  }
  return data
}

// ── NOTIFICATIONS ────────────────────────────────────────────
export async function getNotifications(userId) {
  const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) return demoNotifications
  return data?.length ? data : demoNotifications
}

export async function markNotificationRead(id) {
  await supabase.from('notifications').update({ read: true }).eq('id', id)
}

export async function markAllNotificationsRead(userId) {
  await supabase.from('notifications').update({ read: true }).eq('user_id', userId)
}

// ── REALTIME ─────────────────────────────────────────────────
export function subscribeAttendance(studentId, callback) {
  return supabase
    .channel(`attendance:${studentId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance', filter: `student_id=eq.${studentId}` }, callback)
    .subscribe()
}

