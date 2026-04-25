import { useState } from 'react'
import { UserPlus, Plus, X, CheckCircle, Phone, Mail, Calendar, Search } from 'lucide-react'

const INITIAL_LEADS = [
  { id:'l1', student_name:'Aryan Mehta',   parent_name:'Suresh Mehta',   phone:'+91 98765 00001', email:'suresh@email.com', grade_applying:'9',  status:'new',       created_at:'2024-04-01', notes:'' },
  { id:'l2', student_name:'Divya Nair',    parent_name:'Vijay Nair',     phone:'+91 98765 00002', email:'vijay@email.com',  grade_applying:'10', status:'contacted', created_at:'2024-04-03', notes:'Called, interested' },
  { id:'l3', student_name:'Karan Singh',   parent_name:'Harpreet Singh', phone:'+91 98765 00003', email:'harp@email.com',   grade_applying:'11', status:'enrolled',  created_at:'2024-04-05', notes:'Admission confirmed' },
  { id:'l4', student_name:'Sneha Pillai',  parent_name:'Rajan Pillai',   phone:'+91 98765 00004', email:'rajan@email.com',  grade_applying:'9',  status:'new',       created_at:'2024-04-07', notes:'' },
  { id:'l5', student_name:'Rohan Gupta',   parent_name:'Amit Gupta',     phone:'+91 98765 00005', email:'amit@email.com',   grade_applying:'10', status:'rejected',  created_at:'2024-04-08', notes:'Seats full' },
]

const STATUS_CONFIG = {
  new:       { badge:'badge-blue',   label:'New' },
  contacted: { badge:'badge-yellow', label:'Contacted' },
  enrolled:  { badge:'badge-green',  label:'Enrolled' },
  rejected:  { badge:'badge-red',    label:'Rejected' },
}

export default function AdminLeads() {
  const [leads, setLeads]       = useState(INITIAL_LEADS)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [success, setSuccess]   = useState(false)
  const [form, setForm]         = useState({ student_name:'', parent_name:'', phone:'', email:'', grade_applying:'', notes:'' })

  const filtered = leads.filter(l =>
    (filter === 'All' || l.status === filter) &&
    (l.student_name.toLowerCase().includes(search.toLowerCase()) ||
     l.parent_name.toLowerCase().includes(search.toLowerCase()))
  )

  const handleAdd = (e) => {
    e.preventDefault()
    setLeads(prev => [{ id:`l${Date.now()}`, ...form, status:'new', created_at:new Date().toISOString().split('T')[0] }, ...prev])
    setForm({ student_name:'', parent_name:'', phone:'', email:'', grade_applying:'', notes:'' })
    setSuccess(true)
    setTimeout(() => { setSuccess(false); setShowForm(false) }, 1800)
  }

  const updateStatus = (id, status) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
  }

  const counts = { new:0, contacted:0, enrolled:0, rejected:0 }
  leads.forEach(l => { if (counts[l.status] !== undefined) counts[l.status]++ })

  return (
    <div className="space-y-5 fade-in max-w-5xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-[20px] font-bold text-[#111827] dark:text-[#F0F0F0]">Admissions Leads</h2>
          <p className="text-[13px] text-[#6B7280] mt-0.5">Track prospective student enquiries</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-[13px]">
          <Plus size={14} /> Add Lead
        </button>
      </div>

      {/* Pipeline summary */}
      <div className="grid grid-cols-4 gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} className="card text-center cursor-pointer hover:shadow-md transition-all"
            onClick={() => setFilter(filter === key ? 'All' : key)}>
            <p className="text-[22px] font-bold text-[#111827] dark:text-[#F0F0F0]">{counts[key]}</p>
            <span className={`${cfg.badge} mt-1`}>{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input pl-10 h-10 text-[13px]" placeholder="Search by student or parent name..." />
        </div>
        <div className="flex gap-2">
          {['All','new','contacted','enrolled','rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all capitalize ${filter===f?'bg-[#5B5FEF] text-white':'bg-surface-3 dark:bg-[#1E293B] text-[#6B7280] hover:bg-[#EAEBF0]'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md slide-up">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[17px] font-bold text-[#111827] dark:text-[#F0F0F0]">New Lead</p>
              <button onClick={() => setShowForm(false)} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>
            {success ? (
              <div className="text-center py-6">
                <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
                <p className="font-semibold text-green-600">Lead added!</p>
              </div>
            ) : (
              <form onSubmit={handleAdd} className="space-y-3">
                {[
                  { label:'Student Name', key:'student_name', placeholder:'Full name' },
                  { label:'Parent Name',  key:'parent_name',  placeholder:'Parent/Guardian name' },
                  { label:'Phone',        key:'phone',        placeholder:'+91 98765 00000' },
                  { label:'Email',        key:'email',        placeholder:'parent@email.com' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-[13px] font-semibold text-[#374151] dark:text-[#D1D5DB] mb-1.5">{f.label}</label>
                    <input value={form[f.key]} onChange={e => setForm(p=>({...p,[f.key]:e.target.value}))}
                      className="input" placeholder={f.placeholder} required />
                  </div>
                ))}
                <div>
                  <label className="block text-[13px] font-semibold text-[#374151] dark:text-[#D1D5DB] mb-1.5">Grade Applying For</label>
                  <select value={form.grade_applying} onChange={e => setForm(p=>({...p,grade_applying:e.target.value}))} className="input" required>
                    <option value="">Select grade</option>
                    {['9','10','11','12'].map(g => <option key={g} value={g}>Class {g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#374151] dark:text-[#D1D5DB] mb-1.5">Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(p=>({...p,notes:e.target.value}))}
                    className="input min-h-16 resize-none text-[13px]" placeholder="Any additional notes..." />
                </div>
                <button type="submit" className="btn-primary w-full">Add Lead</button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border dark:border-[#1E293B] bg-[#F9FAFB] dark:bg-[#1E1E1E]">
                {['Student','Parent','Contact','Grade','Date','Status','Action'].map(h => (
                  <th key={h} className="text-left px-2 sm:px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => (
                <tr key={lead.id} className="border-b border-[#F4F5F7] dark:border-[#1E293B] hover:bg-[#F9FAFB] dark:hover:bg-[#1E1E1E] transition-colors">
                  <td className="px-2 sm:px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#5B5FEF] flex items-center justify-center text-white text-[11px] font-bold">{lead.student_name[0]}</div>
                      <p className="text-[13px] font-semibold text-[#111827] dark:text-[#F0F0F0]">{lead.student_name}</p>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-[13px] text-[#6B7280]">{lead.parent_name}</td>
                  <td className="px-2 sm:px-4 py-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-[11px] text-[#9CA3AF]"><Phone size={10} />{lead.phone}</div>
                      <div className="flex items-center gap-1 text-[11px] text-[#9CA3AF]"><Mail size={10} />{lead.email}</div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-3"><span className="badge-indigo">Class {lead.grade_applying}</span></td>
                  <td className="px-2 sm:px-4 py-3 text-[12px] text-[#9CA3AF]">{lead.created_at}</td>
                  <td className="px-2 sm:px-4 py-3"><span className={STATUS_CONFIG[lead.status]?.badge}>{STATUS_CONFIG[lead.status]?.label}</span></td>
                  <td className="px-2 sm:px-4 py-3">
                    <select value={lead.status} onChange={e => updateStatus(lead.id, e.target.value)}
                      className="text-[12px] bg-surface-3 dark:bg-[#1E293B] border-0 rounded-lg px-2 py-1 text-[#374151] dark:text-[#D1D5DB] cursor-pointer outline-none">
                      {Object.entries(STATUS_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-10">
            <UserPlus size={32} className="text-[#D1D5DB] mx-auto mb-2" />
            <p className="text-[13px] text-[#9CA3AF]">No leads found</p>
          </div>
        )}
      </div>
    </div>
  )
}

