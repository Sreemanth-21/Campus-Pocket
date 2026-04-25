import { useState } from 'react'
import { demoStudents, demoFees } from '../../services/mockData'
import { CreditCard, AlertTriangle, CheckCircle, Clock, Search } from 'lucide-react'

export default function AdminFees() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const enriched = demoStudents.map(s => {
    const fees = demoFees.filter(f => f.student_id === s.id)
    const hasOverdue = fees.some(f => f.status === 'OVERDUE')
    const hasPending = fees.some(f => f.status === 'PENDING')
    const status = hasOverdue ? 'OVERDUE' : hasPending ? 'PENDING' : 'PAID'
    const totalDue = fees.filter(f => f.status !== 'PAID').reduce((s,f) => s+f.amount, 0)
    const totalPaid = fees.filter(f => f.status === 'PAID').reduce((s,f) => s+f.amount, 0)
    return { ...s, fees, status, totalDue, totalPaid }
  }).filter(s =>
    (filter === 'All' || s.status === filter) &&
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  const totalRevenue = demoFees.filter(f=>f.status==='PAID').reduce((s,f)=>s+f.amount,0)
  const totalOverdue = demoFees.filter(f=>f.status==='OVERDUE').reduce((s,f)=>s+f.amount,0)
  const totalPending = demoFees.filter(f=>f.status==='PENDING').reduce((s,f)=>s+f.amount,0)

  const BADGE = { PAID:'badge-green', PENDING:'badge-yellow', OVERDUE:'badge-red' }

  return (
    <div className="space-y-5 fade-in max-w-5xl">
      <h2 className="text-[20px] font-bold text-[#111827] dark:text-[#F0F0F0]">Fee Management</h2>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label:'Collected',  value:`₹${(totalRevenue/1000).toFixed(0)}K`, icon:CheckCircle, color:'bg-green-50 dark:bg-green-900/20 text-green-600' },
          { label:'Pending',    value:`₹${(totalPending/1000).toFixed(0)}K`, icon:Clock,       color:'bg-amber-50 dark:bg-amber-900/20 text-amber-600' },
          { label:'Overdue',    value:`₹${(totalOverdue/1000).toFixed(0)}K`, icon:AlertTriangle,color:'bg-red-50 dark:bg-red-900/20 text-red-600' },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <s.icon size={17} />
            </div>
            <div>
              <p className="text-[11px] text-[#9CA3AF] font-medium">{s.label}</p>
              <p className="text-[20px] font-bold text-[#111827] dark:text-[#F0F0F0]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input pl-10 h-10 text-[13px]" placeholder="Search student..." />
        </div>
        <div className="flex gap-2">
          {['All','PAID','PENDING','OVERDUE'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all ${filter===f ? 'bg-[#5B5FEF] text-white' : 'bg-surface-3 dark:bg-[#1E293B] text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#EAEBF0] dark:hover:bg-[#2E2E2E]'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border dark:border-[#1E293B] bg-[#F9FAFB] dark:bg-[#1E1E1E]">
                {['Student','Class','Status','Paid','Due','Terms'].map(h => (
                  <th key={h} className="text-left px-2 sm:px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enriched.map(s => (
                <tr key={s.id} className="border-b border-[#F4F5F7] dark:border-[#1E293B] hover:bg-[#F9FAFB] dark:hover:bg-[#1E1E1E] transition-colors">
                  <td className="px-2 sm:px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#5B5FEF] flex items-center justify-center text-white text-[11px] font-bold">{s.name[0]}</div>
                      <p className="text-[13px] font-semibold text-[#111827] dark:text-[#F0F0F0]">{s.name}</p>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-3"><span className="badge-indigo">{s.class}{s.section}</span></td>
                  <td className="px-2 sm:px-4 py-3"><span className={BADGE[s.status]}>{s.status}</span></td>
                  <td className="px-2 sm:px-4 py-3"><span className="text-[13px] font-semibold text-green-600">₹{s.totalPaid.toLocaleString()}</span></td>
                  <td className="px-2 sm:px-4 py-3"><span className={`text-[13px] font-semibold ${s.totalDue > 0 ? 'text-red-600' : 'text-[#9CA3AF]'}`}>₹{s.totalDue.toLocaleString()}</span></td>
                  <td className="px-2 sm:px-4 py-3">
                    <div className="flex gap-1">
                      {s.fees.map(f => (
                        <div key={f.id} title={`${f.term}: ${f.status}`}
                          className={`w-2 h-2 rounded-full ${f.status==='PAID'?'bg-green-500':f.status==='PENDING'?'bg-amber-500':'bg-red-500'}`} />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

