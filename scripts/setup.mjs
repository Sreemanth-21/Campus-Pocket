// Campus Pocket — Full Setup Script (no Supabase Auth required)
// Run: node scripts/setup.mjs

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL      = 'https://vyxotymuqnpzgcdguvbe.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5eG90eW11cW5wemdjZGd1dmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMjU4MjMsImV4cCI6MjA5MjYwMTgyM30.AfHjHFabIrruxRAtVThlluTl-3gp5EWdoTohi29gAcA'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Same hash function as AuthContext.jsx
function simpleHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return String(Math.abs(hash))
}

async function run() {
  console.log('\n🚀 Campus Pocket — Database Setup\n')

  // ── USERS ────────────────────────────────────────────────
  console.log('Step 1: Seeding users...')
  const usersData = [
    { username: 'alex.johnson',   password_hash: simpleHash('student123'), role: 'student', school_id: 'school-demo-001' },
    { username: 'priya.sharma',   password_hash: simpleHash('student123'), role: 'student', school_id: 'school-demo-001' },
    { username: 'robert.johnson', password_hash: simpleHash('parent123'),  role: 'parent',  school_id: 'school-demo-001' },
  ]
  const { data: users, error: usersErr } = await supabase
    .from('users').upsert(usersData, { onConflict: 'username' }).select()
  if (usersErr) { console.error('  ✗ users:', usersErr.message); process.exit(1) }
  console.log(`  ✓ ${users.length} users seeded`)

  const alexUserId   = users.find(u => u.username === 'alex.johnson')?.id
  const priyaUserId  = users.find(u => u.username === 'priya.sharma')?.id
  const robertUserId = users.find(u => u.username === 'robert.johnson')?.id

  // ── STUDENTS ─────────────────────────────────────────────
  console.log('Step 2: Seeding students...')
  const studentsData = [
    {
      user_id: alexUserId, name: 'Alex Johnson', class: '10', section: 'A',
      attendance_percentage: 82, school_id: 'school-demo-001',
      admission_number: 'ADM-2021-001', date_of_birth: '2008-04-15',
      gender: 'Male', joining_date: '2021-06-01', guardian_name: 'Robert Johnson',
      contact: '+1 (555) 012-3456', email: 'alex.johnson@demo.edu',
      blood_group: 'O+', address: '42 Maple Street, Springfield',
    },
    {
      user_id: priyaUserId, name: 'Priya Sharma', class: '10', section: 'B',
      attendance_percentage: 68, school_id: 'school-demo-001',
      admission_number: 'ADM-2021-002', date_of_birth: '2008-09-22',
      gender: 'Female', joining_date: '2021-06-01', guardian_name: 'Robert Johnson',
      contact: '+1 (555) 098-7654', email: 'priya.sharma@demo.edu',
      blood_group: 'B+', address: '18 Oak Avenue, Springfield',
    },
  ]
  const { data: students, error: studErr } = await supabase
    .from('students').upsert(studentsData, { onConflict: 'user_id' }).select()
  if (studErr) { console.error('  ✗ students:', studErr.message); process.exit(1) }
  console.log(`  ✓ ${students.length} students seeded`)

  const alexStudentId  = students.find(s => s.user_id === alexUserId)?.id
  const priyaStudentId = students.find(s => s.user_id === priyaUserId)?.id

  // ── PARENTS ──────────────────────────────────────────────
  console.log('Step 3: Seeding parents...')
  const { data: parents, error: parErr } = await supabase
    .from('parents').upsert([{ user_id: robertUserId, name: 'Robert Johnson', school_id: 'school-demo-001' }], { onConflict: 'user_id' }).select()
  if (parErr) { console.error('  ✗ parents:', parErr.message); process.exit(1) }
  console.log(`  ✓ ${parents.length} parents seeded`)
  const parentId = parents[0]?.id

  // ── PARENT-CHILD ─────────────────────────────────────────
  console.log('Step 4: Seeding parent_child...')
  const { error: pcErr } = await supabase.from('parent_child').upsert([
    { parent_id: parentId, student_id: alexStudentId },
    { parent_id: parentId, student_id: priyaStudentId },
  ], { onConflict: 'parent_id,student_id' })
  if (pcErr) console.error('  ✗ parent_child:', pcErr.message)
  else console.log('  ✓ parent_child seeded')

  // ── GRADES ───────────────────────────────────────────────
  console.log('Step 5: Seeding grades...')
  const gradesData = [
    { student_id: alexStudentId,  subject: 'Mathematics', score: 88, date: '2024-01-15' },
    { student_id: alexStudentId,  subject: 'Science',     score: 92, date: '2024-01-20' },
    { student_id: alexStudentId,  subject: 'English',     score: 76, date: '2024-02-05' },
    { student_id: alexStudentId,  subject: 'History',     score: 84, date: '2024-02-10' },
    { student_id: alexStudentId,  subject: 'Mathematics', score: 91, date: '2024-02-20' },
    { student_id: alexStudentId,  subject: 'Science',     score: 87, date: '2024-03-01' },
    { student_id: alexStudentId,  subject: 'English',     score: 80, date: '2024-03-10' },
    { student_id: alexStudentId,  subject: 'Mathematics', score: 94, date: '2024-03-20' },
    { student_id: priyaStudentId, subject: 'Mathematics', score: 72, date: '2024-01-15' },
    { student_id: priyaStudentId, subject: 'Science',     score: 65, date: '2024-01-20' },
    { student_id: priyaStudentId, subject: 'English',     score: 88, date: '2024-02-05' },
    { student_id: priyaStudentId, subject: 'History',     score: 79, date: '2024-02-10' },
    { student_id: priyaStudentId, subject: 'Mathematics', score: 68, date: '2024-02-20' },
    { student_id: priyaStudentId, subject: 'Science',     score: 71, date: '2024-03-01' },
  ]
  const { error: grErr } = await supabase.from('grades').insert(gradesData)
  if (grErr) console.error('  ✗ grades:', grErr.message)
  else console.log(`  ✓ ${gradesData.length} grades seeded`)

  // ── FEES ─────────────────────────────────────────────────
  console.log('Step 6: Seeding fees...')
  const feesData = [
    { student_id: alexStudentId,  term: 'Term 1 2024', status: 'PAID',    amount: 15000 },
    { student_id: alexStudentId,  term: 'Term 2 2024', status: 'PAID',    amount: 15000 },
    { student_id: alexStudentId,  term: 'Term 3 2024', status: 'PENDING', amount: 15000 },
    { student_id: priyaStudentId, term: 'Term 1 2024', status: 'PAID',    amount: 15000 },
    { student_id: priyaStudentId, term: 'Term 2 2024', status: 'OVERDUE', amount: 15000 },
    { student_id: priyaStudentId, term: 'Term 3 2024', status: 'OVERDUE', amount: 15000 },
  ]
  const { error: feeErr } = await supabase.from('fees').insert(feesData)
  if (feeErr) console.error('  ✗ fees:', feeErr.message)
  else console.log(`  ✓ ${feesData.length} fees seeded`)

  // ── EXAMS ────────────────────────────────────────────────
  console.log('Step 7: Seeding exams...')
  const examsData = [
    { student_id: alexStudentId,  subject: 'Mathematics', date: '2024-04-10', score: 91 },
    { student_id: alexStudentId,  subject: 'Science',     date: '2024-04-12', score: 88 },
    { student_id: alexStudentId,  subject: 'English',     date: '2024-04-15', score: 79 },
    { student_id: alexStudentId,  subject: 'History',     date: '2025-08-20', score: null },
    { student_id: alexStudentId,  subject: 'Physics',     date: '2025-08-22', score: null },
    { student_id: priyaStudentId, subject: 'Mathematics', date: '2024-04-10', score: 70 },
    { student_id: priyaStudentId, subject: 'Science',     date: '2024-04-12', score: 65 },
    { student_id: priyaStudentId, subject: 'English',     date: '2024-04-15', score: 85 },
    { student_id: priyaStudentId, subject: 'History',     date: '2025-08-20', score: null },
  ]
  const { error: exErr } = await supabase.from('exams').insert(examsData)
  if (exErr) console.error('  ✗ exams:', exErr.message)
  else console.log(`  ✓ ${examsData.length} exams seeded`)

  // ── ATTENDANCE ───────────────────────────────────────────
  console.log('Step 8: Seeding attendance (60 days)...')
  const attData = []
  const today = new Date()
  for (let i = 59; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    if (d.getDay() === 0 || d.getDay() === 6) continue
    const dateStr = d.toISOString().split('T')[0]
    const r1 = Math.random() * 100
    attData.push({ student_id: alexStudentId,  date: dateStr, status: r1 < 77 ? 'present' : r1 < 87 ? 'late' : 'absent' })
    const r2 = Math.random() * 100
    attData.push({ student_id: priyaStudentId, date: dateStr, status: r2 < 63 ? 'present' : r2 < 73 ? 'late' : 'absent' })
  }
  const { error: attErr } = await supabase.from('attendance').upsert(attData, { onConflict: 'student_id,date' })
  if (attErr) console.error('  ✗ attendance:', attErr.message)
  else console.log(`  ✓ ${attData.length} attendance records seeded`)

  // ── TIMETABLE ────────────────────────────────────────────
  console.log('Step 9: Seeding timetable...')
  const ttData = [
    { class:'10', day:'Monday',    subject:'Mathematics', time:'08:00 - 09:00' },
    { class:'10', day:'Monday',    subject:'Science',     time:'09:00 - 10:00' },
    { class:'10', day:'Monday',    subject:'English',     time:'10:30 - 11:30' },
    { class:'10', day:'Monday',    subject:'History',     time:'11:30 - 12:30' },
    { class:'10', day:'Tuesday',   subject:'Physics',     time:'08:00 - 09:00' },
    { class:'10', day:'Tuesday',   subject:'Chemistry',   time:'09:00 - 10:00' },
    { class:'10', day:'Tuesday',   subject:'Mathematics', time:'10:30 - 11:30' },
    { class:'10', day:'Tuesday',   subject:'PE',          time:'11:30 - 12:30' },
    { class:'10', day:'Wednesday', subject:'English',     time:'08:00 - 09:00' },
    { class:'10', day:'Wednesday', subject:'Art',         time:'09:00 - 10:00' },
    { class:'10', day:'Wednesday', subject:'Science',     time:'10:30 - 11:30' },
    { class:'10', day:'Wednesday', subject:'Mathematics', time:'11:30 - 12:30' },
    { class:'10', day:'Thursday',  subject:'History',     time:'08:00 - 09:00' },
    { class:'10', day:'Thursday',  subject:'Physics',     time:'09:00 - 10:00' },
    { class:'10', day:'Thursday',  subject:'English',     time:'10:30 - 11:30' },
    { class:'10', day:'Thursday',  subject:'Chemistry',   time:'11:30 - 12:30' },
    { class:'10', day:'Friday',    subject:'Mathematics', time:'08:00 - 09:00' },
    { class:'10', day:'Friday',    subject:'Science',     time:'09:00 - 10:00' },
    { class:'10', day:'Friday',    subject:'PE',          time:'10:30 - 11:30' },
    { class:'10', day:'Friday',    subject:'Art',         time:'11:30 - 12:30' },
  ]
  const { error: ttErr } = await supabase.from('timetable').insert(ttData)
  if (ttErr) console.error('  ✗ timetable:', ttErr.message)
  else console.log(`  ✓ ${ttData.length} timetable entries seeded`)

  // ── CIRCULARS ────────────────────────────────────────────
  console.log('Step 10: Seeding circulars...')
  const { error: cirErr } = await supabase.from('circulars').insert([
    { school_id:'school-demo-001', title:'Annual Sports Day 2024', has_file:true,
      description:'Annual Sports Day will be held on April 20th. All students must participate. Parents are cordially invited from 9:00 AM at the school ground.' },
    { school_id:'school-demo-001', title:'Summer Vacation Notice', has_file:true,
      description:'School will remain closed for summer vacation from May 1st to June 15th. Classes resume June 17th.' },
    { school_id:'school-demo-001', title:'Parent-Teacher Meeting', has_file:false,
      description:'PTM is scheduled for March 30th between 10:00 AM – 1:00 PM. Parents are requested to meet class teachers.' },
    { school_id:'school-demo-001', title:'Fee Payment Reminder', has_file:false,
      description:'Term 3 fee payment deadline is April 15th. Please clear dues before the deadline.' },
    { school_id:'school-demo-001', title:'New Library Books Available', has_file:false,
      description:'The school library has added 200+ new books across Science, Literature, and History.' },
  ])
  if (cirErr) console.error('  ✗ circulars:', cirErr.message)
  else console.log('  ✓ circulars seeded')

  // ── TRANSPORT ────────────────────────────────────────────
  console.log('Step 11: Seeding transport...')
  const { data: routes, error: rtErr } = await supabase.from('transport_routes').insert([
    { school_id:'school-demo-001', name:'Route A — North Zone',
      stops:['City Center','Park Street','Lake View','Green Colony','School'],
      morning_timing:'7:30 AM – 8:15 AM', return_timing:'3:30 PM – 4:15 PM', fee:2500, total_seats:40, available_seats:5 },
    { school_id:'school-demo-001', name:'Route B — South Zone',
      stops:['Railway Station','Market Road','Sunrise Apartments','Hill View','School'],
      morning_timing:'7:15 AM – 8:10 AM', return_timing:'3:30 PM – 4:25 PM', fee:2800, total_seats:35, available_seats:2 },
    { school_id:'school-demo-001', name:'Route C — East Zone',
      stops:['Tech Park','Sector 5','Old Town','River Bridge','School'],
      morning_timing:'7:45 AM – 8:20 AM', return_timing:'3:30 PM – 4:05 PM', fee:2200, total_seats:45, available_seats:12 },
  ]).select()
  if (rtErr) console.error('  ✗ transport_routes:', rtErr.message)
  else {
    console.log(`  ✓ ${routes.length} routes seeded`)
    if (routes[0]) {
      const { error: taErr } = await supabase.from('transport_assignments').upsert([{
        student_id: alexStudentId, route_id: routes[0].id,
        stop: 'Park Street', bus_number: 'KA-01-AB-1234',
        driver_name: 'Mr. Ramesh Kumar', driver_contact: '+91 98765 43210',
      }], { onConflict: 'student_id' })
      if (taErr) console.error('  ✗ transport_assignment:', taErr.message)
      else console.log('  ✓ transport assignment seeded')
    }
  }

  // ── MESSAGES ─────────────────────────────────────────────
  console.log('Step 12: Seeding messages...')
  const { error: msgErr } = await supabase.from('messages').insert([
    { parent_id: parentId, teacher_name: 'Ms. Williams',
      message: 'Alex has been performing exceptionally well in Mathematics this semester.',
      reply: 'Thank you for the update! We are very proud of Alex.' },
    { parent_id: parentId, teacher_name: 'Mr. Davis',
      message: 'Priya needs to improve her attendance. She has missed several Science classes.',
      reply: null },
  ])
  if (msgErr) console.error('  ✗ messages:', msgErr.message)
  else console.log('  ✓ messages seeded')

  // ── HELPDESK ─────────────────────────────────────────────
  console.log('Step 13: Seeding helpdesk...')
  const { error: hdErr } = await supabase.from('helpdesk').insert([
    { parent_id: parentId, subject: 'Fee receipt not received', category: 'Query',
      description: 'I paid Term 2 fees online but did not receive the receipt.',
      status: 'Resolved', response: 'Receipt has been emailed to your registered email address.' },
    { parent_id: parentId, subject: 'Bus timing issue', category: 'Complaint',
      description: 'The school bus on Route A is consistently arriving 15 minutes late.',
      status: 'In Progress', response: 'We have escalated this to the transport department.' },
  ])
  if (hdErr) console.error('  ✗ helpdesk:', hdErr.message)
  else console.log('  ✓ helpdesk seeded')

  // ── REQUESTS ─────────────────────────────────────────────
  console.log('Step 14: Seeding requests...')
  const { error: reqErr } = await supabase.from('requests').insert([
    { parent_id: parentId, student_id: alexStudentId, type: 'Bonafide Request',
      reason: 'Required for bank account opening', status: 'Approved',
      response: 'Certificate ready for collection from the office.' },
    { parent_id: parentId, student_id: priyaStudentId, type: 'TC Request',
      reason: 'School transfer to another city', status: 'Pending', response: null },
  ])
  if (reqErr) console.error('  ✗ requests:', reqErr.message)
  else console.log('  ✓ requests seeded')

  // ── NOTIFICATIONS ────────────────────────────────────────
  console.log('Step 15: Seeding notifications...')
  const { error: notifErr } = await supabase.from('notifications').insert([
    { user_id: robertUserId, type:'fee',        message:"Fee for Term 3 is due in 5 days",           severity:'warning',  read:false },
    { user_id: robertUserId, type:'attendance', message:"Priya's attendance dropped below 75%",       severity:'critical', read:false },
    { user_id: alexUserId,   type:'exam',       message:'History exam scheduled on August 20',        severity:'info',     read:false },
    { user_id: alexUserId,   type:'exam',       message:'Physics exam scheduled on August 22',        severity:'info',     read:false },
    { user_id: priyaUserId,  type:'attendance', message:'Your attendance is below 75% — take action', severity:'critical', read:false },
  ])
  if (notifErr) console.error('  ✗ notifications:', notifErr.message)
  else console.log('  ✓ notifications seeded')

  console.log('\n✅ All done!\n')
  console.log('Login credentials:')
  console.log('  Student: alex.johnson   / student123')
  console.log('  Student: priya.sharma   / student123')
  console.log('  Parent:  robert.johnson / parent123\n')
}

run().catch(console.error)
