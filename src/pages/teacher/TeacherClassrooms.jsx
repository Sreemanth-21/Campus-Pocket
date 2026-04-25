import { useState } from 'react'
import { mockClassrooms, mockClassroomStudents, mockAssignments, mockTests } from '../../services/teacherMockData'
import { BookOpen, Users, ClipboardList, FileText, Plus, X, CheckCircle, ChevronRight, ArrowLeft } from 'lucide-react'

function ClassroomDetail({ classroom, onBack }) {
  const students    = mockClassroomStudents[classroom.id] || []
  const assignments = mockAssignments.filter(a => a.classroom_id === classroom.id)
  const tests       = mockTests.filter(t => t.classroom_id === classroom.id)

  return (
    <div className="space-y-5 fade-in max-w-4xl">
      <button onClick={onBack} className="flex items-center gap-2 text-[13px] text-[#6B7280] hover:text-[#111827] dark:hover:text-[#F0F0F0] transition-colors">
        <ArrowLeft size={15} /> Back to Classrooms
      </button>

      <div className="card bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold">{classroom.section}</div>
          <div>
            <h2 className="text-[20px] font-bold">{classroom.name}</h2>
            <p className="text-white/70 text-[13px]">{classroom.subject} · Class {classroom.grade}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          {[
            { label: 'Students',    value: students.length },
            { label: 'Assignments', value: assignments.length },
            { label: 'Tests',       value: tests.length },
          ].map(s => (
            <div key={s.label} className="bg-white/15 rounded-xl p-3 text-center">
              <p className="text-[20px] font-bold">{s.value}</p>
              <p className="text-white/70 text-[11px]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Students */}
      <div className="card">
        <p className="text-[15px] font-bold text-[#111827] dark:text-[#F0F0F0] mb-3 flex items-center gap-2"><Users size={15} className="text-emerald-500" /> Students</p>
        <div className="space-y-2">
          {students.map(s => (
            <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-3 dark:bg-[#1E293B]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[12px] font-bold">{s.name[0]}</div>
                <div>
                  <p className="text-[13px] font-semibold text-[#111827] dark:text-[#F0F0F0]">{s.name}</p>
                  <p className="text-[11px] text-[#9CA3AF]">{s.admission_number}</p>
                </div>
              </div>
              <span className={s.attendance_percentage >= 85 ? 'badge-green' : s.attendance_percentage >= 75 ? 'badge-yellow' : 'badge-red'}>
                {s.attendance_percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function TeacherClassrooms() {
  const [selected, setSelected] = useState(null)
  const [classrooms, setClassrooms] = useState(mockClassrooms)
  const [showForm, setShowForm] = useState(false)
  const [success, setSuccess]   = useState(false)
  const [form, setForm]         = useState({ name: '', grade: '10', section: 'A', subject: '' })

  if (selected) return <ClassroomDetail classroom={selected} onBack={() => setSelected(null)} />

  const handleAdd = (e) => {
    e.preventDefault()
    setClassrooms(prev => [...prev, { id: `cls-${Date.now()}`, teacher_id: 'user-teacher-1', ...form, school_id: 'school-demo-001' }])
    setForm({ name: '', grade: '10', section: 'A', subject: '' })
    setSuccess(true)
    setTimeout(() => { setSuccess(false); setShowForm(false) }, 1800)
  }

  return (
    <div className="space-y-5 fade-in max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-bold text-[#111827] dark:text-[#F0F0F0]">Classrooms</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-[13px]"><Plus size={14} /> New Classroom</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md slide-up">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[16px] font-bold text-[#111827] dark:text-[#F0F0F0]">New Classroom</p>
              <button onClick={() => setShowForm(false)} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>
            {success ? (
              <div className="text-center py-6"><CheckCircle size={40} className="text-green-500 mx-auto mb-3" /><p className="font-semibold text-green-600">Classroom created!</p></div>
            ) : (
              <form onSubmit={handleAdd} className="space-y-3">
                <div><label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Classroom Name</label><input value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} className="input" placeholder="e.g. Mathematics 10C" required /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Grade</label><select value={form.grade} onChange={e => setForm(p=>({...p,grade:e.target.value}))} className="input">{['9','10','11','12'].map(g=><option key={g}>{g}</option>)}</select></div>
                  <div><label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Section</label><select value={form.section} onChange={e => setForm(p=>({...p,section:e.target.value}))} className="input">{['A','B','C','D'].map(s=><option key={s}>{s}</option>)}</select></div>
                </div>
                <div><label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Subject</label><input value={form.subject} onChange={e => setForm(p=>({...p,subject:e.target.value}))} className="input" placeholder="e.g. Mathematics" required /></div>
                <button type="submit" className="btn-primary w-full">Create Classroom</button>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {classrooms.map(cls => (
          <div key={cls.id} onClick={() => setSelected(cls)}
            className="card cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-[18px] font-bold">{cls.section}</div>
                <div>
                  <p className="text-[15px] font-bold text-[#111827] dark:text-[#F0F0F0]">{cls.name}</p>
                  <p className="text-[12px] text-[#9CA3AF]">{cls.subject} · Class {cls.grade}</p>
                </div>
              </div>
              <ChevronRight size={15} className="text-[#D1D5DB] group-hover:text-emerald-500 transition-colors" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
              {[
                { label: 'Students',    value: mockClassroomStudents[cls.id]?.length || 0, icon: Users },
                { label: 'Assignments', value: mockAssignments.filter(a=>a.classroom_id===cls.id).length, icon: ClipboardList },
                { label: 'Tests',       value: mockTests.filter(t=>t.classroom_id===cls.id).length, icon: FileText },
              ].map(s => (
                <div key={s.label} className="py-2 rounded-xl bg-surface-3 dark:bg-[#1E293B]">
                  <p className="text-[16px] font-bold text-[#111827] dark:text-[#F0F0F0]">{s.value}</p>
                  <p className="text-[10px] text-[#9CA3AF]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

