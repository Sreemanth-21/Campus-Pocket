import { useState } from 'react'
import { useSchoolStore } from '../../store/schoolStore'
import { FileText, Plus, X, CheckCircle, Calendar, Clock } from 'lucide-react'

export default function TeacherTests() {
  const { tests, addTest, classrooms } = useSchoolStore()
  const [showForm, setShowForm] = useState(false)
  const [success, setSuccess]   = useState(false)
  const [form, setForm]         = useState({ title:'', description:'', classroom_id: classrooms[0]?.id || 'cls-1', test_date:'', duration_min:60, max_score:100 })

  const handleAdd = (e) => {
    e.preventDefault()
    addTest(form)
    setForm({ title:'', description:'', classroom_id: classrooms[0]?.id || 'cls-1', test_date:'', duration_min:60, max_score:100 })
    setSuccess(true)
    setTimeout(() => { setSuccess(false); setShowForm(false) }, 1800)
  }

  const upcoming = tests.filter(t => new Date(t.test_date) >= new Date())
  const past     = tests.filter(t => new Date(t.test_date) < new Date())

  return (
    <div className="space-y-5 fade-in max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-bold text-[#111827] dark:text-[#F0F0F0]">Tests</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-[13px]"><Plus size={14} /> Schedule Test</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-lg slide-up">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[16px] font-bold text-[#111827] dark:text-[#F0F0F0]">Schedule Test</p>
              <button onClick={() => setShowForm(false)} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>
            {success ? (
              <div className="text-center py-6"><CheckCircle size={40} className="text-green-500 mx-auto mb-3" /><p className="font-semibold text-green-600">Test scheduled! Students notified.</p></div>
            ) : (
              <form onSubmit={handleAdd} className="space-y-3">
                <div><label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Title *</label><input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} className="input" placeholder="Test title" required /></div>
                <div><label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Description</label><textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} className="input resize-none min-h-16" placeholder="Topics covered..." /></div>
                <div><label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Classroom</label><select value={form.classroom_id} onChange={e=>setForm(p=>({...p,classroom_id:e.target.value}))} className="input">{classrooms.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Test Date & Time</label><input type="datetime-local" value={form.test_date} onChange={e=>setForm(p=>({...p,test_date:e.target.value}))} className="input" required /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Duration (min)</label><input type="number" value={form.duration_min} onChange={e=>setForm(p=>({...p,duration_min:e.target.value}))} className="input" /></div>
                  <div><label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Max Score</label><input type="number" value={form.max_score} onChange={e=>setForm(p=>({...p,max_score:e.target.value}))} className="input" /></div>
                </div>
                <button type="submit" className="btn-primary w-full">Schedule & Notify Students</button>
              </form>
            )}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <p className="text-[13px] font-bold text-[#6B7280] uppercase tracking-wider mb-3">Upcoming</p>
          <div className="space-y-3">
            {upcoming.map(t => {
              const cls = classrooms.find(c => c.id === t.classroom_id)
              const daysLeft = Math.ceil((new Date(t.test_date) - new Date()) / 86400000)
              return (
                <div key={t.id} className="card border-l-4 border-l-amber-500">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText size={16} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-[#111827] dark:text-[#F0F0F0]">{t.title}</p>
                        <p className="text-[12px] text-[#6B7280] mt-0.5">{t.description}</p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <span className="badge-indigo text-[10px]">{cls?.name}</span>
                          <span className="badge-blue text-[10px] flex items-center gap-1"><Clock size={9} /> {t.duration_min} min</span>
                          <span className="badge-blue text-[10px]">Max: {t.max_score}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={daysLeft <= 3 ? 'badge-red' : daysLeft <= 7 ? 'badge-yellow' : 'badge-green'}>{daysLeft}d left</span>
                      <p className="text-[11px] text-[#9CA3AF] mt-1">{new Date(t.test_date).toLocaleDateString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <p className="text-[13px] font-bold text-[#6B7280] uppercase tracking-wider mb-3">Past Tests</p>
          <div className="space-y-2">
            {past.map(t => {
              const cls = classrooms.find(c => c.id === t.classroom_id)
              return (
                <div key={t.id} className="card opacity-70">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-surface-3 dark:bg-[#1E293B] rounded-xl flex items-center justify-center"><FileText size={14} className="text-[#9CA3AF]" /></div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#111827] dark:text-[#F0F0F0]">{t.title}</p>
                        <p className="text-[11px] text-[#9CA3AF]">{cls?.name} · {new Date(t.test_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className="badge-blue text-[10px]">Completed</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}


