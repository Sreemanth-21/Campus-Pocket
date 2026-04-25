import { Bell, X, CheckCheck, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useNotifications } from '../contexts/NotificationContext'

const SEV_CONFIG = {
  critical: {
    border: 'border-l-danger',
    bg: 'bg-red-50/60 dark:bg-red-950/20',
    icon: AlertCircle,
    iconColor: 'text-danger',
  },
  warning: {
    border: 'border-l-warning',
    bg: 'bg-amber-50/60 dark:bg-amber-950/20',
    icon: AlertTriangle,
    iconColor: 'text-warning',
  },
  info: {
    border: 'border-l-brand-500',
    bg: 'bg-brand-50/60 dark:bg-brand-950/20',
    icon: Info,
    iconColor: 'text-brand-500',
  },
}

export default function NotificationPanel({ onClose }) {
  const { notifications, markRead, markAllRead } = useNotifications()
  const unread = notifications.filter(n => !n.read).length

  return (
    <div className="absolute right-0 max-w-[calc(100vw-2rem)] top-12 w-80
      bg-surface dark:bg-[#0D1117] rounded-2xl
      border border-border/60 dark:border-[#1a2235]
      shadow-xl dark:shadow-[0_16px_48px_rgba(0,0,0,0.4)]
      z-50 scale-in overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/50 dark:border-[#1a2235]">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-brand-500" />
          <p className="text-[13px] font-bold text-ink dark:text-[#F1F5F9]">Notifications</p>
          {unread > 0 && (
            <span className="w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center text-white text-[9px] font-bold">
              {unread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={markAllRead}
            className="flex items-center gap-1 text-[11px] text-brand-600 dark:text-brand-400
              hover:text-brand-700 dark:hover:text-brand-300 font-semibold transition-colors px-2 py-1 rounded-lg
              hover:bg-brand-50 dark:hover:bg-brand-950/30">
            <CheckCheck size={11} /> Mark all read
          </button>
          <button onClick={onClose} className="btn-ghost p-1.5 w-7 h-7 min-w-0 min-h-0">
            <X size={13} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-72 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <div className="w-10 h-10 rounded-2xl bg-surface-3 dark:bg-[#0f1929] flex items-center justify-center">
              <Bell size={16} className="text-ink-4 dark:text-[#3d5070]" />
            </div>
            <p className="text-[13px] text-ink-4 dark:text-[#3d5070] font-medium">All caught up</p>
          </div>
        ) : notifications.map(n => {
          const cfg = SEV_CONFIG[n.severity] || SEV_CONFIG.info
          const Icon = cfg.icon
          return (
            <div key={n.id} onClick={() => markRead(n.id)}
              className={`border-l-4 px-4 py-3 cursor-pointer transition-colors
                hover:bg-surface-3/60 dark:hover:bg-[#0f1929]
                ${cfg.border} ${cfg.bg} ${n.read ? 'opacity-40' : ''}`}>
              <div className="flex items-start gap-2.5">
                <Icon size={13} className={`${cfg.iconColor} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-ink dark:text-[#E2E8F0] font-medium leading-relaxed">{n.message}</p>
                  {!n.read && (
                    <span className="text-[10px] text-brand-600 dark:text-brand-400 font-bold mt-0.5 block tracking-wide">NEW</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
