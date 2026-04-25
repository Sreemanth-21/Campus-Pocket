/**
 * WhatsApp notification service
 * Calls the Supabase Edge Function `whatsapp-notify`
 * which uses Gemini to generate the message and Twilio to send it.
 */
import { supabase } from './supabase'

/**
 * Send a WhatsApp alert to a parent.
 *
 * @param {object} params
 * @param {string} params.parentPhone  - E.164 format, e.g. "+919876543210"
 * @param {string} params.studentName  - Student's full name
 * @param {'attendance'|'fee'|'exam'} params.alertType
 * @param {object} params.details      - Context for Gemini, e.g. { percentage: 68 }
 * @returns {Promise<{ success: boolean, sid?: string, message?: string }>}
 */
export async function sendWhatsAppAlert({ parentPhone, studentName, alertType, details = {} }) {
  const { data, error } = await supabase.functions.invoke('whatsapp-notify', {
    body: {
      parent_phone: parentPhone,
      student_name: studentName,
      alert_type:   alertType,
      details,
    },
  })

  if (error) throw new Error(error.message || 'Failed to send WhatsApp alert')
  if (!data?.success) throw new Error(data?.error || 'WhatsApp send failed')

  return data
}

/**
 * Build the right alert_type and details from a student's current data.
 * Priority: overdue fee → low attendance → pending fee → upcoming exam → attendance update
 */
export function buildAlertPayload(student, fees = [], exams = []) {
  // Overdue fee — highest urgency
  const overdue = fees.find(f => f.status === 'OVERDUE')
  if (overdue) {
    return {
      alertType: 'fee',
      details: { term: overdue.term, amount: overdue.amount, status: 'OVERDUE' },
    }
  }

  // Low attendance
  if (student.attendance_percentage < 75) {
    return {
      alertType: 'attendance',
      details: { percentage: student.attendance_percentage, class: `${student.class}${student.section}` },
    }
  }

  // Pending fee
  const pending = fees.find(f => f.status === 'PENDING')
  if (pending) {
    return {
      alertType: 'fee',
      details: { term: pending.term, amount: pending.amount, status: 'PENDING' },
    }
  }

  // Upcoming exam within 7 days
  const upcoming = exams
    .filter(e => !e.score && new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0]
  if (upcoming) {
    const daysLeft = Math.ceil((new Date(upcoming.date) - new Date()) / 86400000)
    return {
      alertType: 'exam',
      details: {
        subject: upcoming.subject,
        date: new Date(upcoming.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
        daysLeft,
      },
    }
  }

  // Default — general attendance update
  return {
    alertType: 'attendance',
    details: { percentage: student.attendance_percentage, class: `${student.class}${student.section}` },
  }
}
