import { useState, useRef, useEffect } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, CalendarDays, BarChart2, CreditCard,
  Clock, FileText, MessageSquare, X, GraduationCap,
  Megaphone, ClipboardList, Bus, HelpCircle, Bot
} from 'lucide-react'
import Topbar from '../../components/Topbar'

const nav = [
  { to:'/parent',            label:'Dashboard',    icon:LayoutDashboard, end:true },
  { to:'/parent/attendance', label:'Attendance',   icon:CalendarDays },
  { to:'/parent/grades',     label:'Grades',       icon:BarChart2 },
  { to:'/parent/fees',       label:'Fees',         icon:CreditCard },
  { to:'/parent/timetable',  label:'Timetable',    icon:Clock },
  { to:'/parent/exams',      label:'Exams',        icon:FileText },
  { to:'/parent/messages',   label:'Messages',     icon:MessageSquare },
  { to:'/parent/circulars',  label:'Circulars',    icon:Megaphone },
  { to:'/parent/requests',   label:'Requests',     icon:ClipboardList },
  { to:'/parent/transport',  label:'Transport',    icon:Bus },
  { to:'/parent/helpdesk',   label:'Helpdesk',     icon:HelpCircle },
  { to:'/parent/bot',        label:'AI Assistant', icon:Bot },
]

const titles = {
  '/parent':'Dashboard', '/parent/attendance':'Attendance',
  '/parent/grades':'Grades', '/parent/fees':'Fees',
  '/parent/timetable':'Timetable', '/parent/exams':'Exams',
  '/parent/messages':'Messages', '/parent/circulars':'Circulars',
  '/parent/requests':'Requests', '/parent/transport':'Transport',
  '/parent/helpdesk':'Helpdesk', '/parent/bot':'AI Assistant',
}

export default function ParentLayout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const title = titles[location.pathname] || 'Parent Portal'
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
              style={{ background: 'linear-gradient(135deg, #059669, #0D9488)' }}>
              <GraduationCap size={15} className="text-white" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-ink dark:text-[#F1F5F9] tracking-tight">Campus Pocket</p>
              <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide">Parent</p>
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
          <div className="px-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/60 dark:border-emerald-900/30">
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Demo School</p>
            <p className="text-[10px] text-ink-4 dark:text-[#3d5070] mt-0.5">Parent Portal</p>
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

