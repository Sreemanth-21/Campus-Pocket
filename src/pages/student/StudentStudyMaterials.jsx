import { useState } from 'react'
import { SYLLABUS } from '../../services/syllabusData'
import { generateStudyMaterial } from '../../services/gemini'
import { Sparkles, ChevronRight, BookOpen, Star, HelpCircle,
  FileText, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function StudentStudyMaterials() {
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [material, setMaterial]   = useState(null)
  const [loading, setLoading]     = useState(false)
  const [activeTab, setActiveTab] = useState('summary')
  const [expandedQ, setExpandedQ] = useState(null)

  const subjects = Object.keys(SYLLABUS)

  const loadMaterial = async (subject, chapter) => {
    setSelectedSubject(subject)
    setSelectedChapter(chapter)
    setMaterial(null)
    setLoading(true)
    setActiveTab('summary')
    const result = await generateStudyMaterial(subject, chapter.title, chapter.content)
    setMaterial(result)
    setLoading(false)
  }

  // ── MATERIAL VIEW ──
  if (selectedChapter) {
    const subjectData = SYLLABUS[selectedSubject]
    const TABS = [
      { id: 'summary',   label: 'Summary',    icon: FileText },
      { id: 'keypoints', label: 'Key Points', icon: Star },
      { id: 'questions', label: 'Questions',  icon: HelpCircle },
      { id: 'notes',     label: 'Short Notes',icon: BookOpen },
    ]

    return (
      <div className="max-w-3xl mx-auto fade-in">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4 flex-wrap">
          <button onClick={() => { setSelectedSubject(null); setSelectedChapter(null); setMaterial(null) }}
            className="hover:text-primary-600">Study Materials</button>
          <ChevronRight size={14} />
          <button onClick={() => { setSelectedChapter(null); setMaterial(null) }}
            className="hover:text-primary-600">{selectedSubject}</button>
          <ChevronRight size={14} />
          <span className="text-gray-700 dark:text-gray-300 font-medium">{selectedChapter.title}</span>
        </div>

        {/* Header */}
        <div className={`${subjectData.light} rounded-2xl p-5 mb-5 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{subjectData.icon}</span>
            <div>
              <p className="text-xs text-gray-400 font-medium">{selectedSubject}</p>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selectedChapter.title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-accent-500" />
            <span className="text-xs text-accent-500 font-medium">AI Generated</span>
            <button onClick={() => loadMaterial(selectedSubject, selectedChapter)}
              className="p-1.5 rounded-lg hover:bg-white/50 transition-colors" title="Regenerate">
              <RefreshCw size={14} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="card">
            <div className="flex flex-col items-center py-10 gap-3">
              <div className="w-12 h-12 bg-accent-50 dark:bg-accent-900/20 rounded-2xl flex items-center justify-center">
                <Sparkles size={24} className="text-accent-500 animate-pulse" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Generating study material...</p>
              <p className="text-xs text-gray-400">AI is analyzing the chapter content</p>
              <LoadingSpinner size="sm" />
            </div>
          </div>
        ) : material && (
          <>
            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-5">
              {TABS.map(tab => {
                const Icon = tab.icon
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-white dark:bg-gray-900 text-primary-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}>
                    <Icon size={13} /> <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Summary */}
            {activeTab === 'summary' && (
              <div className="card fade-in">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <FileText size={16} className="text-primary-600" /> Chapter Summary
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {material.summary}
                </p>
              </div>
            )}

            {/* Key Points */}
            {activeTab === 'keypoints' && (
              <div className="card fade-in">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Star size={16} className="text-yellow-500" /> Key Points
                </h3>
                <ul className="space-y-3">
                  {material.keyPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className={`w-6 h-6 ${subjectData.color} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5`}>
                        {i + 1}
                      </span>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{pt}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Important Questions */}
            {activeTab === 'questions' && (
              <div className="space-y-3 fade-in">
                <div className="card">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <HelpCircle size={16} className="text-blue-500" /> Important Questions & Answers
                  </h3>
                  <div className="space-y-3">
                    {material.importantQuestions.map((qa, i) => (
                      <div key={i} className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                          className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                              Q
                            </span>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{qa.q}</p>
                          </div>
                          {expandedQ === i ? <ChevronUp size={14} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />}
                        </button>
                        {expandedQ === i && (
                          <div className="px-4 pb-4 bg-green-50 dark:bg-green-900/10 border-t border-gray-100 dark:border-gray-800 fade-in">
                            <div className="flex items-start gap-2.5 mt-3">
                              <span className="w-5 h-5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                A
                              </span>
                              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{qa.a}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Short Notes */}
            {activeTab === 'notes' && (
              <div className="card fade-in">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <BookOpen size={16} className="text-green-500" /> Short Notes
                </h3>
                <div className={`${subjectData.light} rounded-xl p-4`}>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {material.shortNotes}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  // ── CHAPTER LIST ──
  if (selectedSubject) {
    const subjectData = SYLLABUS[selectedSubject]
    return (
      <div className="max-w-2xl mx-auto fade-in">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <button onClick={() => setSelectedSubject(null)} className="hover:text-primary-600">Study Materials</button>
          <ChevronRight size={14} />
          <span className="text-gray-700 dark:text-gray-300 font-medium">{selectedSubject}</span>
        </div>

        <div className={`${subjectData.light} rounded-2xl p-5 mb-5 flex items-center gap-4`}>
          <span className="text-4xl">{subjectData.icon}</span>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedSubject}</h2>
            <p className="text-sm text-gray-400">Select a chapter to generate AI study material</p>
          </div>
        </div>

        <div className="space-y-2">
          {subjectData.chapters.map((ch, i) => (
            <button key={ch.id} onClick={() => loadMaterial(selectedSubject, ch)}
              className="w-full card flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left group p-4">
              <div className={`w-10 h-10 ${subjectData.color} rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{ch.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">Click to generate AI summary, key points & questions</p>
              </div>
              <div className="flex items-center gap-1 text-accent-500 flex-shrink-0">
                <Sparkles size={13} />
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── SUBJECT GRID ──
  return (
    <div className="space-y-6 fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles size={20} className="text-accent-500" /> AI Study Materials
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">Select a subject → chapter to get AI-generated summaries, key points & questions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {subjects.map(sub => {
          const data = SYLLABUS[sub]
          return (
            <button key={sub} onClick={() => setSelectedSubject(sub)}
              className="card hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-center group p-6">
              <div className={`w-16 h-16 ${data.color} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                {data.icon}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">{sub}</h3>
              <p className="text-xs text-gray-400 mt-1">{data.chapters.length} chapters</p>
              <div className="mt-3 flex items-center justify-center gap-1 text-xs text-accent-500 font-medium">
                <Sparkles size={11} /> AI Ready
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

