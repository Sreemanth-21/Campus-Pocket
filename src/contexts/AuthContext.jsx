import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

const DEMO_USERS = [
  { id: 'user-student-1', username: 'alex.johnson',    password: 'student123', role: 'student', school_id: 'school-demo-001' },
  { id: 'user-student-2', username: 'priya.sharma',    password: 'student123', role: 'student', school_id: 'school-demo-001' },
  { id: 'user-parent-1',  username: 'robert.johnson',  password: 'parent123',  role: 'parent',  school_id: 'school-demo-001' },
  { id: 'user-admin-1',   username: 'admin',           password: 'admin123',   role: 'admin',   school_id: 'school-demo-001' },
  { id: 'user-teacher-1', username: 'sarah.williams',  password: 'teacher123', role: 'teacher', school_id: 'school-demo-001' },
]

const DEMO_STUDENTS = [
  { id:'student-1', user_id:'user-student-1', name:'Alex Johnson', class:'10', section:'A', attendance_percentage:82, school_id:'school-demo-001', admission_number:'ADM-2021-001', date_of_birth:'2008-04-15', gender:'Male',   joining_date:'2021-06-01', guardian_name:'Robert Johnson', contact:'+1 (555) 012-3456', email:'alex.johnson@demo.edu',  blood_group:'O+', address:'42 Maple Street, Springfield' },
  { id:'student-2', user_id:'user-student-2', name:'Priya Sharma', class:'10', section:'B', attendance_percentage:68, school_id:'school-demo-001', admission_number:'ADM-2021-002', date_of_birth:'2008-09-22', gender:'Female', joining_date:'2021-06-01', guardian_name:'Robert Johnson', contact:'+1 (555) 098-7654', email:'priya.sharma@demo.edu',  blood_group:'B+', address:'18 Oak Avenue, Springfield' },
]

const DEMO_PARENTS = [
  { id: 'parent-1', user_id: 'user-parent-1', name: 'Robert Johnson', school_id: 'school-demo-001' },
]

const DEMO_ADMIN   = { id: 'user-admin-1',   name: 'Admin',          school_id: 'school-demo-001' }
const DEMO_TEACHER = { id: 'user-teacher-1', name: 'Sarah Williams', subject: 'Mathematics', school_id: 'school-demo-001' }

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('cp-session')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setUser(parsed.user)
        setProfile(parsed.profile)
      } catch {}
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    const found = DEMO_USERS.find(u => u.username === username && u.password === password)
    if (!found) throw new Error('Invalid username or password')

    const profile = found.role === 'student'
      ? DEMO_STUDENTS.find(s => s.user_id === found.id)
      : found.role === 'parent'
      ? DEMO_PARENTS.find(p => p.user_id === found.id)
      : found.role === 'teacher'
      ? DEMO_TEACHER
      : DEMO_ADMIN

    const userData = { id: found.id, username: found.username, role: found.role, school_id: found.school_id }
    setUser(userData)
    setProfile(profile)
    localStorage.setItem('cp-session', JSON.stringify({ user: userData, profile }))
    return { user: userData, profile }
  }

  const logout = () => {
    setUser(null)
    setProfile(null)
    localStorage.removeItem('cp-session')
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

