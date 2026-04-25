import { useAuth } from '../../contexts/AuthContext'
import { useSchoolStore } from '../../store/schoolStore'
import { ClipboardList, CheckCircle, Clock, Send, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

export default function StudentAssignments() {
  const { profile } = useAuth()
  const { getStudentAssignments, submissions, submitAssignment } = useSchoolStore()
  const [submitting, setSubmitting] = useState({})
  const [content, setContent]       = useState({})
  const [submitted, setSubmitted]   = useState({})

  const assignments = profile ? getStudentAssignments(profile) : []

  const getSubmission = (aId) => submissions.find(s => s.assignment_id === aId && s.student_id === profile?.id)

  const handleSubmit = async (assignmentId) => {
    if (!content[assignmentId]?.trim()) return
    setSubmitting(p => ({ ...p, [assignmentId]: true }))
    await new Promise(r => setTimeout(r, 600))
    submitAssignment(assignmentId, profile.id, content[assignmentId])
    setSubmitted(p => ({ ...p, [assignmentId]: true }))
    setSubmitting(p => ({ ...p, [assignmentId]: false }))
  }

  const pending   = assignments.filter(a => !getSubmission(a.id))
  const submitted_ = assignments.filter(a => getSubmission(a.id))

  return (
    <div className="space-y-5 fade-in max-w-3xl">
      <div>
        <h2 className="text-[20px] font-bold text-ink dark:text-[#E2E8F0] flex items-center gap-2">
          <ClipboardList size={20} className="text-brand-500" /> Assignments
        </h2>
        <p className="text-[13px] text-ink-4 mt-0.5">{pending.length} pending · {submitted_.length} submitted</p>
      </div>

      {pending.length > 0 && (
        <div>
          <p className="section-title">Pending</p>
          <div className="space-y-3">
            {pending.map(a => {
              const daysLeft = Math.ceil((new Date(a.due_date) - new Date()) / 86400000)
              const isOverdue = daysLeft < 0
              return (
                <div key={a.id} className="card border-l-4 border-l-brand-500">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-[14px] font-bold text-ink dark:text-[#E2E8F0]">{a.title}</p>
                      <p className="text-[12px] text-ink-3 mt-0.5">{a.description}</p>
                    </div>
                    <span className={isOverdue ? 'badge-red' : daysLeft <= 3 ? 'badge-yellow' : 'badge-green'}>
                      {isOverdue ? 'Overdue' : `${daysLeft}d left`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-ink-4 mb-3">
                    <Clock size={11} /> Due: {new Date(a.due_date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                    <span className="ml-2">· Max: {a.max_score} marks</span>
                  </div>
                  {submitted[a.id] ? (
                    <div className="flex items-center gap-2 text-success text-[13px] font-medium">
                      <CheckCircle size={15} /> Submitted successfully!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <textarea
                        value={content[a.id] || ''}
                        onChange={e => setContent(p => ({ ...p, [a.id]: e.target.value }))}
                        className="input resize-none min-h-20 text-[13px]"
                        placeholder="Write your answer or describe your submission..."
                      />
                      <button
                        onClick={() => handleSubmit(a.id)}
                        disabled={!content[a.id]?.trim() || submitting[a.id]}
                        className="btn-primary text-[12px] py-2 disabled:opacity-50"
                      >
                        <Send size={13} />
                        {submitting[a.id] ? 'Submitting...' : 'Submit Assignment'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {submitted_.length > 0 && (
        <div>
          <p className="section-title">Submitted</p>
          <div className="space-y-2">
            {submitted_.map(a => {
              const sub = getSubmission(a.id)
              return (
                <div key={a.id} className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-semibold text-ink dark:text-[#E2E8F0]">{a.title}</p>
                      <p className="text-[11px] text-ink-4 mt-0.5">
                        Submitted {new Date(sub.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {sub.score != null
                        ? <div>
                            <p className="text-[16px] font-bold text-brand-600">{sub.score}/{a.max_score}</p>
                            {sub.feedback && <p className="text-[11px] text-ink-4 mt-0.5">{sub.feedback}</p>}
                          </div>
                        : <span className="badge-yellow">Awaiting grade</span>
                      }
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {assignments.length === 0 && (
        <div className="card text-center py-12">
          <ClipboardList size={36} className="text-border mx-auto mb-3" />
          <p className="text-[14px] text-ink-4">No assignments yet</p>
          <p className="text-[12px] text-ink-4 mt-1">Your teacher hasn't posted any assignments</p>
        </div>
      )}
    </div>
  )
}
