/**
 * useClassroom — React hook for teacher classroom management
 *
 * Usage:
 *   const { classrooms, createClassroom, loading } = useClassroom(teacherId)
 */
import { useState, useEffect, useCallback } from 'react'
import {
  getClassrooms,
  createClassroom as apiCreateClassroom,
  getClassroomStudents,
  getAssignments,
  createAssignment as apiCreateAssignment,
  getTests,
  createTest as apiCreateTest,
  getAnnouncements,
  shareAnnouncement as apiShareAnnouncement,
  getCalendarEvents,
  createCalendarEvent as apiCreateCalendarEvent,
  listenClassroomAssignments,
  listenAnnouncements,
} from '../services/teacherApi'

export function useClassroom(teacherId) {
  const [classrooms, setClassrooms] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  useEffect(() => {
    if (!teacherId) { setLoading(false); return }
    getClassrooms(teacherId).then(({ data, error }) => {
      if (error) setError(error.message)
      else setClassrooms(data || [])
      setLoading(false)
    })
  }, [teacherId])

  const createClassroom = useCallback(async (classroomData) => {
    const { data, error } = await apiCreateClassroom(teacherId, classroomData)
    if (!error && data) setClassrooms(prev => [data, ...prev])
    return { data, error }
  }, [teacherId])

  return { classrooms, loading, error, createClassroom, setClassrooms }
}

export function useClassroomDetail(classroomId) {
  const [students, setStudents]         = useState([])
  const [assignments, setAssignments]   = useState([])
  const [tests, setTests]               = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [events, setEvents]             = useState([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    if (!classroomId) return
    setLoading(true)

    Promise.all([
      getClassroomStudents(classroomId),
      getAssignments(classroomId),
      getTests(classroomId),
      getAnnouncements(classroomId),
      getCalendarEvents(classroomId),
    ]).then(([s, a, t, ann, ev]) => {
      setStudents(s.data || [])
      setAssignments(a.data || [])
      setTests(t.data || [])
      setAnnouncements(ann.data || [])
      setEvents(ev.data || [])
      setLoading(false)
    })

    // Real-time: new assignments
    const assignSub = listenClassroomAssignments(classroomId, (newAssign) => {
      setAssignments(prev => [newAssign, ...prev])
    })

    // Real-time: new announcements
    const annSub = listenAnnouncements(classroomId, (newAnn) => {
      setAnnouncements(prev => [newAnn, ...prev])
    })

    return () => {
      assignSub.unsubscribe()
      annSub.unsubscribe()
    }
  }, [classroomId])

  const createAssignment = useCallback(async (data) => {
    const result = await apiCreateAssignment(classroomId, data)
    if (!result.error && result.data) setAssignments(prev => [result.data, ...prev])
    return result
  }, [classroomId])

  const createTest = useCallback(async (data) => {
    const result = await apiCreateTest(classroomId, data)
    if (!result.error && result.data) setTests(prev => [...prev, result.data])
    return result
  }, [classroomId])

  const shareAnnouncement = useCallback(async (data) => {
    const result = await apiShareAnnouncement(classroomId, data)
    if (!result.error && result.data) setAnnouncements(prev => [result.data, ...prev])
    return result
  }, [classroomId])

  const createEvent = useCallback(async (data, notify = true) => {
    const result = await apiCreateCalendarEvent(classroomId, data, notify)
    if (!result.error && result.data) setEvents(prev => [...prev, result.data])
    return result
  }, [classroomId])

  return {
    students, assignments, tests, announcements, events, loading,
    createAssignment, createTest, shareAnnouncement, createEvent,
    setStudents, setAssignments, setTests, setAnnouncements, setEvents,
  }
}

