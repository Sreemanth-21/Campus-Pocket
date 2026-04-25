import { createContext, useContext } from 'react'
import { useAuth } from './AuthContext'
import { useSchoolStore } from '../store/schoolStore'

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const { notifications, markNotificationRead, markAllNotificationsRead } = useSchoolStore()

  // Filter notifications relevant to this user
  // For students: match by student_id or global (no student_id)
  // For parents/admin: show all
  const userNotifications = notifications.filter(n => {
    if (!user) return false
    if (user.role === 'student') {
      // Find student profile id from store
      const students = useSchoolStore.getState().students
      const student  = students.find(s => s.user_id === user.id)
      return !n.student_id || n.student_id === student?.id
    }
    return true
  })

  const unreadCount = userNotifications.filter(n => !n.read).length

  const markRead = (id) => markNotificationRead(id)
  const markAllRead = () => markAllNotificationsRead()
  const addNotification = (notif) => {
    useSchoolStore.setState(s => ({
      notifications: [{ ...notif, id: Date.now().toString(), read: false, created_at: new Date().toISOString() }, ...s.notifications]
    }))
  }

  return (
    <NotificationContext.Provider value={{
      notifications: userNotifications,
      unreadCount,
      markRead,
      markAllRead,
      addNotification,
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
