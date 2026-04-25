import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getChildrenOfParent, getExams } from '../../services/db'
import LoadingSpinner from '../../components/LoadingSpinner'
import { CalendarDays, CheckCircle, Clock } from 'lucide-react'

export default function ParentExams() {
  const { profile } = useAuth()
  const [children, setChildren] = useState([])
  const [selected, setSelected] = useState(null)
  const [exams, setExams]       = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!profile?.id) return
    getChildrenOfParent(profile.id).then(kids => {
      setChildren(kids); if (kids.length) setSelected(kids[0].id); setLoading(false)
    })
  }, [profile?.id])

  useEffect(() => { if (selected) getExams(selected).then(setExams) }, [selected])

  if (loading) return <LoadingSpinner />

  const completed = exams.filter(e => e.score !== null)
  const upcoming  = exams.filter(e => e.score === null && new Date(e.date) >= new Date())
  const avg = completed.length ? Math.round(completed.reduce((s,e)=>s+e.score,0)/completed.length) : 0

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Exams</h2>
        <div className="flex gap-2">
          {children.map(c => (
            <button key={c.id} onClick={() => setSelected(c.id)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${selected===c.id?'bg-primary-600 text-white':'btn-secondary'}`}>
              {c.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {upcoming.length > 0 && (
        <div className="card border-l-4 border-l-yellow-500">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Clock size={16} className="text-yellow-500" /> Upcoming Exams
          </h3>
          <div className="space-y-2">
            {upcoming.map(exam => (
              <div key={exam.id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl">
                <div className="flex items-center gap-3">
                  <CalendarDays size={16} className="text-yellow-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{exam.subject}</p>
                    <p className="text-xs text-gray-400">{new Date(exam.date).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</p>
                  </div>
                </div>
                <span className="badge-yellow">Upcoming</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <CheckCircle size={16} className="text-green-500" /> Results (Avg: {avg}%)
        </h3>
        <div className="space-y-2">
          {completed.map(exam => (
            <div key={exam.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">{exam.subject}</p>
                <p className="text-xs text-gray-400">{new Date(exam.date).toLocaleDateString()}</p>
              </div>
              <p className={`text-lg font-bold ${exam.score>=85?'text-green-600':exam.score>=70?'text-blue-600':'text-red-600'}`}>{exam.score}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

