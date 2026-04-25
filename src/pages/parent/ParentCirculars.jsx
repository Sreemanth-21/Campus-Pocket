import { useState, useEffect } from 'react'
import { getCirculars } from '../../services/db'
import LoadingSpinner from '../../components/LoadingSpinner'
import { Megaphone, Download, ChevronDown, ChevronUp, Calendar } from 'lucide-react'

export default function ParentCirculars() {
  const [circulars, setCirculars] = useState([])
  const [expanded, setExpanded]   = useState(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    getCirculars().then(d => { setCirculars(d); setLoading(false) })
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6 fade-in max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Megaphone size={20} className="text-primary-600" /> Circulars & Announcements
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">Official notices from the school</p>
      </div>

      <div className="space-y-3">
        {circulars.map(c => (
          <div key={c.id} className="card p-0 overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
              onClick={() => setExpanded(expanded===c.id ? null : c.id)}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Megaphone size={16} className="text-primary-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{c.title}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Calendar size={11} />
                    {new Date(c.created_at).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                {c.has_file && <span className="badge-blue hidden sm:inline-flex">Attachment</span>}
                {expanded===c.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </div>
            </button>
            {expanded===c.id && (
              <div className="px-4 pb-4 border-t border-gray-50 dark:border-gray-800 fade-in">
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 leading-relaxed">{c.description}</p>
                {c.has_file && (
                  <button className="mt-3 flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
                    <Download size={14} /> Download Circular (PDF)
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

