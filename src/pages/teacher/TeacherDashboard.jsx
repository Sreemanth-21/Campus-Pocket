import { useAuth } from '../../contexts/AuthContext'
import { mockClassrooms, mockAssignments, mockTests, mockAnnouncements, mockClassroomStudents } from '../../services/teacherMockData'
import { BookOpen, ClipboardList, FileText, Users, Bell, Calendar, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function TeacherDashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const totalStudents = Object.values(mockClassroomStudents).flat().length
  const pendingGrading = mockAssignments.filter(a => a.classroom_id === 'cls-1').length
  const upcomingTests  = mockTests.filter(t => new Date(t.test_date) >= new Date()).length
  const recentAnn      = mockAnnouncements.slice(0, 3)

  const upcomingEvents = [
    ...mockTests.filter(t => new Date(t.test_date) >= new Date()).map(t => ({ ...t, kind: 'test' })),
    ...mockAssignments.filter(a => new Date(a.due_date) >= new Date()).map(a => ({ ...a, kind: 'assignment' })),
  ].sort((a, b) => new Date(a.test_date || a.due_date) - new Date(b.test_date || b.due_date)).slice(0, 4)

  return (
    <div className="space-y-5 fade-in max-w-5xl">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 p-6 text-white">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)', transform: 'translate(-20%, 30%)' }} />
        </div>
        <p className="text-white/70 text-[13px]">{greeting} 👋</p>
        <h2 className="text-[24px] font-bold mt-0.5">{profile?.name || 'Teacher'}</h2>
        <p className="text-white/60 text-[13px] mt-1">{profile?.subject} · Demo School</p>
        <div className="flex gap-2 mt-3 flex-wrap">
          <span className="bg-white/15 text-white text-[12px] px-3 py-1 rounded-full font-medium">{mockClassrooms.length} Classrooms</span>
          <span className="bg-white/15 text-white text-[12px] px-3 py-1 rounded-full font-medium">{totalStudents} Students</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Classrooms',    value: mockClassrooms.length, icon: BookOpen,     color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' },
          { label: 'Students',      value: totalStudents,         icon: Users,        color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' },
          { label: 'Assignments',   value: mockAssignments.length,icon: ClipboardList,color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' },
          { label: 'Upcoming Tests',value: upcomingTests,         icon: FileText,     color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <s.icon size={17} />
            </div>
            <div>
              <p className="text-[11px] text-[#9CA3AF] font-medium">{s.label}</p>
              <p className="text-[22px] font-bold text-[#111827] dark:text-[#F0F0F0]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Classrooms */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[15px] font-bold text-[#111827] dark:text-[#F0F0F0]">My Classrooms</p>
            <button onClick={() => navigate('/teacher/classrooms')} className="text-[12px] text-emerald-600 font-medium hover:underline">View all →</button>
          </div>
          <div className="space-y-2">
            {mockClassrooms.map(cls => (
              <div key={cls.id} onClick={() => navigate('/teacher/classrooms')}
                className="flex items-center justify-between p-3 rounded-xl bg-surface-3 dark:bg-[#1E293B] cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-[13px] font-bold">
                    {cls.section}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#111827] dark:text-[#F0F0F0]">{cls.name}</p>
                    <p className="text-[11px] text-[#9CA3AF]">{mockClassroomStudents[cls.id]?.length || 0} students</p>
                  </div>
                </div>
                <ChevronRight size={15} className="text-[#D1D5DB] group-hover:text-emerald-500 transition-colors" />
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[15px] font-bold text-[#111827] dark:text-[#F0F0F0]">Upcoming</p>
            <button onClick={() => navigate('/teacher/calendar')} className="text-[12px] text-emerald-600 font-medium hover:underline">Calendar →</button>
          </div>
          <div className="space-y-2">
            {upcomingEvents.map(ev => {
              const date = new Date(ev.test_date || ev.due_date)
              const daysLeft = Math.ceil((date - new Date()) / 86400000)
              return (
                <div key={ev.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-3 dark:bg-[#1E293B]">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ev.kind === 'test' ? 'bg-red-500' : 'bg-amber-500'}`} />
                    <div>
                      <p className="text-[13px] font-semibold text-[#111827] dark:text-[#F0F0F0]">{ev.title}</p>
                      <p className="text-[11px] text-[#9CA3AF]">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <span className={daysLeft <= 3 ? 'badge-red' : daysLeft <= 7 ? 'badge-yellow' : 'badge-blue'}>
                    {daysLeft}d
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent announcements */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[15px] font-bold text-[#111827] dark:text-[#F0F0F0] flex items-center gap-2">
            <Bell size={15} className="text-emerald-500" /> Recent Announcements
          </p>
          <button onClick={() => navigate('/teacher/announcements')} className="text-[12px] text-emerald-600 font-medium hover:underline">View all →</button>
        </div>
        <div className="space-y-2">
          {recentAnn.map(a => (
            <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-surface-3 dark:bg-[#1E293B]">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.priority === 'high' ? 'bg-red-500' : a.priority === 'urgent' ? 'bg-red-600' : 'bg-emerald-500'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#111827] dark:text-[#F0F0F0]">{a.title}</p>
                <p className="text-[12px] text-[#6B7280] truncate">{a.message}</p>
              </div>
              <span className="text-[11px] text-[#9CA3AF] flex-shrink-0">{new Date(a.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

