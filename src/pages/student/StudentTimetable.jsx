import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getTimetable } from '../../services/db'
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

export default function StudentTimetable() {
  const { profile } = useAuth()
  const [timetable, setTimetable] = useState([])
  const [loading, setLoading] = useState(true)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })

  useEffect(() => {
    if (!profile?.class) return
    getTimetable(profile.class).then(d => { setTimetable(d); setLoading(false) })
  }, [profile?.class])

  if (loading) return <LoadingSpinner />

  const TIMES = ['08:00 - 09:00','09:00 - 10:00','10:30 - 11:30','11:30 - 12:30']

  return (
    <div className="space-y-6 fade-in">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Weekly Timetable</h2>

      <div className="lg:hidden space-y-4">
        {DAYS.map(day => {
          const classes = timetable.filter(t => t.day === day)
          return (
            <div key={day} className={`card ${day===today?'ring-2 ring-primary-500':''}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">{day}</h3>
                {day===today && <span className="badge-blue">Today</span>}
              </div>
              <div className="space-y-2">
                {classes.map(cls => (
                  <div key={cls.id} className="flex items-center justify-between">
                    <span className={`text-sm px-2.5 py-1 rounded-lg font-medium ${SUBJECT_COLORS[cls.subject]||'bg-gray-100 text-gray-700'}`}>{cls.subject}</span>
                    <span className="text-xs text-gray-400">{cls.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="hidden lg:block card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="text-left py-3 px-4 text-gray-500 font-medium w-32">Time</th>
              {DAYS.map(day => (
                <th key={day} className={`text-center py-3 px-4 font-medium ${day===today?'text-primary-600':'text-gray-500'}`}>
                  {day}{day===today&&<span className="ml-1 text-xs">(Today)</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIMES.map(time => (
              <tr key={time} className="border-b border-gray-50 dark:border-gray-800/50">
                <td className="py-3 px-4 text-gray-400 text-xs font-medium">{time}</td>
                {DAYS.map(day => {
                  const cls = timetable.find(t => t.day===day && t.time===time)
                  return (
                    <td key={day} className="py-3 px-4 text-center">
                      {cls
                        ? <span className={`text-xs px-2.5 py-1.5 rounded-lg font-medium ${SUBJECT_COLORS[cls.subject]||'bg-gray-100 text-gray-700'}`}>{cls.subject}</span>
                        : <span className="text-gray-200 dark:text-gray-700">—</span>}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

