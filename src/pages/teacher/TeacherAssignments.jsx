import { useState } from 'react'
import { mockClassrooms, mockClassroomStudents } from '../../services/teacherMockData'
import { useSchoolStore } from '../../store/schoolStore'
import { ClipboardList, Plus, X, CheckCircle, Calendar, Users, Eye, ArrowLeft } from 'lucide-react'

function AssignmentDetail({ assignment, onBack }) {
  const { submissions, gradeSubmission } = useSchoolStore()
  const { classrooms, classroomStudents } = useSchoolStore()
  const mySubmissions = submissions.filter(s => s.assignment_id === assignment.id)
  const classroom     = classrooms.find(c => c.id === assignment.classroom_id)
  const students      = classroomStudents[assignment.classroom_id] || []
  const [localGrades, setLocalGrades] = useState({})

  const getSubmission = (studentId) => mySubmissions.find(s => s.student_id === studentId)

  const handleGrade = (studentId) => {
    const score = Number(localGrades[studentId])
    if (!score) return
    gradeSubmission(assignment.id, studentId, score, '')
    setLocalGrades(p => ({ ...p, [studentId]: '' }))
  }

  return (
    <div className="space-y-5 fade-in max-w-4xl">
      <button onClick={onBack} className="flex items-center gap-2 text-[13px] text-[#6B7280] hover:text-[#111827] dark:hover:text-[#F0F0F0] transition-colors">
        <ArrowLeft size={15} /> Back
      </button>
      <div className="card border-l-4 border-l-purple-500">
        <p className="text-[18px] font-bold text-[#111827] dark:text-[#F0F0F0]">{assignment.title}</p>
        <p className="text-[13px] text-[#6B7280] mt-1">{assignment.description}</p>
        <div className="flex gap-3 mt-3 flex-wrap">
          <span className="badge-purple">{classroom?.name}</span>
          <span className="badge-yellow flex items-center gap-1"><Calendar size={10} /> Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
          <span className="badge-blue">Max: {assignment.max_score} marks</span>
        </div>
      </div>

      <div className="card">
        <p className="text-[15px] font-bold text-[#111827] dark:text-[#F0F0F0] mb-4 flex items-center gap-2"><Users size={15} className="text-purple-500" /> Submissions ({submissions.length}/{students.length})</p>
        <div className="space-y-2">
          {students.map(student => {
            const sub = getSubmission(student.id)
            return (
              <div key={student.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-3 dark:bg-[#1E293B]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-[12px] font-bold">{student.name[0]}</div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#111827] dark:text-[#F0F0F0]">{student.name}</p>
                    <p className="text-[11px] text-[#9CA3AF]">{sub ? `Submitted ${new Date(sub.submitted_at).toLocaleDateString()}` : 'Not submitted'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {sub ? (
                    sub.score != null
                      ? <span className="badge-green">{sub.score}/{assignment.max_score}</span>
                      : <div className="flex items-center gap-1.5">
                          <input type="number" min="0" max={assignment.max_score}
                            value={localGrades[student.id] || ''}
                            onChange={e => setLocalGrades(p => ({...p, [student.id]: e.target.value}))}
                            className="w-16 input h-8 text-[12px] py-1 px-2" placeholder="Score" />
                          <button onClick={() => handleGrade(student.id)} className="btn-primary text-[11px] py-1 px-2">Grade</button>
                        </div>
                  ) : <span className="badge-red">Missing</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function TeacherAssignments() {
  const { assignments, addAssignment, deleteAssignment } = useSchoolStore()
  const { classrooms } = useSchoolStore()
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [success, setSuccess]   = useState(false)
  const [form, setForm]         = useState({ title:'', description:'', classroom_id: classrooms[0]?.id || 'cls-1', due_date:'', max_score:20 })

  if (selected) return <AssignmentDetail assignment={selected} onBack={() => setSelected(null)} />

  const handleAdd = (e) => {
    e.preventDefault()
    addAssignment(form)
    setForm({ title:'', description:'', classroom_id: classrooms[0]?.id || 'cls-1', due_date:'', max_score:20 })
    setSuccess(true)
    setTimeout(() => { setSuccess(false); setShowForm(false) }, 1800)
  }

  return (
    <div className="space-y-5 fade-in max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-bold text-[#111827] dark:text-[#F0F0F0]">Assignments</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-[13px]"><Plus size={14} /> New Assignment</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-lg slide-up">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[16px] font-bold text-[#111827] dark:text-[#F0F0F0]">New Assignment</p>
              <button onClick={() => setShowForm(false)} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>
            {success ? (
              <div className="text-center py-6"><CheckCircle size={40} className="text-green-500 mx-auto mb-3" /><p className="font-semibold text-green-600">Assignment created! Students notified.</p></div>
            ) : (
              <form onSubmit={handleAdd} className="space-y-3">
                <div><label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Title *</label><input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} className="input" placeholder="Assignment title" required /></div>
                <div><label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Description</label><textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} className="input resize-none min-h-20" placeholder="Instructions..." /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Classroom</label><select value={form.classroom_id} onChange={e=>setForm(p=>({...p,classroom_id:e.target.value}))} className="input">{mockClassrooms.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                  <div><label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Max Score</label><input type="number" value={form.max_score} onChange={e=>setForm(p=>({...p,max_score:e.target.value}))} className="input" /></div>
                </div>
                <div><label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Due Date</label><input type="datetime-local" value={form.due_date} onChange={e=>setForm(p=>({...p,due_date:e.target.value}))} className="input" required /></div>
                <button type="submit" className="btn-primary w-full">Create & Notify Students</button>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {assignments.map(a => {
          const cls = classrooms.find(c => c.id === a.classroom_id)
          const subs = useSchoolStore.getState().submissions.filter(s => s.assignment_id === a.id)
          const daysLeft = Math.ceil((new Date(a.due_date) - new Date()) / 86400000)
          return (
            <div key={a.id} onClick={() => setSelected(a)}
              className="card cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ClipboardList size={16} className="text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-[#111827] dark:text-[#F0F0F0]">{a.title}</p>
                    <p className="text-[12px] text-[#6B7280] truncate mt-0.5">{a.description}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="badge-purple text-[10px]">{cls?.name}</span>
                      <span className="badge-blue text-[10px]">{subs.length} submitted</span>
                      <span className="badge-blue text-[10px]">Max: {a.max_score}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={daysLeft < 0 ? 'badge-red' : daysLeft <= 3 ? 'badge-yellow' : 'badge-green'}>
                    {daysLeft < 0 ? 'Overdue' : `${daysLeft}d left`}
                  </span>
                  <p className="text-[11px] text-[#9CA3AF] mt-1">{new Date(a.due_date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

