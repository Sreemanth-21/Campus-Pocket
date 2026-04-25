/**
 * useNotifications — React hook for real-time notifications
 *
 * Usage (student or teacher):
 *   const { notifications, unreadCount, markRead, markAllRead } = useNotifications(userId)
 */
import { useState, useEffect, useCallback } from 'react'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  listenNotifications,
} from '../services/teacherApi'

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]             = useState(true)

  // Initial fetch
  useEffect(() => {
    if (!userId) { setLoading(false); return }

    getNotifications(userId).then(({ data }) => {
      setNotifications(data || [])
      setLoading(false)
    })

    // Real-time subscription
    const channel = listenNotifications(userId, (newNotif) => {
      setNotifications(prev => [newNotif, ...prev])
      // Browser notification (if permission granted)
      if (Notification.permission === 'granted') {
        new Notification(newNotif.title, { body: newNotif.message })
      }
    })

    return () => { channel.unsubscribe() }
  }, [userId])

  const unreadCount = notifications.filter(n => !n.is_read).length

  const markRead = useCallback(async (id) => {
    await markNotificationRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }, [])

  const markAllRead = useCallback(async () => {
    if (!userId) return
    await markAllNotificationsRead(userId)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }, [userId])

  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }, [])

  return { notifications, unreadCount, loading, markRead, markAllRead, requestPermission }
}

