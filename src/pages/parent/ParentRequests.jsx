import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getRequests, submitRequest, getChildrenOfParent } from '../../services/db'
import LoadingSpinner from '../../components/LoadingSpinner'
import { ClipboardList, Plus, X, CheckCircle, Clock, XCircle, Send } from 'lucide-react'

const REQUEST_TYPES = ['IT Form Request','Bonafide Request','TC Request']
const STATUS_CONFIG = {
  Approved:     { badge:'badge-green',  icon:CheckCircle },
  Pending:      { badge:'badge-yellow', icon:Clock       },
  Rejected:     { badge:'badge-red',    icon:XCircle     },
  'In Progress':{ badge:'badge-blue',   icon:Clock       },
}

export default function ParentRequests() {
  const { profile } = useAuth()
  const [requests, setRequests]   = useState([])
  const [children, setChildren]   = useState([])
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState({ type:'', student_id:'', reason:'' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess]     = useState(false)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    if (!profile?.id) return
    Promise.all([
      getRequests(profile.id),
      getChildrenOfParent(profile.id),
    ]).then(([reqs, kids]) => {
      setRequests(reqs); setChildren(kids); setLoading(false)
    })
  }, [profile?.id])

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true)
    try {
      const req = await submitRequest(profile.id, form.student_id, form.type, form.reason)
      const student = children.find(c => c.id === form.student_id)
      setRequests(prev => [{ ...req, student_name: student?.name }, ...prev])
      setForm({ type:'', student_id:'', reason:'' })
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
            <ClipboardList size={20} className="text-primary-600" /> Requests
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">Submit and track official document requests</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} /> New Request
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">New Request</h3>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            {success ? (
              <div className="text-center py-6">
                <CheckCircle size={44} className="text-green-500 mx-auto mb-3" />
                <p className="font-semibold text-green-600">Request submitted!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Request Type</label>
                  <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} className="input" required>
                    <option value="">Select type</option>
                    {REQUEST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">For Student</label>
                  <select value={form.student_id} onChange={e=>setForm(f=>({...f,student_id:e.target.value}))} className="input" required>
                    <option value="">Select student</option>
                    {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Reason</label>
                  <textarea value={form.reason} onChange={e=>setForm(f=>({...f,reason:e.target.value}))}
                    className="input min-h-24 resize-none" placeholder="Briefly explain the reason..." required />
                </div>
                <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
                  <Send size={14} /> {submitting?'Submitting...':'Submit Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="card text-center py-12">
          <ClipboardList size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No requests submitted yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => {
            const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.Pending
            const Icon = cfg.icon
            return (
              <div key={req.id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <ClipboardList size={16} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{req.type}</p>
                      <p className="text-xs text-gray-400 mt-0.5">For: {req.student_name} • {new Date(req.created_at).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5">{req.reason}</p>
                    </div>
                  </div>
                  <span className={`${cfg.badge} flex-shrink-0 flex items-center gap-1`}>
                    <Icon size={11} /> {req.status}
                  </span>
                </div>
                {req.response && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-xl border-l-4 border-l-green-500">
                    <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">School Response</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{req.response}</p>
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

