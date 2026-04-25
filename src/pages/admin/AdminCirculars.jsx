import { useState } from 'react'
import { demoCirculars } from '../../services/mockData'
import { Megaphone, Plus, X, CheckCircle, Calendar, Paperclip, Trash2, Eye } from 'lucide-react'

export default function AdminCirculars() {
  const [circulars, setCirculars] = useState(
    demoCirculars.map(c => ({ ...c, id: c.id, created_at: c.date }))
  )
  const [showForm, setShowForm] = useState(false)
  const [success, setSuccess]   = useState(false)
  const [expanded, setExpanded] = useState(null)
  const [form, setForm]         = useState({ title:'', description:'', audience:'All', priority:'Normal' })

  const handleAdd = (e) => {
    e.preventDefault()
    setCirculars(prev => [{
      id: `c${Date.now()}`,
      title: form.title,
      description: form.description,
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString().split('T')[0],
      file: false,
      audience: form.audience,
      priority: form.priority,
    }, ...prev])
    setForm({ title:'', description:'', audience:'All', priority:'Normal' })
    setSuccess(true)
    setTimeout(() => { setSuccess(false); setShowForm(false) }, 1800)
  }

  const handleDelete = (id) => setCirculars(prev => prev.filter(c => c.id !== id))

  const PRIORITY_BADGE = { Normal:'badge-blue', Important:'badge-yellow', Urgent:'badge-red' }

  return (
    <div className="space-y-5 fade-in max-w-4xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-bold text-[#111827] dark:text-[#F0F0F0]">Circulars</h2>
          <p className="text-[13px] text-[#6B7280] mt-0.5">Publish announcements to students and parents</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-[13px]">
          <Plus size={14} /> New Circular
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-lg slide-up">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[17px] font-bold text-[#111827] dark:text-[#F0F0F0]">New Circular</p>
              <button onClick={() => setShowForm(false)} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>
            {success ? (
              <div className="text-center py-6">
                <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
                <p className="font-semibold text-green-600">Circular published!</p>
              </div>
            ) : (
              <form onSubmit={handleAdd} className="space-y-3">
                <div>
                  <label className="block text-[13px] font-semibold text-[#374151] dark:text-[#D1D5DB] mb-1.5">Title</label>
                  <input value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))}
                    className="input" placeholder="Circular title" required />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#374151] dark:text-[#D1D5DB] mb-1.5">Description</label>
                  <textarea value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))}
                    className="input min-h-28 resize-none" placeholder="Write the circular content..." required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#374151] dark:text-[#D1D5DB] mb-1.5">Audience</label>
                    <select value={form.audience} onChange={e => setForm(p=>({...p,audience:e.target.value}))} className="input">
                      {['All','Students Only','Parents Only','Teachers Only'].map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-[#374151] dark:text-[#D1D5DB] mb-1.5">Priority</label>
                    <select value={form.priority} onChange={e => setForm(p=>({...p,priority:e.target.value}))} className="input">
                      {['Normal','Important','Urgent'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer btn-secondary text-[13px] py-2">
                    <Paperclip size={13} /> Attach File
                    <input type="file" className="hidden" />
                  </label>
                </div>
                <button type="submit" className="btn-primary w-full">Publish Circular</button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {circulars.map(c => (
          <div key={c.id} className="card">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 bg-[#EEF2FF] dark:bg-[#5B5FEF]/15 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Megaphone size={16} className="text-[#5B5FEF]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-[14px] font-bold text-[#111827] dark:text-[#F0F0F0]">{c.title}</p>
                    {c.priority && c.priority !== 'Normal' && (
                      <span className={PRIORITY_BADGE[c.priority] || 'badge-blue'}>{c.priority}</span>
                    )}
                    {c.file && <span className="badge-purple flex items-center gap-1"><Paperclip size={9} /> Attachment</span>}
                  </div>
                  <p className="text-[12px] text-[#9CA3AF] flex items-center gap-1 mb-2">
                    <Calendar size={11} />
                    {new Date(c.date || c.created_at).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}
                    {c.audience && <span className="ml-2 badge-indigo text-[10px]">{c.audience}</span>}
                  </p>
                  {expanded === c.id && (
                    <p className="text-[13px] text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed mt-2 fade-in">
                      {c.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                  className="btn-ghost p-1.5" title="View">
                  <Eye size={14} className="text-[#6B7280]" />
                </button>
                <button onClick={() => handleDelete(c.id)}
                  className="btn-ghost p-1.5 hover:text-red-500" title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

