import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getChildrenOfParent, getGrades } from '../../services/db'
import LoadingSpinner from '../../components/LoadingSpinner'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function ParentGrades() {
  const { profile } = useAuth()
  const [children, setChildren] = useState([])
  const [selected, setSelected] = useState(null)
  const [grades, setGrades]     = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!profile?.id) return
    getChildrenOfParent(profile.id).then(kids => {
      setChildren(kids); if (kids.length) setSelected(kids[0].id); setLoading(false)
    })
  }, [profile?.id])

  useEffect(() => { if (selected) getGrades(selected).then(setGrades) }, [selected])

  if (loading) return <LoadingSpinner />

  const subjects = [...new Set(grades.map(g => g.subject))]
  const avg = grades.length ? Math.round(grades.reduce((s,g)=>s+g.score,0)/grades.length) : 0

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Grades</h2>
        <div className="flex gap-2">
          {children.map(c => (
            <button key={c.id} onClick={() => setSelected(c.id)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${selected===c.id?'bg-primary-600 text-white':'btn-secondary'}`}>
              {c.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {subjects.map(sub => {
          const subGrades = grades.filter(g => g.subject === sub)
          const subAvg = Math.round(subGrades.reduce((s,g)=>s+g.score,0)/subGrades.length)
          return (
            <div key={sub} className="card text-center">
              <p className="text-2xl font-bold text-primary-600">{subAvg}%</p>
              <p className="text-sm text-gray-500 mt-1">{sub}</p>
            </div>
          )
        })}
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Progress Timeline (Avg: {avg}%)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={grades.map(g=>({date:g.date?.slice(5),score:g.score}))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{fontSize:11}} />
            <YAxis domain={[0,100]} tick={{fontSize:11}} />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} dot={{r:4}} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Grade Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Subject</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Date</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {grades.map(g => (
                <tr key={g.id} className="border-b border-gray-50 dark:border-gray-800/50">
                  <td className="py-2.5 px-3 font-medium text-gray-900 dark:text-white">{g.subject}</td>
                  <td className="py-2.5 px-3 text-gray-500">{g.date}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={`font-bold ${g.score>=85?'text-green-600':g.score>=70?'text-blue-600':'text-red-600'}`}>{g.score}%</span>
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

