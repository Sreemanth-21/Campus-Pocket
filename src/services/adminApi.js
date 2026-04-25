/**
 * Campus Pocket — Admin API Service
 * All functions use the Supabase client.
 * Functions that require admin.createUser need the SERVICE_ROLE key
 * (never expose in frontend — call from a Supabase Edge Function in production).
 */
import { supabase } from './supabase'

// ── HELPERS ──────────────────────────────────────────────────

function logAudit(action, tableName, recordId, details) {
  // Fire-and-forget audit log
  supabase.from('audit_log').insert({
    action, table_name: tableName, record_id: recordId, details,
  }).then(() => {})
}

// ── DASHBOARD ────────────────────────────────────────────────

/**
 * Get school-wide dashboard stats via stored function.
 * Returns: total_students, total_teachers, total_classrooms,
 *          total_revenue, pending_fees, overdue_fees,
 *          low_attendance, avg_attendance, avg_grade, total_leads
 */
export async function getDashboardStats(schoolId = 'school-demo-001') {
  const { data, error } = await supabase.rpc('get_dashboard_stats', {
    p_school_id: schoolId,
  })
  if (error) console.error('[getDashboardStats]', error.message)
  return { data, error }
}

// ── STUDENTS ─────────────────────────────────────────────────

/**
 * Get all students with user info, class, attendance %, fee status.
 */
export async function getAllStudents(schoolId = 'school-demo-001') {
  const { data, error } = await supabase
    .from('students')
    .select(`
      id, name, admission_number, class_id, attendance_percentage,
      gender, joining_date, is_active,
      users!inner(id, username, email, role),
      fees(id, status, amount)
    `)
    .eq('school_id', schoolId)
    .eq('is_active', true)
    .order('name')

  if (error) console.error('[getAllStudents]', error.message)
  return { data, error }
}

/**
 * Get full student profile (attendance, grades, fees, exams) via stored function.
 */
export async function getStudentDetails(studentId) {
  const { data, error } = await supabase.rpc('get_student_profile', {
    p_student_id: studentId,
  })
  if (error) console.error('[getStudentDetails]', error.message)
  return { data, error }
}

/**
 * Create a single student.
 * NOTE: createUser requires SERVICE_ROLE key — use Edge Function in production.
 */
export async function createStudent(supabaseAdmin, studentData) {
  const {
    email, password, username, name, classId,
    admissionNumber, dateOfBirth, gender, guardianName,
    contact, bloodGroup, address, schoolId = 'school-demo-001',
  } = studentData

  // 1. Create auth user
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username, role: 'student' },
    })
  if (authError) return { data: null, error: authError }

  // 2. Insert into users table
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .insert({
      auth_id:   authData.user.id,
      username,
      email,
      role:      'student',
      school_id: schoolId,
    })
    .select()
    .single()
  if (userError) return { data: null, error: userError }

  // 3. Insert into students table
  const { data: student, error: studentError } = await supabaseAdmin
    .from('students')
    .insert({
      user_id:              user.id,
      class_id:             classId,
      name,
      admission_number:     admissionNumber,
      date_of_birth:        dateOfBirth,
      gender,
      guardian_name:        guardianName,
      contact,
      blood_group:          bloodGroup,
      address,
      school_id:            schoolId,
    })
    .select()
    .single()
  if (studentError) return { data: null, error: studentError }

  logAudit('CREATE_STUDENT', 'students', student.id, { name, email })
  return { data: student, error: null }
}

/**
 * Bulk import students from CSV-parsed array.
 * Each item: { email, password, username, name, classId, ... }
 */
export async function bulkImportStudents(supabaseAdmin, students) {
  const results = { success: [], failed: [] }

  for (const student of students) {
    const { data, error } = await createStudent(supabaseAdmin, student)
    if (error) {
      results.failed.push({ student: student.email, reason: error.message })
    } else {
      results.success.push(data.id)
    }
  }

  logAudit('BULK_IMPORT', 'students', null, {
    total: students.length,
    success: results.success.length,
    failed: results.failed.length,
  })

  return results
}

/**
 * Update student profile fields.
 */
export async function updateStudent(studentId, updates) {
  const { data, error } = await supabase
    .from('students')
    .update({ ...updates })
    .eq('id', studentId)
    .select()
    .single()

  if (!error) logAudit('UPDATE_STUDENT', 'students', studentId, updates)
  return { data, error }
}

/**
 * Soft-delete (deactivate) a student.
 */
export async function deactivateStudent(studentId) {
  const { data, error } = await supabase
    .from('students')
    .update({ is_active: false })
    .eq('id', studentId)
    .select()
    .single()

  if (!error) logAudit('DEACTIVATE_STUDENT', 'students', studentId, {})
  return { data, error }
}

/**
 * Reset a student's password (requires SERVICE_ROLE key).
 */
export async function resetStudentPassword(supabaseAdmin, authUserId, newPassword) {
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
    authUserId,
    { password: newPassword }
  )
  if (!error) logAudit('RESET_PASSWORD', 'users', authUserId, {})
  return { data, error }
}

// ── TEACHERS ─────────────────────────────────────────────────

/**
 * Get all teachers.
 */
export async function getAllTeachers(schoolId = 'school-demo-001') {
  const { data, error } = await supabase
    .from('teachers')
    .select(`
      id, name, subject, phone, is_active,
      users!inner(id, username, email)
    `)
    .eq('school_id', schoolId)
    .eq('is_active', true)
    .order('name')

  if (error) console.error('[getAllTeachers]', error.message)
  return { data, error }
}

/**
 * Create a teacher (requires SERVICE_ROLE key).
 */
export async function createTeacher(supabaseAdmin, teacherData) {
  const { email, password, username, name, subject, phone, schoolId = 'school-demo-001' } = teacherData

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username, role: 'teacher' },
    })
  if (authError) return { data: null, error: authError }

  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .insert({ auth_id: authData.user.id, username, email, role: 'teacher', school_id: schoolId })
    .select()
    .single()
  if (userError) return { data: null, error: userError }

  const { data: teacher, error: teacherError } = await supabaseAdmin
    .from('teachers')
    .insert({ user_id: user.id, name, subject, phone, school_id: schoolId })
    .select()
    .single()

  if (!teacherError) logAudit('CREATE_TEACHER', 'teachers', teacher.id, { name, email })
  return { data: teacher, error: teacherError }
}

// ── CLASSROOMS ───────────────────────────────────────────────

/**
 * Get all classrooms with teacher info.
 */
export async function getAllClassrooms(schoolId = 'school-demo-001') {
  const { data, error } = await supabase
    .from('classrooms')
    .select(`id, name, grade, section, capacity, teachers(id, name)`)
    .eq('school_id', schoolId)
    .order('grade')
    .order('section')

  if (error) console.error('[getAllClassrooms]', error.message)
  return { data, error }
}

/**
 * Create a classroom.
 */
export async function createClassroom(classroomData) {
  const { name, grade, section, teacherId, capacity = 40, schoolId = 'school-demo-001' } = classroomData

  const { data, error } = await supabase
    .from('classrooms')
    .insert({ name, grade, section, teacher_id: teacherId, capacity, school_id: schoolId })
    .select()
    .single()

  if (!error) logAudit('CREATE_CLASSROOM', 'classrooms', data.id, { name, grade, section })
  return { data, error }
}

// ── ATTENDANCE ───────────────────────────────────────────────

/**
 * Get attendance for a student.
 */
export async function getStudentAttendance(studentId, fromDate, toDate) {
  let query = supabase
    .from('attendance')
    .select('*')
    .eq('student_id', studentId)
    .order('date', { ascending: false })

  if (fromDate) query = query.gte('date', fromDate)
  if (toDate)   query = query.lte('date', toDate)

  const { data, error } = await query
  if (error) console.error('[getStudentAttendance]', error.message)
  return { data, error }
}

/**
 * Mark attendance for multiple students at once (uses stored function).
 * records: [{ student_id, date, status }]
 */
export async function markBulkAttendance(records) {
  const { data, error } = await supabase.rpc('mark_bulk_attendance', {
    p_records: records,
  })
  if (error) console.error('[markBulkAttendance]', error.message)
  return { data, error }
}

/**
 * Mark attendance for a single student.
 */
export async function markAttendance(studentId, date, status) {
  const { data, error } = await supabase
    .from('attendance')
    .upsert({ student_id: studentId, date, status }, { onConflict: 'student_id,date' })
    .select()
    .single()

  if (error) console.error('[markAttendance]', error.message)
  return { data, error }
}

// ── GRADES ───────────────────────────────────────────────────

/**
 * Add a grade record.
 */
export async function addGrade(studentId, subject, score, date) {
  const { data, error } = await supabase
    .from('grades')
    .insert({ student_id: studentId, subject, score, date })
    .select()
    .single()

  if (error) console.error('[addGrade]', error.message)
  return { data, error }
}

/**
 * Get grades for a student.
 */
export async function getStudentGrades(studentId) {
  const { data, error } = await supabase
    .from('grades')
    .select('*')
    .eq('student_id', studentId)
    .order('date', { ascending: false })

  if (error) console.error('[getStudentGrades]', error.message)
  return { data, error }
}

// ── FEES ─────────────────────────────────────────────────────

/**
 * Get fee summary for all students (uses stored function).
 */
export async function getFeeSummary(schoolId = 'school-demo-001') {
  const { data, error } = await supabase.rpc('get_fee_summary', {
    p_school_id: schoolId,
  })
  if (error) console.error('[getFeeSummary]', error.message)
  return { data, error }
}

/**
 * Get fees for a specific student.
 */
export async function getStudentFees(studentId) {
  const { data, error } = await supabase
    .from('fees')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })

  if (error) console.error('[getStudentFees]', error.message)
  return { data, error }
}

/**
 * Update fee status (e.g., mark as PAID).
 */
export async function updateFeeStatus(feeId, status) {
  const updates = { status }
  if (status === 'PAID') updates.paid_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('fees')
    .update(updates)
    .eq('id', feeId)
    .select()
    .single()

  if (!error) logAudit('UPDATE_FEE', 'fees', feeId, { status })
  return { data, error }
}

/**
 * Create fee records for a student (e.g., new term).
 */
export async function createFeeRecord(studentId, term, amount, dueDate) {
  const { data, error } = await supabase
    .from('fees')
    .insert({ student_id: studentId, term, amount, due_date: dueDate, status: 'PENDING' })
    .select()
    .single()

  if (error) console.error('[createFeeRecord]', error.message)
  return { data, error }
}

/**
 * Bulk create fee records for all students in a school (new term).
 */
export async function createTermFeesForAll(schoolId, term, amount, dueDate) {
  const { data: students } = await supabase
    .from('students')
    .select('id')
    .eq('school_id', schoolId)
    .eq('is_active', true)

  if (!students?.length) return { data: null, error: new Error('No students found') }

  const records = students.map(s => ({
    student_id: s.id, term, amount, due_date: dueDate, status: 'PENDING',
  }))

  const { data, error } = await supabase.from('fees').insert(records).select()
  if (!error) logAudit('BULK_CREATE_FEES', 'fees', null, { term, amount, count: records.length })
  return { data, error }
}

// ── LEADS (ADMISSIONS KIOSK) ─────────────────────────────────

/**
 * Create an admissions lead (works without auth — kiosk mode).
 */
export async function createLead(leadData) {
  const { studentName, parentName, phone, email, gradeApplying, notes, schoolId = 'school-demo-001' } = leadData

  const { data, error } = await supabase
    .from('leads')
    .insert({
      student_name:   studentName,
      parent_name:    parentName,
      phone,
      email,
      grade_applying: gradeApplying,
      notes,
      school_id:      schoolId,
      status:         'new',
    })
    .select()
    .single()

  if (error) console.error('[createLead]', error.message)
  return { data, error }
}

/**
 * Get all leads for admin review.
 */
export async function getAllLeads(schoolId = 'school-demo-001') {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false })

  if (error) console.error('[getAllLeads]', error.message)
  return { data, error }
}

/**
 * Update lead status.
 */
export async function updateLeadStatus(leadId, status, notes) {
  const { data, error } = await supabase
    .from('leads')
    .update({ status, notes })
    .eq('id', leadId)
    .select()
    .single()

  if (!error) logAudit('UPDATE_LEAD', 'leads', leadId, { status })
  return { data, error }
}

// ── ANALYTICS ────────────────────────────────────────────────

/**
 * Get attendance trend for a student (last N days).
 */
export async function getAttendanceTrend(studentId, days = 30) {
  const fromDate = new Date()
  fromDate.setDate(fromDate.getDate() - days)

  const { data, error } = await supabase
    .from('attendance')
    .select('date, status')
    .eq('student_id', studentId)
    .gte('date', fromDate.toISOString().split('T')[0])
    .order('date')

  if (error) console.error('[getAttendanceTrend]', error.message)
  return { data, error }
}

/**
 * Get grade trend for a student.
 */
export async function getGradeTrend(studentId) {
  const { data, error } = await supabase
    .from('grades')
    .select('date, subject, score')
    .eq('student_id', studentId)
    .order('date')

  if (error) console.error('[getGradeTrend]', error.message)
  return { data, error }
}

/**
 * Get school-wide analytics: avg grade per subject, attendance by class.
 */
export async function getSchoolAnalytics(schoolId = 'school-demo-001') {
  const [gradesRes, studentsRes] = await Promise.all([
    supabase
      .from('grades')
      .select('subject, score, students!inner(school_id)')
      .eq('students.school_id', schoolId),
    supabase
      .from('students')
      .select('class_id, attendance_percentage')
      .eq('school_id', schoolId)
      .eq('is_active', true),
  ])

  const subjectAvgs = {}
  if (gradesRes.data) {
    gradesRes.data.forEach(g => {
      if (!subjectAvgs[g.subject]) subjectAvgs[g.subject] = []
      subjectAvgs[g.subject].push(g.score)
    })
  }

  const subjectSummary = Object.entries(subjectAvgs).map(([subject, scores]) => ({
    subject,
    avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    count: scores.length,
  }))

  return {
    subjectSummary,
    students: studentsRes.data || [],
    error: gradesRes.error || studentsRes.error,
  }
}

// ── AUDIT LOG ────────────────────────────────────────────────

/**
 * Get recent audit log entries.
 */
export async function getAuditLog(limit = 50) {
  const { data, error } = await supabase
    .from('audit_log')
    .select('*, users(username)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) console.error('[getAuditLog]', error.message)
  return { data, error }
}

