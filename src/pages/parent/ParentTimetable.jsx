import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getChildrenOfParent, getTimetable } from '../../services/db'
import LoadingSpinner from '../../components/LoadingSpinner'

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday']
const SUBJECT_COLORS = {
  Mathematics:'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  Science:'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  English:'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  History:'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  Physics:'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  Chemistry:'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  PE:'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  Art:'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
}

export default function ParentTimetable() {
  const { profile } = useAuth()
  const [children, setChildren]   = useState([])
  const [selected, setSelected]   = useState(null)
  const [timetable, setTimetable] = useState([])
  const [loading, setLoading]     = useState(true)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })

  useEffect(() => {
    if (!profile?.id) return
    getChildrenOfParent(profile.id).then(kids => {
      setChildren(kids); if (kids.length) setSelected(kids[0].id); setLoading(false)
    })
  }, [profile?.id])

  useEffect(() => {
    const child = children.find(c => c.id === selected)
    if (child?.class) getTimetable(child.class).then(setTimetable)
  }, [selected, children])

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Timetable</h2>
        <div className="flex gap-2">
          {children.map(c => (
            <button key={c.id} onClick={() => setSelected(c.id)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${selected===c.id?'bg-primary-600 text-white':'btn-secondary'}`}>
              {c.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {DAYS.map(day => {
          const classes = timetable.filter(t => t.day === day)
          return (
            <div key={day} className={`card ${day===today?'ring-2 ring-primary-500':''}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">{day}</h3>
                {day===today && <span className="badge-blue">Today</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {classes.map(cls => (
                  <div key={cls.id} className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${SUBJECT_COLORS[cls.subject]||'bg-gray-100 text-gray-700'}`}>{cls.subject}</span>
                    <span className="text-xs text-gray-400">{cls.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

