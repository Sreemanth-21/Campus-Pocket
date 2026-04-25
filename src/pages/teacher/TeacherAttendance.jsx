import { useState, useMemo } from 'react'
import { mockClassrooms, mockClassroomStudents } from '../../services/teacherMockData'
import { demoAttendance, demoStudents } from '../../services/mockData'
import {
  CheckCircle, XCircle, Clock, Save, ChevronLeft,
  ChevronRight, Users, BarChart2
} from 'lucide-react'
import WhatsAppButton from '../../components/WhatsAppButton'

const STATUS = ['present', 'absent', 'late']

const STATUS_STYLE = {
  present: { active: 'bg-green-500 text-white',  idle: 'bg-surface-3 dark:bg-[#1E293B] text-[#6B7280] hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600' },
  absent:  { active: 'bg-red-500 text-white',    idle: 'bg-surface-3 dark:bg-[#1E293B] text-[#6B7280] hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600' },
  late:    { active: 'bg-amber-500 text-white',  idle: 'bg-surface-3 dark:bg-[#1E293B] text-[#6B7280] hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600' },
}

const STATUS_ICON = {
  present: <CheckCircle size={12} />,
  absent:  <XCircle size={12} />,
  late:    <Clock size={12} />,
}

export default function TeacherAttendance() {
  const today = new Date().toISOString().split('T')[0]

  const [selectedClass, setSelectedClass] = useState(mockClassrooms[0]?.id || '')
  const [date, setDate]                   = useState(today)
  const [marks, setMarks]                 = useState({})   // { studentId: status }
  const [saved, setSaved]                 = useState(false)
  const [saveMsg, setSaveMsg]             = useState('')
  const [history, setHistory]             = useState({})   // { 'classId|date': { studentId: status } }

  const classroom = mockClassrooms.find(c => c.id === selectedClass)
  const students  = mockClassroomStudents[selectedClass] || []

  // Pre-fill from saved history or demo attendance
  const existingMarks = useMemo(() => {
    const key = `${selectedClass}|${date}`
    if (history[key]) return history[key]
    // Fall back to demo attendance for known students
    const map = {}
    students.forEach(s => {
      const rec = demoAttendance.find(a => a.student_id === s.id && a.date === date)
      if (rec) map[s.id] = rec.status
    })
    return map
  }, [selectedClass, date, history, students])

  // Merge saved + current marks
  const effectiveMarks = { ...existingMarks, ...marks }

  const changeDate = (delta) => {
    const d = new Date(date)
    d.setDate(d.getDate() + delta)
    setDate(d.toISOString().split('T')[0])
    setMarks({})
    setSaved(false)
  }

  const mark = (studentId, status) => {
    setMarks(prev => ({ ...prev, [studentId]: status }))
    setSaved(false)
  }

  const markAll = (status) => {
    const all = {}
    students.forEach(s => { all[s.id] = status })
    setMarks(all)
    setSaved(false)
  }

  const handleSave = () => {
    const key = `${selectedClass}|${date}`
    setHistory(prev => ({ ...prev, [key]: { ...effectiveMarks } }))
    setMarks({})
    setSaved(true)
    setSaveMsg(`Attendance saved for ${new Date(date).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}`)
    setTimeout(() => setSaved(false), 3000)
  }

  // Summary counts
  const present  = students.filter(s => effectiveMarks[s.id] === 'present').length
  const absent   = students.filter(s => effectiveMarks[s.id] === 'absent').length
  const late     = students.filter(s => effectiveMarks[s.id] === 'late').length
  const unmarked = students.filter(s => !effectiveMarks[s.id]).length
  const pct      = students.length ? Math.round(((present + late) / students.length) * 100) : 0

  const isWeekend = [0, 6].includes(new Date(date).getDay())

  return (
    <div className="space-y-5 fade-in max-w-4xl">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-[20px] font-bold text-[#111827] dark:text-[#F0F0F0]">Mark Attendance</h2>
        <button
          onClick={handleSave}
          disabled={unmarked > 0 || isWeekend}
          className="btn-primary flex items-center gap-2 text-[13px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={14} />
          {unmarked > 0 ? `Mark all (${unmarked} remaining)` : 'Save Attendance'}
        </button>
      </div>

      {/* Saved toast */}
      {saved && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl fade-in">
          <CheckCircle size={15} className="text-green-500" />
          <p className="text-[13px] font-medium text-green-700 dark:text-green-400">{saveMsg}</p>
        </div>
      )}

      {/* Controls row */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Classroom selector */}
        <select
          value={selectedClass}
          onChange={e => { setSelectedClass(e.target.value); setMarks({}); setSaved(false) }}
          className="input h-10 text-[13px] w-auto min-w-[180px]"
        >
          {mockClassrooms.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Date navigator */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#1A1A1A] border border-border dark:border-[#1E293B] rounded-xl px-2 py-1.5">
          <button onClick={() => changeDate(-1)} className="btn-ghost p-1.5 rounded-lg">
            <ChevronLeft size={15} />
          </button>
          <input
            type="date"
            value={date}
            max={today}
            onChange={e => { setDate(e.target.value); setMarks({}); setSaved(false) }}
            className="text-[13px] font-semibold text-[#111827] dark:text-[#F0F0F0] bg-transparent outline-none cursor-pointer"
          />
          <button onClick={() => changeDate(1)} disabled={date >= today} className="btn-ghost p-1.5 rounded-lg disabled:opacity-30">
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Quick mark all */}
        <div className="flex gap-1.5 ml-auto">
          <span className="text-[12px] text-[#9CA3AF] self-center mr-1">Mark all:</span>
          {STATUS.map(s => (
            <button key={s} onClick={() => markAll(s)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all capitalize ${STATUS_STYLE[s].idle}`}>
              {STATUS_ICON[s]} {s}
            </button>
          ))}
        </div>
      </div>

      {/* Weekend warning */}
      {isWeekend && (
        <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800 rounded-xl text-[13px] text-amber-700 dark:text-amber-400 font-medium">
          ⚠️ {new Date(date).toLocaleDateString('en-US', { weekday: 'long' })} is a weekend — attendance not required.
        </div>
      )}

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Present',  value: present,  color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Absent',   value: absent,   color: 'text-red-600',    bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Late',     value: late,     color: 'text-amber-600',  bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Unmarked', value: unmarked, color: 'text-[#6B7280]',  bg: 'bg-surface-3 dark:bg-[#1E293B]' },
        ].map(s => (
          <div key={s.label} className={`card text-center py-3 ${s.bg}`}>
            <p className={`text-[22px] font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Attendance % bar */}
      {students.length > 0 && (
        <div className="card py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-semibold text-[#111827] dark:text-[#F0F0F0] flex items-center gap-2">
              <BarChart2 size={14} className="text-emerald-500" /> Today's Attendance Rate
            </p>
            <span className={`text-[14px] font-bold ${pct >= 85 ? 'text-green-600' : pct >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
              {pct}%
            </span>
          </div>
          <div className="h-2.5 bg-surface-3 dark:bg-[#1E293B] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: pct >= 85 ? '#10B981' : pct >= 75 ? '#F59E0B' : '#EF4444' }}
            />
          </div>
        </div>
      )}

      {/* Student list */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-[#1E293B] bg-[#F9FAFB] dark:bg-[#1E1E1E]">
          <p className="text-[13px] font-bold text-[#374151] dark:text-[#D1D5DB] flex items-center gap-2">
            <Users size={14} className="text-emerald-500" />
            {classroom?.name} — {students.length} students
          </p>
          <p className="text-[12px] text-[#9CA3AF]">
            {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-12">
            <Users size={32} className="text-[#D1D5DB] mx-auto mb-2" />
            <p className="text-[13px] text-[#9CA3AF]">No students in this classroom</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F4F5F7] dark:divide-[#252525]">
            {students.map((student, idx) => {
              const current = effectiveMarks[student.id]
              // Look up parent_phone from demoStudents (teacher mock students share same IDs)
              const fullStudent = demoStudents.find(s => s.id === student.id) || student
              const isAbsent = current === 'absent'
              const isLowAtt = fullStudent.attendance_percentage < 75
              const showAlert = isAbsent || isLowAtt
              return (
                <div key={student.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-[#F9FAFB] dark:hover:bg-[#1E1E1E] transition-colors">
                  {/* Student info */}
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-[#9CA3AF] w-5 text-right flex-shrink-0">{idx + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0">
                      {student.name[0]}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#111827] dark:text-[#F0F0F0]">{student.name}</p>
                      <p className="text-[11px] text-[#9CA3AF]">{student.admission_number || `Roll ${idx + 1}`}</p>
                    </div>
                  </div>

                  {/* Status buttons + WhatsApp alert */}
                  <div className="flex items-center gap-2">
                    {/* WhatsApp icon — only shown for absent or low-attendance students */}
                    {showAlert && (
                      <WhatsAppButton
                        student={fullStudent}
                        parentPhone={fullStudent.parent_phone}
                        size="sm"
                        variant="icon"
                      />
                    )}
                    <div className="flex items-center gap-1.5">
                      {STATUS.map(s => (
                        <button
                          key={s}
                          onClick={() => mark(student.id, s)}
                          disabled={isWeekend}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all capitalize disabled:opacity-40 disabled:cursor-not-allowed
                            ${current === s ? STATUS_STYLE[s].active : STATUS_STYLE[s].idle}`}
                        >
                          {STATUS_ICON[s]}
                          <span className="hidden sm:inline">{s}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer summary */}
        {students.length > 0 && (
          <div className="px-4 py-3 border-t border-border dark:border-[#1E293B] bg-[#F9FAFB] dark:bg-[#1E1E1E] flex items-center justify-between">
            <p className="text-[12px] text-[#9CA3AF]">
              {students.length - unmarked} of {students.length} marked
            </p>
            <button
              onClick={handleSave}
              disabled={unmarked > 0 || isWeekend}
              className="btn-primary text-[12px] py-1.5 px-4 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={13} />
              {unmarked > 0 ? `${unmarked} remaining` : 'Save'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

