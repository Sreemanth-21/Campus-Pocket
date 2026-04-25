import { useState } from 'react'
import { Users, Plus, X, CheckCircle, Mail, Phone, BookOpen, Search } from 'lucide-react'

const INITIAL_TEACHERS = [
  { id:'t1', name:'Ms. Sarah Williams', subject:'Mathematics', email:'sarah.williams@school.edu', phone:'+1 555 0101', classes:['10A','10B'], status:'active' },
  { id:'t2', name:'Mr. James Davis',    subject:'Science',     email:'james.davis@school.edu',    phone:'+1 555 0102', classes:['9A','9B'],  status:'active' },
  { id:'t3', name:'Ms. Priya Menon',    subject:'English',     email:'priya.menon@school.edu',    phone:'+1 555 0103', classes:['11A'],      status:'active' },
  { id:'t4', name:'Mr. Ravi Kumar',     subject:'History',     email:'ravi.kumar@school.edu',     phone:'+1 555 0104', classes:['10A','11B'],status:'active' },
  { id:'t5', name:'Ms. Anita Sharma',   subject:'Physics',     email:'anita.sharma@school.edu',   phone:'+1 555 0105', classes:['11A','11B'],status:'inactive' },
]

const SUBJECTS = ['Mathematics','Science','English','History','Physics','Chemistry','PE','Art','Computer Science']

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState(INITIAL_TEACHERS)
  const [search, setSearch]     = useState('')
  const [showForm, setShowForm] = useState(false)
  const [success, setSuccess]   = useState(false)
  const [form, setForm]         = useState({ name:'', subject:'', email:'', phone:'' })

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.subject.toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = (e) => {
    e.preventDefault()
    setTeachers(prev => [...prev, { id:`t${Date.now()}`, ...form, classes:[], status:'active' }])
    setForm({ name:'', subject:'', email:'', phone:'' })
    setSuccess(true)
    setTimeout(() => { setSuccess(false); setShowForm(false) }, 1800)
  }

  return (
    <div className="space-y-5 fade-in max-w-5xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-[20px] font-bold text-[#111827] dark:text-[#F0F0F0]">Teachers</h2>
          <p className="text-[13px] text-[#6B7280] mt-0.5">{filtered.length} teachers</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-[13px]">
          <Plus size={14} /> Add Teacher
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="input pl-10 h-10 text-[13px]" placeholder="Search by name or subject..." />
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md slide-up">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[17px] font-bold text-[#111827] dark:text-[#F0F0F0]">Add Teacher</p>
              <button onClick={() => setShowForm(false)} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>
            {success ? (
              <div className="text-center py-6">
                <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
                <p className="font-semibold text-green-600">Teacher added successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleAdd} className="space-y-3">
                {[
                  { label:'Full Name', key:'name', placeholder:'e.g. Ms. Jane Smith', type:'text' },
                  { label:'Email',     key:'email', placeholder:'jane@school.edu',    type:'email' },
                  { label:'Phone',     key:'phone', placeholder:'+1 555 0000',        type:'text' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-[13px] font-semibold text-[#374151] dark:text-[#D1D5DB] mb-1.5">{f.label}</label>
                    <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="input" placeholder={f.placeholder} required />
                  </div>
                ))}
                <div>
                  <label className="block text-[13px] font-semibold text-[#374151] dark:text-[#D1D5DB] mb-1.5">Subject</label>
                  <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="input" required>
                    <option value="">Select subject</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <button type="submit" className="btn-primary w-full mt-2">Add Teacher</button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(t => (
          <div key={t.id} className="card hover:shadow-lg transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5B5FEF] to-[#818CF8] flex items-center justify-center text-white text-[14px] font-bold">
                  {t.name.split(' ').map(n=>n[0]).slice(0,2).join('')}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#111827] dark:text-[#F0F0F0]">{t.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <BookOpen size={11} className="text-[#5B5FEF]" />
                    <p className="text-[12px] text-[#5B5FEF] font-medium">{t.subject}</p>
                  </div>
                </div>
              </div>
              <span className={t.status === 'active' ? 'badge-green' : 'badge-red'}>{t.status}</span>
            </div>

            <div className="space-y-1.5 mt-3 pt-3 border-t border-[#F4F5F7] dark:border-[#1E293B]">
              <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                <Mail size={12} /> {t.email}
              </div>
              <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                <Phone size={12} /> {t.phone}
              </div>
              {t.classes.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  {t.classes.map(c => (
                    <span key={c} className="badge-indigo text-[10px]">{c}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

