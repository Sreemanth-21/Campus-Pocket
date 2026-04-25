import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getGrades } from '../../services/db'
import LoadingSpinner from '../../components/LoadingSpinner'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const COLORS = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4']

export default function StudentGrades() {
  const { profile } = useAuth()
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.id) return
    getGrades(profile.id).then(d => { setGrades(d); setLoading(false) })
  }, [profile?.id])

  if (loading) return <LoadingSpinner />

  const subjects = [...new Set(grades.map(g => g.subject))]
  const subjectAvgs = subjects.map((sub, i) => {
    const scores = grades.filter(g => g.subject === sub).map(g => g.score)
    return { subject: sub, avg: Math.round(scores.reduce((a,b)=>a+b,0)/scores.length), color: COLORS[i%COLORS.length] }
  })
  const overall = grades.length ? Math.round(grades.reduce((s,g)=>s+g.score,0)/grades.length) : 0
  const timeline = grades.map(g => ({ date: g.date?.slice(5), score: g.score }))

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Grades & Performance</h2>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary-600">{overall}%</p>
          <p className="text-xs text-gray-400">Overall Average</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {subjectAvgs.map(s => (
          <div key={s.subject} className="card text-center p-4">
            <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: s.color }}>{s.subject[0]}</div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{s.avg}%</p>
            <p className="text-xs text-gray-400 truncate">{s.subject}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Subject Comparison</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={subjectAvgs}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <YAxis domain={[0,100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="avg" radius={[6,6,0,0]} fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Score Timeline</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[0,100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">All Grades</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Subject</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Date</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">Score</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">Grade</th>
              </tr>
            </thead>
            <tbody>
              {grades.map(g => (
                <tr key={g.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-2.5 px-3 font-medium text-gray-900 dark:text-white">{g.subject}</td>
                  <td className="py-2.5 px-3 text-gray-500">{g.date}</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-gray-900 dark:text-white">{g.score}%</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                      ${g.score>=90?'bg-green-100 text-green-700':g.score>=75?'bg-blue-100 text-blue-700':g.score>=60?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-700'}`}>
                      {g.score>=90?'A':g.score>=75?'B':g.score>=60?'C':'D'}
                    </span>
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

