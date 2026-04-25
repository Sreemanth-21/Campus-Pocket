import { useState, useMemo } from 'react'
import { demoStudents, demoAttendance } from '../../services/mockData'
import { CalendarDays, CheckCircle, XCircle, Clock, Save, ChevronLeft, ChevronRight } from 'lucide-react'

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const STATUS_COLOR = { present:'bg-green-500', absent:'bg-red-500', late:'bg-amber-500', none:'bg-[#E5E7EB] dark:bg-[#1E293B]' }

export default function AdminAttendance() {
  const today = new Date()
  const [viewDate, setViewDate] = useState(today.toISOString().split('T')[0])
  const [classFilter, setClassFilter] = useState('All')
  const [markMode, setMarkMode] = useState(false)
  const [marks, setMarks] = useState({})
  const [saved, setSaved] = useState(false)

  const classes = ['All', ...new Set(demoStudents.map(s => s.class))]
  const students = demoStudents.filter(s => classFilter === 'All' || s.class === classFilter)

  // Build attendance map for selected date
  const attMap = useMemo(() => {
    const map = {}
    demoAttendance.forEach(a => {
      if (a.date === viewDate) map[a.student_id] = a.status
    })
    return map
  }, [viewDate])

  const getStatus = (studentId) => marks[studentId] || attMap[studentId] || 'none'

  const handleMark = (studentId, status) => {
    if (!markMode) return
    setMarks(prev => ({ ...prev, [studentId]: status }))
  }

  const handleSave = () => {
    setSaved(true)
    setMarkMode(false)
    setTimeout(() => setSaved(false), 2000)
  }

  // Summary
  const present = students.filter(s => getStatus(s.id) === 'present').length
  const absent  = students.filter(s => getStatus(s.id) === 'absent').length
  const late    = students.filter(s => getStatus(s.id) === 'late').length
  const unmarked = students.filter(s => getStatus(s.id) === 'none').length

  // Navigate date
  const changeDate = (delta) => {
    const d = new Date(viewDate)
    d.setDate(d.getDate() + delta)
    setViewDate(d.toISOString().split('T')[0])
    setMarks({})
  }

  return (
    <div className="space-y-5 fade-in max-w-5xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-[20px] font-bold text-[#111827] dark:text-[#F0F0F0]">Attendance</h2>
          <p className="text-[13px] text-[#6B7280] mt-0.5">Mark and review daily attendance</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="badge-green flex items-center gap-1"><CheckCircle size={11} /> Saved</span>}
          {markMode
            ? <button onClick={handleSave} className="btn-primary flex items-center gap-2 text-[13px]"><Save size={14} /> Save</button>
            : <button onClick={() => setMarkMode(true)} className="btn-primary flex items-center gap-2 text-[13px]"><CalendarDays size={14} /> Mark Attendance</button>
          }
        </div>
      </div>

      {/* Date nav + filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white dark:bg-[#1A1A1A] border border-border dark:border-[#1E293B] rounded-xl px-3 py-2">
          <button onClick={() => changeDate(-1)} className="btn-ghost p-1"><ChevronLeft size={15} /></button>
          <input type="date" value={viewDate} onChange={e => { setViewDate(e.target.value); setMarks({}) }}
            className="text-[13px] font-semibold text-[#111827] dark:text-[#F0F0F0] bg-transparent outline-none" />
          <button onClick={() => changeDate(1)} className="btn-ghost p-1"><ChevronRight size={15} /></button>
        </div>
        <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="input h-10 text-[13px] w-auto">
          {classes.map(c => <option key={c} value={c}>{c === 'All' ? 'All Classes' : `Class ${c}`}</option>)}
        </select>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:'Present', value:present, color:'text-green-600', bg:'bg-green-50 dark:bg-green-900/20' },
          { label:'Absent',  value:absent,  color:'text-red-600',   bg:'bg-red-50 dark:bg-red-900/20' },
          { label:'Late',    value:late,    color:'text-amber-600', bg:'bg-amber-50 dark:bg-amber-900/20' },
          { label:'Unmarked',value:unmarked,color:'text-[#6B7280]', bg:'bg-surface-3 dark:bg-[#1E293B]' },
        ].map(s => (
          <div key={s.label} className={`card text-center py-3 ${s.bg}`}>
            <p className={`text-[22px] font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Attendance table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border dark:border-[#1E293B] bg-[#F9FAFB] dark:bg-[#1E1E1E] flex items-center justify-between">
          <p className="text-[13px] font-bold text-[#374151] dark:text-[#D1D5DB]">
            {new Date(viewDate).toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </p>
          {markMode && <p className="text-[12px] text-[#5B5FEF] font-medium">Click a status to mark</p>}
        </div>

        <div className="divide-y divide-[#F4F5F7] dark:divide-[#252525]">
          {students.map(student => {
            const status = getStatus(student.id)
            return (
              <div key={student.id} className="flex items-center justify-between px-4 py-3 hover:bg-[#F9FAFB] dark:hover:bg-[#1E1E1E] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#5B5FEF] flex items-center justify-center text-white text-[11px] font-bold">
                    {student.name[0]}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#111827] dark:text-[#F0F0F0]">{student.name}</p>
                    <p className="text-[11px] text-[#9CA3AF]">Class {student.class}{student.section}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {['present','absent','late'].map(s => (
                    <button key={s} onClick={() => handleMark(student.id, s)}
                      disabled={!markMode}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all ${
                        status === s
                          ? s === 'present' ? 'bg-green-500 text-white'
                          : s === 'absent'  ? 'bg-red-500 text-white'
                          : 'bg-amber-500 text-white'
                          : markMode
                          ? 'bg-surface-3 dark:bg-[#1E293B] text-[#6B7280] hover:bg-[#EAEBF0] dark:hover:bg-[#2E2E2E]'
                          : 'bg-surface-3 dark:bg-[#1E293B] text-[#9CA3AF] cursor-default'
                      }`}>
                      {s === 'present' ? <CheckCircle size={11} /> : s === 'absent' ? <XCircle size={11} /> : <Clock size={11} />}
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

