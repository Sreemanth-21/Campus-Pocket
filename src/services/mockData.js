// Demo seed data
export const DEMO_SCHOOL_ID = 'school-demo-001'

export const demoUsers = [
  { id: 'user-student-1', username: 'alex.johnson',   role: 'student', school_id: DEMO_SCHOOL_ID, password: 'student123' },
  { id: 'user-student-2', username: 'priya.sharma',   role: 'student', school_id: DEMO_SCHOOL_ID, password: 'student123' },
  { id: 'user-student-3', username: 'rahul.verma',    role: 'student', school_id: DEMO_SCHOOL_ID, password: 'student123' },
  { id: 'user-student-4', username: 'sara.khan',      role: 'student', school_id: DEMO_SCHOOL_ID, password: 'student123' },
  { id: 'user-student-5', username: 'arjun.nair',     role: 'student', school_id: DEMO_SCHOOL_ID, password: 'student123' },
  { id: 'user-student-6', username: 'meera.iyer',     role: 'student', school_id: DEMO_SCHOOL_ID, password: 'student123' },
  { id: 'user-parent-1',  username: 'robert.johnson', role: 'parent',  school_id: DEMO_SCHOOL_ID, password: 'parent123' },
  { id: 'user-admin-1',   username: 'admin',          role: 'admin',   school_id: DEMO_SCHOOL_ID, password: 'admin123' },
]

export const demoStudents = [
  { id:'student-1', user_id:'user-student-1', name:'Alex Johnson',  class:'10', section:'A', attendance_percentage:82, school_id:DEMO_SCHOOL_ID, admission_number:'ADM-2021-001', date_of_birth:'2008-04-15', gender:'Male',   joining_date:'2021-06-01', guardian_name:'Robert Johnson', contact:'+1 (555) 012-3456', email:'alex.johnson@demo.edu',  blood_group:'O+', address:'42 Maple Street, Springfield', parent_phone:'+919110762628' },
  { id:'student-2', user_id:'user-student-2', name:'Priya Sharma',  class:'10', section:'B', attendance_percentage:68, school_id:DEMO_SCHOOL_ID, admission_number:'ADM-2021-002', date_of_birth:'2008-09-22', gender:'Female', joining_date:'2021-06-01', guardian_name:'Robert Johnson', contact:'+1 (555) 098-7654', email:'priya.sharma@demo.edu',  blood_group:'B+', address:'18 Oak Avenue, Springfield',  parent_phone:'+919110762628' },
  { id:'student-3', user_id:'user-student-3', name:'Rahul Verma',   class:'9',  section:'A', attendance_percentage:91, school_id:DEMO_SCHOOL_ID, admission_number:'ADM-2021-003', date_of_birth:'2009-01-10', gender:'Male',   joining_date:'2021-06-01', guardian_name:'Suresh Verma',   contact:'+91 98765 11111',   email:'rahul.verma@demo.edu',   blood_group:'A+', address:'5 MG Road, Bangalore',          parent_phone:'+919110762628' },
  { id:'student-4', user_id:'user-student-4', name:'Sara Khan',     class:'9',  section:'B', attendance_percentage:74, school_id:DEMO_SCHOOL_ID, admission_number:'ADM-2021-004', date_of_birth:'2009-03-18', gender:'Female', joining_date:'2021-06-01', guardian_name:'Imran Khan',     contact:'+91 98765 22222',   email:'sara.khan@demo.edu',     blood_group:'AB+',address:'12 Park Lane, Mumbai',          parent_phone:'+919110762628' },
  { id:'student-5', user_id:'user-student-5', name:'Arjun Nair',    class:'11', section:'A', attendance_percentage:88, school_id:DEMO_SCHOOL_ID, admission_number:'ADM-2020-001', date_of_birth:'2007-07-25', gender:'Male',   joining_date:'2020-06-01', guardian_name:'Vijay Nair',     contact:'+91 98765 33333',   email:'arjun.nair@demo.edu',    blood_group:'O-', address:'7 Beach Road, Chennai',          parent_phone:'+919110762628' },
  { id:'student-6', user_id:'user-student-6', name:'Meera Iyer',    class:'11', section:'B', attendance_percentage:95, school_id:DEMO_SCHOOL_ID, admission_number:'ADM-2020-002', date_of_birth:'2007-11-02', gender:'Female', joining_date:'2020-06-01', guardian_name:'Ravi Iyer',      contact:'+91 98765 44444',   email:'meera.iyer@demo.edu',    blood_group:'B-', address:'3 Temple Street, Coimbatore',    parent_phone:'+919110762628' },
]

export const demoParents = [
  // phone_number: E.164 format — replace with your real demo number before presenting
  { id:'parent-1', user_id:'user-parent-1', name:'Robert Johnson', school_id:DEMO_SCHOOL_ID, phone_number:'+919182049955' },
]

export const demoParentChild = [
  { parent_id:'parent-1', student_id:'student-1' },
  { parent_id:'parent-1', student_id:'student-2' },
]

function genAttendance(studentId, pct) {
  const records = [], today = new Date()
  for (let i = 59; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i)
    if (d.getDay() === 0 || d.getDay() === 6) continue
    const r = Math.random() * 100
    records.push({ id:`att-${studentId}-${i}`, student_id:studentId, date:d.toISOString().split('T')[0],
      status: r < pct-5 ? 'present' : r < pct+5 ? 'late' : 'absent' })
  }
  return records
}

export const demoAttendance = [
  ...genAttendance('student-1', 82), ...genAttendance('student-2', 68),
  ...genAttendance('student-3', 91), ...genAttendance('student-4', 74),
  ...genAttendance('student-5', 88), ...genAttendance('student-6', 95),
]

export const demoGrades = [
  // Alex
  { id:'g1',  student_id:'student-1', subject:'Mathematics', score:88, date:'2024-01-15' },
  { id:'g2',  student_id:'student-1', subject:'Science',     score:92, date:'2024-01-20' },
  { id:'g3',  student_id:'student-1', subject:'English',     score:76, date:'2024-02-05' },
  { id:'g4',  student_id:'student-1', subject:'History',     score:84, date:'2024-02-10' },
  { id:'g5',  student_id:'student-1', subject:'Mathematics', score:91, date:'2024-02-20' },
  { id:'g6',  student_id:'student-1', subject:'Science',     score:87, date:'2024-03-01' },
  { id:'g7',  student_id:'student-1', subject:'English',     score:80, date:'2024-03-10' },
  { id:'g8',  student_id:'student-1', subject:'Mathematics', score:94, date:'2024-03-20' },
  // Priya
  { id:'g9',  student_id:'student-2', subject:'Mathematics', score:72, date:'2024-01-15' },
  { id:'g10', student_id:'student-2', subject:'Science',     score:65, date:'2024-01-20' },
  { id:'g11', student_id:'student-2', subject:'English',     score:88, date:'2024-02-05' },
  { id:'g12', student_id:'student-2', subject:'History',     score:79, date:'2024-02-10' },
  { id:'g13', student_id:'student-2', subject:'Mathematics', score:68, date:'2024-02-20' },
  { id:'g14', student_id:'student-2', subject:'Science',     score:71, date:'2024-03-01' },
  // Rahul
  { id:'g15', student_id:'student-3', subject:'Mathematics', score:95, date:'2024-01-15' },
  { id:'g16', student_id:'student-3', subject:'Science',     score:89, date:'2024-01-20' },
  { id:'g17', student_id:'student-3', subject:'English',     score:82, date:'2024-02-05' },
  { id:'g18', student_id:'student-3', subject:'History',     score:91, date:'2024-02-10' },
  // Sara
  { id:'g19', student_id:'student-4', subject:'Mathematics', score:61, date:'2024-01-15' },
  { id:'g20', student_id:'student-4', subject:'Science',     score:58, date:'2024-01-20' },
  { id:'g21', student_id:'student-4', subject:'English',     score:74, date:'2024-02-05' },
  { id:'g22', student_id:'student-4', subject:'History',     score:67, date:'2024-02-10' },
  // Arjun
  { id:'g23', student_id:'student-5', subject:'Mathematics', score:87, date:'2024-01-15' },
  { id:'g24', student_id:'student-5', subject:'Science',     score:91, date:'2024-01-20' },
  { id:'g25', student_id:'student-5', subject:'English',     score:78, date:'2024-02-05' },
  // Meera
  { id:'g26', student_id:'student-6', subject:'Mathematics', score:98, date:'2024-01-15' },
  { id:'g27', student_id:'student-6', subject:'Science',     score:96, date:'2024-01-20' },
  { id:'g28', student_id:'student-6', subject:'English',     score:93, date:'2024-02-05' },
  { id:'g29', student_id:'student-6', subject:'History',     score:97, date:'2024-02-10' },
]

export const demoFees = [
  { id:'f1', student_id:'student-1', term:'Term 1 2024', status:'PAID',    amount:15000 },
  { id:'f2', student_id:'student-1', term:'Term 2 2024', status:'PAID',    amount:15000 },
  { id:'f3', student_id:'student-1', term:'Term 3 2024', status:'PENDING', amount:15000 },
  { id:'f4', student_id:'student-2', term:'Term 1 2024', status:'PAID',    amount:15000 },
  { id:'f5', student_id:'student-2', term:'Term 2 2024', status:'OVERDUE', amount:15000 },
  { id:'f6', student_id:'student-2', term:'Term 3 2024', status:'OVERDUE', amount:15000 },
  { id:'f7', student_id:'student-3', term:'Term 1 2024', status:'PAID',    amount:15000 },
  { id:'f8', student_id:'student-3', term:'Term 2 2024', status:'PAID',    amount:15000 },
  { id:'f9', student_id:'student-3', term:'Term 3 2024', status:'PAID',    amount:15000 },
  { id:'f10',student_id:'student-4', term:'Term 1 2024', status:'PAID',    amount:15000 },
  { id:'f11',student_id:'student-4', term:'Term 2 2024', status:'PENDING', amount:15000 },
  { id:'f12',student_id:'student-4', term:'Term 3 2024', status:'OVERDUE', amount:15000 },
  { id:'f13',student_id:'student-5', term:'Term 1 2024', status:'PAID',    amount:15000 },
  { id:'f14',student_id:'student-5', term:'Term 2 2024', status:'PAID',    amount:15000 },
  { id:'f15',student_id:'student-5', term:'Term 3 2024', status:'PAID',    amount:15000 },
  { id:'f16',student_id:'student-6', term:'Term 1 2024', status:'PAID',    amount:15000 },
  { id:'f17',student_id:'student-6', term:'Term 2 2024', status:'PAID',    amount:15000 },
  { id:'f18',student_id:'student-6', term:'Term 3 2024', status:'PAID',    amount:15000 },
]

export const demoTimetable = [
  { id:'t1',  class:'10', day:'Monday',    subject:'Mathematics', time:'08:00 - 09:00' },
  { id:'t2',  class:'10', day:'Monday',    subject:'Science',     time:'09:00 - 10:00' },
  { id:'t3',  class:'10', day:'Monday',    subject:'English',     time:'10:30 - 11:30' },
  { id:'t4',  class:'10', day:'Monday',    subject:'History',     time:'11:30 - 12:30' },
  { id:'t5',  class:'10', day:'Tuesday',   subject:'Physics',     time:'08:00 - 09:00' },
  { id:'t6',  class:'10', day:'Tuesday',   subject:'Chemistry',   time:'09:00 - 10:00' },
  { id:'t7',  class:'10', day:'Tuesday',   subject:'Mathematics', time:'10:30 - 11:30' },
  { id:'t8',  class:'10', day:'Tuesday',   subject:'PE',          time:'11:30 - 12:30' },
  { id:'t9',  class:'10', day:'Wednesday', subject:'English',     time:'08:00 - 09:00' },
  { id:'t10', class:'10', day:'Wednesday', subject:'Art',         time:'09:00 - 10:00' },
  { id:'t11', class:'10', day:'Wednesday', subject:'Science',     time:'10:30 - 11:30' },
  { id:'t12', class:'10', day:'Wednesday', subject:'Mathematics', time:'11:30 - 12:30' },
  { id:'t13', class:'10', day:'Thursday',  subject:'History',     time:'08:00 - 09:00' },
  { id:'t14', class:'10', day:'Thursday',  subject:'Physics',     time:'09:00 - 10:00' },
  { id:'t15', class:'10', day:'Thursday',  subject:'English',     time:'10:30 - 11:30' },
  { id:'t16', class:'10', day:'Thursday',  subject:'Chemistry',   time:'11:30 - 12:30' },
  { id:'t17', class:'10', day:'Friday',    subject:'Mathematics', time:'08:00 - 09:00' },
  { id:'t18', class:'10', day:'Friday',    subject:'Science',     time:'09:00 - 10:00' },
  { id:'t19', class:'10', day:'Friday',    subject:'PE',          time:'10:30 - 11:30' },
  { id:'t20', class:'10', day:'Friday',    subject:'Art',         time:'11:30 - 12:30' },
]

export const demoExams = [
  { id:'e1', student_id:'student-1', subject:'Mathematics', date:'2024-04-10', score:91 },
  { id:'e2', student_id:'student-1', subject:'Science',     date:'2024-04-12', score:88 },
  { id:'e3', student_id:'student-1', subject:'English',     date:'2024-04-15', score:79 },
  { id:'e4', student_id:'student-1', subject:'History',     date:'2025-08-20', score:null },
  { id:'e5', student_id:'student-1', subject:'Physics',     date:'2025-08-22', score:null },
  { id:'e6', student_id:'student-2', subject:'Mathematics', date:'2024-04-10', score:70 },
  { id:'e7', student_id:'student-2', subject:'Science',     date:'2024-04-12', score:65 },
  { id:'e8', student_id:'student-2', subject:'English',     date:'2024-04-15', score:85 },
  { id:'e9', student_id:'student-2', subject:'History',     date:'2025-08-20', score:null },
]

export const demoMessages = [
  { id:'m1', parent_id:'parent-1', teacher_name:'Ms. Williams', message:'Alex has been performing exceptionally well in Mathematics.', reply:'Thank you! We are very proud of Alex.', created_at:'2024-03-15T10:00:00Z' },
  { id:'m2', parent_id:'parent-1', teacher_name:'Mr. Davis',    message:'Priya needs to improve her attendance.', reply:null, created_at:'2024-03-20T14:00:00Z' },
]

export const demoCirculars = [
  { id:'c1', title:'Annual Sports Day 2024',   date:'2024-04-01', description:'Annual Sports Day will be held on April 20th. All students must participate.', file:true },
  { id:'c2', title:'Summer Vacation Notice',   date:'2024-03-25', description:'School will remain closed from May 1st to June 15th.', file:true },
  { id:'c3', title:'Parent-Teacher Meeting',   date:'2024-03-18', description:'PTM scheduled for March 30th between 10:00 AM – 1:00 PM.', file:false },
  { id:'c4', title:'Fee Payment Reminder',     date:'2024-03-10', description:'Term 3 fee payment deadline is April 15th.', file:false },
  { id:'c5', title:'New Library Books',        date:'2024-03-05', description:'The school library has added 200+ new books.', file:false },
]

export const demoRequests = [
  { id:'r1', parent_id:'parent-1', type:'Bonafide Request', student_name:'Alex Johnson', reason:'Required for bank account opening', status:'Approved', date:'2024-03-10', response:'Certificate ready for collection.' },
  { id:'r2', parent_id:'parent-1', type:'TC Request',       student_name:'Priya Sharma', reason:'School transfer to another city',   status:'Pending',  date:'2024-03-20', response:null },
]

export const demoTransport = {
  routes: [
    { id:'tr1', name:'Route A — North Zone', stops:['City Center','Park Street','Lake View','Green Colony','School'], timing:'7:30 AM – 8:15 AM', return:'3:30 PM – 4:15 PM', fee:2500, seats:40, available:5 },
    { id:'tr2', name:'Route B — South Zone', stops:['Railway Station','Market Road','Sunrise Apartments','Hill View','School'], timing:'7:15 AM – 8:10 AM', return:'3:30 PM – 4:25 PM', fee:2800, seats:35, available:2 },
    { id:'tr3', name:'Route C — East Zone',  stops:['Tech Park','Sector 5','Old Town','River Bridge','School'], timing:'7:45 AM – 8:20 AM', return:'3:30 PM – 4:05 PM', fee:2200, seats:45, available:12 },
  ],
  assigned:{ student_id:'student-1', route_id:'tr1', stop:'Park Street', bus_number:'KA-01-AB-1234', driver:'Mr. Ramesh Kumar', driver_contact:'+91 98765 43210' },
}

export const demoHelpdesk = [
  { id:'h1', parent_id:'parent-1', subject:'Fee receipt not received', category:'Query',     description:'I paid Term 2 fees online but did not receive the receipt.', status:'Resolved',    date:'2024-03-05', response:'Receipt has been emailed to your registered email address.' },
  { id:'h2', parent_id:'parent-1', subject:'Bus timing issue',         category:'Complaint', description:'The school bus on Route A is consistently arriving 15 minutes late.', status:'In Progress', date:'2024-03-22', response:'We have escalated this to the transport department.' },
]

export const demoNotifications = [
  { id:'n1', type:'fee',        message:"Fee for Term 3 is due in 5 days",         severity:'warning',  read:false },
  { id:'n2', type:'attendance', message:"Priya's attendance dropped below 75%",     severity:'critical', read:false },
  { id:'n3', type:'exam',       message:'History exam scheduled on August 20',      severity:'info',     read:true  },
  { id:'n4', type:'exam',       message:'Physics exam scheduled on August 22',      severity:'info',     read:true  },
]

