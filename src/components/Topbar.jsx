import { useState } from 'react'
import { Bell, Sun, Moon, Menu, LogOut } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import NotificationPanel from './NotificationPanel'
import { useNavigate } from 'react-router-dom'

const ROLE_GRADIENT = {
  student: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
  parent:  'linear-gradient(135deg, #059669, #0D9488)',
  teacher: 'linear-gradient(135deg, #059669, #0D9488)',
  admin:   'linear-gradient(135deg, #4F46E5, #7C3AED)',
}

const ROLE_LABEL = {
  student: 'Student Portal',
  parent:  'Parent Portal',
  teacher: 'Teacher Portal',
  admin:   'Admin Portal',
}

export default function Topbar({ onMenuClick, title, hamburgerRef }) {
  const { dark, toggle } = useTheme()
  const { user, logout } = useAuth()
  const { unreadCount }  = useNotifications()
  const [showNotif, setShowNotif] = useState(false)
  const navigate = useNavigate()

  const gradient = ROLE_GRADIENT[user?.role] || ROLE_GRADIENT.student
  const initials  = user?.username?.slice(0, 2).toUpperCase() || 'U'

  return (
    <header className="h-[60px] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30
      bg-surface/90 dark:bg-[#080d18]/90 border-b border-border/50 dark:border-[#1a2235]
      backdrop-blur-xl">

      <div className="flex items-center gap-3">
        <button ref={hamburgerRef} onClick={onMenuClick} className="lg:hidden btn-ghost p-2">
          <Menu size={18} />
        </button>
        <div>
          <h1 className="text-[15px] font-bold text-ink dark:text-[#F1F5F9] leading-tight">{title}</h1>
          <p className="text-[10px] text-ink-4 dark:text-[#3d5070] hidden sm:block">
            {new Date().toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <button onClick={toggle} className="btn-ghost p-2" title={dark ? 'Light mode' : 'Dark mode'}>
          {dark
            ? <Sun size={16} className="text-amber-400" />
            : <Moon size={16} className="text-ink-3" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button onClick={() => setShowNotif(v => !v)} className="btn-ghost p-2 relative">
            <Bell size={16} className="text-ink-3 dark:text-[#64748B]" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-danger rounded-full
                ring-2 ring-surface dark:ring-[#080d18]" />
            )}
          </button>
          {showNotif && <NotificationPanel onClose={() => setShowNotif(false)} />}
        </div>

        <div className="w-px h-5 bg-border/60 dark:bg-[#1a2235] mx-1" />

        {/* User */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
            style={{ background: gradient }}>
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-[12px] font-semibold text-ink dark:text-[#E2E8F0] leading-tight">{user?.username}</p>
            <p className="text-[10px] text-ink-4 dark:text-[#3d5070]">{ROLE_LABEL[user?.role] || user?.role}</p>
          </div>
        </div>

        <button onClick={() => { logout(); navigate('/login') }}
          className="btn-ghost p-2 ml-1 hover:text-danger hover:bg-red-50 dark:hover:bg-red-900/20"
          title="Sign out">
          <LogOut size={15} />
        </button>
      </div>
    </header>
  )
}
