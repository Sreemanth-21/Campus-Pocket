import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getGrades, getAttendance } from '../../services/db'
import { getAIInsights } from '../../services/gemini'
import { Sparkles, TrendingUp, TrendingDown, Lightbulb, RefreshCw } from 'lucide-react'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function StudentAI() {
  const { profile } = useAuth()
  const [insights, setInsights] = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const fetchInsights = async () => {
    if (!profile?.id) return
    setLoading(true); setError('')
    try {
      const [grades, attendance] = await Promise.all([
        getGrades(profile.id), getAttendance(profile.id)
      ])
      const result = await getAIInsights({
        name: profile.name, class: profile.class,
        attendance_percentage: profile.attendance_percentage,
        grades, attendance,
      })
      setInsights(result)
    } catch { setError('Failed to fetch AI insights.') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchInsights() }, [profile?.id])

  return (
    <div className="space-y-6 fade-in max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles size={20} className="text-accent-500" /> AI Insights
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">Powered by Gemini AI</p>
        </div>
        <button onClick={fetchInsights} disabled={loading} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw size={14} className={loading?'animate-spin':''} /> Refresh
        </button>
      </div>

      {loading && <LoadingSpinner />}
      {error && <div className="card border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/10"><p className="text-red-600 text-sm">{error}</p></div>}

      {insights && !loading && (
        <>
          <div className="card bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border-primary-100 dark:border-primary-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">Overall Score</h3>
              <div className="text-3xl font-bold text-primary-600">{insights.overall_score}%</div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{insights.summary}</p>
            <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-1000" style={{ width:`${insights.overall_score}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card border-l-4 border-l-green-500">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><TrendingUp size={16} className="text-green-500" /> Strengths</h3>
              <ul className="space-y-2">
                {insights.strengths.map((s,i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="w-5 h-5 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i+1}</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card border-l-4 border-l-red-500">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><TrendingDown size={16} className="text-red-500" /> Areas to Improve</h3>
              <ul className="space-y-2">
                {insights.weaknesses.length===0
                  ? <li className="text-sm text-gray-400">No major weaknesses 🎉</li>
                  : insights.weaknesses.map((w,i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="w-5 h-5 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i+1}</span>{w}
                    </li>
                  ))}
              </ul>
            </div>
            <div className="card border-l-4 border-l-blue-500">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Lightbulb size={16} className="text-blue-500" /> Recommendations</h3>
              <ul className="space-y-2">
                {insights.recommendations.map((r,i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i+1}</span>{r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

