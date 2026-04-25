import { useState } from 'react'
import { Send, CheckCircle } from 'lucide-react'

const CATEGORIES = ['Academic', 'Technical', 'Fee Related', 'Attendance', 'Other']

export default function StudentHelpdesk() {
  const [form, setForm] = useState({ category: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 fade-in">
        <div className="card text-center max-w-sm w-full">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Request Submitted!</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            Your helpdesk request has been submitted. We'll get back to you within 24 hours.
          </p>
          <button onClick={() => { setSubmitted(false); setForm({ category: '', subject: '', message: '' }) }}
            className="btn-primary mt-4 w-full">
            Submit Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 fade-in max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Helpdesk Request</h2>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="input"
              required
            >
              <option value="">Select a category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Subject</label>
            <input
              type="text"
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              className="input"
              placeholder="Brief description of your issue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Message</label>
            <textarea
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              className="input min-h-32 resize-none"
              placeholder="Describe your issue in detail..."
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 disabled:opacity-60">
            <Send size={16} />
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>

      {/* Previous tickets */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Previous Requests</h3>
        <div className="space-y-2">
          {[
            { id: '#001', subject: 'Grade correction for Math test', status: 'Resolved', date: '2024-03-10' },
            { id: '#002', subject: 'Login issue with portal', status: 'In Progress', date: '2024-03-18' },
          ].map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t.subject}</p>
                <p className="text-xs text-gray-400">{t.id} • {t.date}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                ${t.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {t.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

