import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { NotificationProvider } from './contexts/NotificationContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import StudentLayout from './pages/student/StudentLayout'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentAttendance from './pages/student/StudentAttendance'
import StudentGrades from './pages/student/StudentGrades'
import StudentTimetable from './pages/student/StudentTimetable'
import StudentExams from './pages/student/StudentExams'
import StudentIDCard from './pages/student/StudentIDCard'
import StudentHelpdesk from './pages/student/StudentHelpdesk'
import StudentAI from './pages/student/StudentAI'
import StudentTests from './pages/student/StudentTests'
import StudentTextbook from './pages/student/StudentTextbook'
import StudentStudyMaterials from './pages/student/StudentStudyMaterials'
import StudentDoubtSolver from './pages/student/StudentDoubtSolver'
import StudentAssignments from './pages/student/StudentAssignments'
import ParentLayout from './pages/parent/ParentLayout'
import ParentDashboard from './pages/parent/ParentDashboard'
import ParentAttendance from './pages/parent/ParentAttendance'
import ParentGrades from './pages/parent/ParentGrades'
import ParentFees from './pages/parent/ParentFees'
import ParentTimetable from './pages/parent/ParentTimetable'
import ParentExams from './pages/parent/ParentExams'
import ParentMessages from './pages/parent/ParentMessages'
import ParentCirculars from './pages/parent/ParentCirculars'
import ParentRequests from './pages/parent/ParentRequests'
import ParentTransport from './pages/parent/ParentTransport'
import ParentHelpdesk from './pages/parent/ParentHelpdesk'
import ParentBot from './pages/parent/ParentBot'
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import TeacherClassrooms from './pages/teacher/TeacherClassrooms'
import TeacherAttendance from './pages/teacher/TeacherAttendance'
import TeacherAssignments from './pages/teacher/TeacherAssignments'
import TeacherTests from './pages/teacher/TeacherTests'
import TeacherAnnouncements from './pages/teacher/TeacherAnnouncements'
import TeacherCalendar from './pages/teacher/TeacherCalendar'
import TeacherLayout from './pages/teacher/TeacherLayout'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminStudents from './pages/admin/AdminStudents'
import AdminFees from './pages/admin/AdminFees'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminTeachers from './pages/admin/AdminTeachers'
import AdminCirculars from './pages/admin/AdminCirculars'
import AdminLeads from './pages/admin/AdminLeads'
import AdminTimetableGenerator from './pages/admin/AdminTimetableGenerator'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Student Routes */}
              <Route path="/student" element={
                <ProtectedRoute role="student">
                  <StudentLayout />
                </ProtectedRoute>
              }>
                <Route index element={<StudentDashboard />} />
                <Route path="attendance" element={<StudentAttendance />} />
                <Route path="grades" element={<StudentGrades />} />
                <Route path="timetable" element={<StudentTimetable />} />
                <Route path="exams" element={<StudentExams />} />
                <Route path="id-card" element={<StudentIDCard />} />
                <Route path="helpdesk" element={<StudentHelpdesk />} />
                <Route path="ai-insights" element={<StudentAI />} />
                <Route path="tests" element={<StudentTests />} />
                <Route path="textbook" element={<StudentTextbook />} />
                <Route path="study-materials" element={<StudentStudyMaterials />} />
                <Route path="doubt-solver" element={<StudentDoubtSolver />} />
              </Route>

              {/* Parent Routes */}
              <Route path="/parent" element={
                <ProtectedRoute role="parent">
                  <ParentLayout />
                </ProtectedRoute>
              }>
                <Route index element={<ParentDashboard />} />
                <Route path="attendance" element={<ParentAttendance />} />
                <Route path="grades" element={<ParentGrades />} />
                <Route path="fees" element={<ParentFees />} />
                <Route path="timetable" element={<ParentTimetable />} />
                <Route path="exams" element={<ParentExams />} />
                <Route path="messages" element={<ParentMessages />} />
                <Route path="circulars" element={<ParentCirculars />} />
                <Route path="requests" element={<ParentRequests />} />
                <Route path="transport" element={<ParentTransport />} />
                <Route path="helpdesk"  element={<ParentHelpdesk />} />
                <Route path="bot"       element={<ParentBot />} />
              </Route>

              {/* Teacher Routes */}
              <Route path="/teacher" element={
                <ProtectedRoute role="teacher">
                  <TeacherLayout />
                </ProtectedRoute>
              }>
                <Route index element={<TeacherDashboard />} />
                <Route path="classrooms"    element={<TeacherClassrooms />} />
                <Route path="attendance"    element={<TeacherAttendance />} />
                <Route path="assignments"   element={<TeacherAssignments />} />
                <Route path="tests"         element={<TeacherTests />} />
                <Route path="announcements" element={<TeacherAnnouncements />} />
                <Route path="calendar"      element={<TeacherCalendar />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute role="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="students"   element={<AdminStudents />} />
                <Route path="teachers"   element={<AdminTeachers />} />
                <Route path="fees"       element={<AdminFees />} />
                <Route path="analytics"  element={<AdminAnalytics />} />
                <Route path="circulars"  element={<AdminCirculars />} />
                <Route path="leads"      element={<AdminLeads />} />
                <Route path="timetable-generator" element={<AdminTimetableGenerator />} />
              </Route>

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

