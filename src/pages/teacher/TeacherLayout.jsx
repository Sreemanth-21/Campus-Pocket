import { useState, useRef, useEffect } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, ClipboardList, FileText,
  Megaphone, Calendar, CalendarDays, GraduationCap, X, Menu,
  LogOut, Sun, Moon, Bell
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'

const nav = [
  { to: '/teacher',              label: 'Dashboard',    icon: LayoutDashboard, end: true },
  { to: '/teacher/classrooms',   label: 'Classrooms',   icon: BookOpen },
  { to: '/teacher/attendance',   label: 'Attendance',   icon: CalendarDays },
  { to: '/teacher/assignments',  label: 'Assignments',  icon: ClipboardList },
  { to: '/teacher/tests',        label: 'Tests',        icon: FileText },
  { to: '/teacher/announcements',label: 'Announcements',icon: Megaphone },
  { to: '/teacher/calendar',     label: 'Calendar',     icon: Calendar },
]

const titles = {
  '/teacher': 'Dashboard',            '/teacher/classrooms': 'Classrooms',
  '/teacher/attendance': 'Attendance','/teacher/assignments': 'Assignments',
  '/teacher/tests': 'Tests',          '/teacher/announcements': 'Announcements',
  '/teacher/calendar': 'Calendar',
}

export default function TeacherLayout() {
  const [open, setOpen] = useState(false)
  const { dark, toggle } = useTheme()
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const title = titles[location.pathname] || 'Teacher Portal'
  const sidebarRef = useRef(null)
  const hamburgerRef = useRef(null)

  useEffect(() => {
    if (!open) {
      hamburgerRef.current?.focus()
      return
    }
    const sidebar = sidebarRef.current
    if (!sidebar) return
    const focusable = Array.from(sidebar.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'))
    focusable[0]?.focus()
    const handleKeyDown = (e) => {
      if (e.key !== 'Tab' || !focusable.length) return
      const first = focusable[0], last = focusable[focusable.length - 1]
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus() } }
      else { if (document.activeElement === last) { e.preventDefault(); first.focus() } }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const initials = (profile?.name || user?.username || 'T').slice(0, 2).toUpperCase()

  return (
    <div className="flex h-screen overflow-hidden bg-surface-2 dark:bg-[#060912]">
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside ref={sidebarRef}
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[220px] flex flex-col
          bg-surface dark:bg-[#080d18] border-r border-border/50 dark:border-[#1a2235]
          transition-transform duration-300 ease-out
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

        <div className="flex items-center justify-between px-4 h-[60px] border-b border-border/50 dark:border-[#1a2235]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(135deg, #059669, #0D9488)' }}>
              <GraduationCap size={15} className="text-white" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-ink dark:text-[#F1F5F9] tracking-tight">Campus Pocket</p>
              <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide">Teacher</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden btn-ghost p-2.5"><X size={15} /></button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="section-title mt-1">Navigation</p>
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Icon size={15} className="flex-shrink-0" />
              <span className="flex-1">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border/50 dark:border-[#1a2235]">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl
            bg-surface-3 dark:bg-[#0f1929] border border-border/40 dark:border-[#1a2235]">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #059669, #0D9488)' }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-ink dark:text-[#E2E8F0] truncate">{profile?.name || user?.username}</p>
              <p className="text-[10px] text-ink-4 dark:text-[#3d5070]">{profile?.subject || 'Teacher'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-[60px] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30
          bg-surface/90 dark:bg-[#080d18]/90 border-b border-border/50 dark:border-[#1a2235]
          backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button ref={hamburgerRef} onClick={() => setOpen(true)} className="lg:hidden btn-ghost p-2">
              <Menu size={17} />
            </button>
            <div>
              <h1 className="text-[15px] font-bold text-ink dark:text-[#F1F5F9] leading-tight">{title}</h1>
              <p className="text-[10px] text-ink-4 dark:text-[#3d5070] hidden sm:block">
                {new Date().toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={toggle} className="btn-ghost p-2">
              {dark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-ink-3" />}
            </button>
            <button className="btn-ghost p-2 relative">
              <Bell size={16} className="text-ink-3 dark:text-[#64748B]" />
            </button>
            <div className="w-px h-5 bg-border/60 dark:bg-[#1a2235] mx-1" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
                style={{ background: 'linear-gradient(135deg, #059669, #0D9488)' }}>
                {initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-[12px] font-semibold text-ink dark:text-[#E2E8F0] leading-tight">{profile?.name || user?.username}</p>
                <p className="text-[10px] text-ink-4 dark:text-[#3d5070]">Teacher</p>
              </div>
            </div>
            <button onClick={() => { logout(); navigate('/login') }}
              className="btn-ghost p-2 ml-1 hover:text-danger hover:bg-red-50 dark:hover:bg-red-900/20">
              <LogOut size={15} />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-mesh-light dark:bg-mesh-dark"><Outlet /></main>
      </div>
    </div>
  )
}
