import { useState, useRef, useEffect } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, CalendarDays, BarChart2, BookOpen,
  Clock, FileText, CreditCard, HelpCircle, Sparkles,
  X, GraduationCap, ClipboardList, MessageCircle, BookMarked
} from 'lucide-react'
import Topbar from '../../components/Topbar'

const nav = [
  { to:'/student',                 label:'Dashboard',      icon:LayoutDashboard, end:true },
  { to:'/student/attendance',      label:'Attendance',     icon:CalendarDays },
  { to:'/student/grades',          label:'Grades',         icon:BarChart2 },
  { to:'/student/timetable',       label:'Timetable',      icon:Clock },
  { to:'/student/exams',           label:'Exams',          icon:FileText },
  { to:'/student/tests',           label:'Online Tests',   icon:ClipboardList },
  { to:'/student/textbook',        label:'Textbook',       icon:BookMarked },
  { to:'/student/study-materials', label:'Study Materials',icon:Sparkles },
  { to:'/student/doubt-solver',    label:'Doubt Solver',   icon:MessageCircle },
  { to:'/student/id-card',         label:'ID Card',        icon:CreditCard },
  { to:'/student/helpdesk',        label:'Helpdesk',       icon:HelpCircle },
  { to:'/student/ai-insights',     label:'AI Insights',    icon:BookOpen },
]

const titles = {
  '/student':'Dashboard', '/student/attendance':'Attendance',
  '/student/grades':'Grades', '/student/timetable':'Timetable',
  '/student/exams':'Exams', '/student/tests':'Online Tests',
  '/student/textbook':'Textbook', '/student/study-materials':'Study Materials',
  '/student/doubt-solver':'Doubt Solver', '/student/id-card':'ID Card',
  '/student/helpdesk':'Helpdesk', '/student/ai-insights':'AI Insights',
}

export default function StudentLayout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const title = titles[location.pathname] || 'Student Portal'
  const sidebarRef = useRef(null)
  const hamburgerRef = useRef(null)

  // Focus trap: trap focus inside sidebar when open, restore to hamburger on close
  useEffect(() => {
    if (!open) {
      if (hamburgerRef.current) {
        hamburgerRef.current.focus()
      }
      return
    }

    const sidebar = sidebarRef.current
    if (!sidebar) return

    const focusableSelectors = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    const focusableElements = Array.from(sidebar.querySelectorAll(focusableSelectors))

    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return
      if (focusableElements.length === 0) return

      const first = focusableElements[0]
      const last = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  return (
    <div className="flex h-screen overflow-hidden bg-surface-2 dark:bg-[#060912]">
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setOpen(false)} />
      )}

      <aside ref={sidebarRef}
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[220px] flex flex-col
          bg-surface dark:bg-[#080d18] border-r border-border/50 dark:border-[#1a2235]
          transition-transform duration-300 ease-out
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

        <div className="flex items-center justify-between px-4 h-[60px] border-b border-border/50 dark:border-[#1a2235]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
              <GraduationCap size={15} className="text-white" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-ink dark:text-[#F1F5F9] tracking-tight">Campus Pocket</p>
              <p className="text-[10px] font-semibold text-brand-500 dark:text-brand-400 tracking-wide">Student</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden btn-ghost p-2.5"><X size={15} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
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
          <div className="px-3 py-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/30 border border-brand-100/60 dark:border-brand-900/30">
            <p className="text-[11px] font-semibold text-brand-600 dark:text-brand-400">Demo School</p>
            <p className="text-[10px] text-ink-4 dark:text-[#3d5070] mt-0.5">Class 10 · Student Portal</p>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar onMenuClick={() => setOpen(true)} title={title} hamburgerRef={hamburgerRef} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-mesh-light dark:bg-mesh-dark"><Outlet /></main>
      </div>
    </div>
  )
}

