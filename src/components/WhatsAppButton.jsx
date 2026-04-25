/**
 * WhatsAppButton — reusable "Send WhatsApp Alert" button
 *
 * Props:
 *   student      — student object (name, attendance_percentage, class, section)
 *   parentPhone  — E.164 phone string, e.g. "+919876543210"
 *   fees         — array of fee objects (optional)
 *   exams        — array of exam objects (optional)
 *   size         — 'sm' | 'md' (default 'md')
 *   variant      — 'button' | 'icon' (default 'button')
 */
import { useState } from 'react'
import { MessageCircle, Check, Loader2, AlertCircle } from 'lucide-react'
import { sendWhatsAppAlert, buildAlertPayload } from '../services/whatsapp'

// ── Toast component (self-contained, no extra library needed) ─────────────
function Toast({ status, message, onDone }) {
  const cfg = {
    success: {
      bg:   'bg-emerald-500',
      icon: <Check size={14} className="text-white" />,
    },
    error: {
      bg:   'bg-red-500',
      icon: <AlertCircle size={14} className="text-white" />,
    },
  }[status]

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]
        flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl
        text-white text-[13px] font-semibold
        slide-up ${cfg.bg}`}
      style={{ minWidth: 240, maxWidth: 'calc(100vw - 2rem)' }}
    >
      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
        {cfg.icon}
      </div>
      <span className="flex-1">{message}</span>
      <button
        onClick={onDone}
        className="text-white/70 hover:text-white ml-1 text-[16px] leading-none"
      >
        ×
      </button>
    </div>
  )
}

export default function WhatsAppButton({
  student,
  parentPhone,
  fees = [],
  exams = [],
  size = 'md',
  variant = 'button',
}) {
  const [status, setStatus]   = useState('idle') // idle | loading | success | error
  const [toast, setToast]     = useState(null)   // { status, message }

  const showToast = (s, msg) => {
    setToast({ status: s, message: msg })
    setTimeout(() => setToast(null), 4000)
  }

  const handleClick = async (e) => {
    // Stop propagation so clicking the button inside a card-hover doesn't open the modal
    e.stopPropagation()

    if (!parentPhone) {
      showToast('error', 'No phone number on file for this parent')
      return
    }

    setStatus('loading')
    try {
      const { alertType, details } = buildAlertPayload(student, fees, exams)
      await sendWhatsAppAlert({
        parentPhone,
        studentName: student.name,
        alertType,
        details,
      })
      setStatus('success')
      showToast('success', `WhatsApp sent to parent! 📱`)
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      setStatus('error')
      showToast('error', err.message || 'Failed to send WhatsApp')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  // ── Icon-only variant (compact, for use inside cards) ──────────────────
  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={handleClick}
          disabled={status === 'loading'}
          title="Send WhatsApp alert to parent"
          className={`
            flex items-center justify-center rounded-xl transition-all duration-150
            ${size === 'sm' ? 'w-7 h-7' : 'w-8 h-8'}
            ${status === 'success'
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
              : status === 'error'
              ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
              : 'bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366]'}
            disabled:opacity-60 disabled:cursor-not-allowed
          `}
        >
          {status === 'loading'
            ? <Loader2 size={size === 'sm' ? 12 : 14} className="animate-spin" />
            : status === 'success'
            ? <Check size={size === 'sm' ? 12 : 14} />
            : <MessageCircle size={size === 'sm' ? 12 : 14} />}
        </button>
        {toast && (
          <Toast status={toast.status} message={toast.message} onDone={() => setToast(null)} />
        )}
      </>
    )
  }

  // ── Full button variant ────────────────────────────────────────────────
  return (
    <>
      <button
        onClick={handleClick}
        disabled={status === 'loading'}
        className={`
          inline-flex items-center justify-center gap-2 font-semibold rounded-xl
          transition-all duration-150 active:scale-[0.97]
          disabled:opacity-60 disabled:cursor-not-allowed
          ${size === 'sm'
            ? 'text-[11px] px-3 py-1.5'
            : 'text-[13px] px-4 py-2.5'}
          ${status === 'success'
            ? 'bg-emerald-500 text-white'
            : status === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-[#25D366] hover:bg-[#20b858] text-white'}
        `}
        style={
          status === 'idle'
            ? { boxShadow: '0 2px 8px rgba(37,211,102,0.35)' }
            : {}
        }
      >
        {status === 'loading' ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Sending...
          </>
        ) : status === 'success' ? (
          <>
            <Check size={14} />
            Sent!
          </>
        ) : status === 'error' ? (
          <>
            <AlertCircle size={14} />
            Failed
          </>
        ) : (
          <>
            <MessageCircle size={14} />
            Send WhatsApp Alert
          </>
        )}
      </button>

      {toast && (
        <Toast status={toast.status} message={toast.message} onDone={() => setToast(null)} />
      )}
    </>
  )
}
