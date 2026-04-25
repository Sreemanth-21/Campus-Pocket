import { useState } from 'react'
import { useSchoolStore } from '../../store/schoolStore'
import { Megaphone, Plus, X, CheckCircle, Trash2 } from 'lucide-react'

const PRIORITY_BADGE = { low:'badge-blue', normal:'badge-green', high:'badge-yellow', urgent:'badge-red' }

export default function TeacherAnnouncements() {
  const { announcements, addAnnouncement, deleteAnnouncement, classrooms } = useSchoolStore()
  const [showForm, setShowForm] = useState(false)
  const [success, setSuccess]   = useState(false)
  const [form, setForm]         = useState({ title:'', message:'', classroom_id: classrooms[0]?.id || 'cls-1', priority:'normal' })

  const handleAdd = (e) => {
    e.preventDefault()
    addAnnouncement(form)
    setForm({ title:'', message:'', classroom_id: classrooms[0]?.id || 'cls-1', priority:'normal' })
    setSuccess(true)
    setTimeout(() => { setSuccess(false); setShowForm(false) }, 1800)
  }

  const handleDelete = (id) => deleteAnnouncement(id)

  return (
    <div className="space-y-5 fade-in max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-bold text-[#111827] dark:text-[#F0F0F0]">Announcements</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-[13px]"><Plus size={14} /> New Announcement</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-lg slide-up">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[16px] font-bold text-[#111827] dark:text-[#F0F0F0]">New Announcement</p>
              <button onClick={() => setShowForm(false)} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>
            {success ? (
              <div className="text-center py-6"><CheckCircle size={40} className="text-green-500 mx-auto mb-3" /><p className="font-semibold text-green-600">Announcement sent! Students notified.</p></div>
            ) : (
              <form onSubmit={handleAdd} className="space-y-3">
                <div><label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Title *</label><input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} className="input" placeholder="Announcement title" required /></div>
                <div><label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Message *</label><textarea value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))} className="input resize-none min-h-28" placeholder="Write your announcement..." required /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Classroom</label><select value={form.classroom_id} onChange={e=>setForm(p=>({...p,classroom_id:e.target.value}))} className="input">{classrooms.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                  <div><label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Priority</label><select value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value}))} className="input">{['low','normal','high','urgent'].map(p=><option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}</select></div>
                </div>
                <button type="submit" className="btn-primary w-full">Send to Students</button>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {announcements.map(a => {
          const cls = classrooms.find(c => c.id === a.classroom_id)
          return (
            <div key={a.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Megaphone size={16} className="text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-[14px] font-bold text-[#111827] dark:text-[#F0F0F0]">{a.title}</p>
                      <span className={PRIORITY_BADGE[a.priority] || 'badge-blue'}>{a.priority}</span>
                    </div>
                    <p className="text-[13px] text-[#6B7280] leading-relaxed">{a.message}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="badge-indigo text-[10px]">{cls?.name}</span>
                      <span className="text-[11px] text-[#9CA3AF]">{new Date(a.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => handleDelete(a.id)} className="btn-ghost p-1.5 hover:text-red-500 flex-shrink-0"><Trash2 size={14} /></button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


