import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getHelpdesk, submitHelpdesk } from '../../services/db'
import LoadingSpinner from '../../components/LoadingSpinner'
import { HelpCircle, Plus, X, Send, CheckCircle, Clock, AlertCircle, MessageSquare } from 'lucide-react'

const CATEGORIES = ['Complaint','Feedback','Query']
const STATUS_CONFIG = {
  Resolved:     { badge:'badge-green',  icon:CheckCircle  },
  'In Progress':{ badge:'badge-blue',   icon:Clock        },
  Pending:      { badge:'badge-yellow', icon:Clock        },
  Rejected:     { badge:'badge-red',    icon:AlertCircle  },
}
const CATEGORY_COLORS = {
  Complaint:'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400',
  Feedback: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
  Query:    'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
}

export default function ParentHelpdesk() {
  const { profile } = useAuth()
  const [tickets, setTickets]   = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ subject:'', category:'', description:'' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess]   = useState(false)
  const [expanded, setExpanded] = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!profile?.id) return
    getHelpdesk(profile.id).then(d => { setTickets(d); setLoading(false) })
  }, [profile?.id])

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true)
    try {
      const ticket = await submitHelpdesk(profile.id, form.subject, form.category, form.description)
      setTickets(prev => [ticket, ...prev])
      setForm({ subject:'', category:'', description:'' })
      setSuccess(true)
      setTimeout(() => { setSuccess(false); setShowForm(false) }, 2000)
    } finally { setSubmitting(false) }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6 fade-in max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <HelpCircle size={20} className="text-primary-600" /> Helpdesk
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">Raise concerns, feedback, or queries</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} /> Raise Concern
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Raise a Concern</h3>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            {success ? (
              <div className="text-center py-6">
                <CheckCircle size={44} className="text-green-500 mx-auto mb-3" />
                <p className="font-semibold text-green-600">Concern submitted!</p>
                <p className="text-sm text-gray-400 mt-1">School will respond within 2 business days.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                  <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className="input" required>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Subject</label>
                  <input type="text" value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))}
                    className="input" placeholder="Brief subject" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                  <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                    className="input min-h-28 resize-none" placeholder="Describe your concern..." required />
                </div>
                <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
                  <Send size={14} /> {submitting?'Submitting...':'Submit'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label:'Total',   value:tickets.length,                                    color:'text-gray-700 dark:text-gray-300', bg:'bg-gray-50 dark:bg-gray-800' },
          { label:'Resolved',value:tickets.filter(t=>t.status==='Resolved').length,   color:'text-green-600',  bg:'bg-green-50 dark:bg-green-900/20' },
          { label:'Pending', value:tickets.filter(t=>t.status!=='Resolved').length,   color:'text-yellow-600', bg:'bg-yellow-50 dark:bg-yellow-900/20' },
        ].map(s => (
          <div key={s.label} className={`card text-center ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {tickets.length === 0 ? (
        <div className="card text-center py-12">
          <HelpCircle size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No concerns raised yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => {
            const cfg  = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.Pending
            const Icon = cfg.icon
            const isOpen = expanded === ticket.id
            return (
              <div key={ticket.id} className="card p-0 overflow-hidden">
                <button
                  className="w-full flex items-start justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                  onClick={() => setExpanded(isOpen ? null : ticket.id)}>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MessageSquare size={15} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{ticket.subject}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[ticket.category]||''}`}>{ticket.category}</span>
                        <span className="text-xs text-gray-400">{new Date(ticket.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`${cfg.badge} flex items-center gap-1 flex-shrink-0 ml-2`}>
                    <Icon size={11} /> {ticket.status}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-gray-50 dark:border-gray-800 space-y-3 fade-in">
                    <div className="mt-3">
                      <p className="text-xs text-gray-400 font-medium mb-1">Your Concern</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{ticket.description}</p>
                    </div>
                    {ticket.response ? (
                      <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-xl border-l-4 border-l-green-500">
                        <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">School Response</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{ticket.response}</p>
                      </div>
                    ) : (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl">
                        <p className="text-xs text-yellow-700 dark:text-yellow-400">Awaiting response from school administration.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

