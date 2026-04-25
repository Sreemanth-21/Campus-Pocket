import { useState } from 'react'
import { SYLLABUS } from '../../services/syllabusData'
import { BookOpen, ChevronRight, ChevronLeft, List } from 'lucide-react'

export default function StudentTextbook() {
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(null)

  const subjects = Object.keys(SYLLABUS)

  // ── CHAPTER CONTENT VIEW ──
  if (selectedChapter) {
    const subjectData = SYLLABUS[selectedSubject]
    const paragraphs  = selectedChapter.content.split('. ').reduce((acc, s, i) => {
      const idx = Math.floor(i / 3)
      if (!acc[idx]) acc[idx] = []
      acc[idx].push(s)
      return acc
    }, [])

    return (
      <div className="max-w-3xl mx-auto fade-in">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4 flex-wrap">
          <button onClick={() => { setSelectedSubject(null); setSelectedChapter(null) }}
            className="hover:text-primary-600 transition-colors">Textbook</button>
          <ChevronRight size={14} />
          <button onClick={() => setSelectedChapter(null)} className="hover:text-primary-600 transition-colors">
            {selectedSubject}
          </button>
          <ChevronRight size={14} />
          <span className="text-gray-700 dark:text-gray-300 font-medium">{selectedChapter.title}</span>
        </div>

        {/* Chapter header */}
        <div className={`${subjectData.light} rounded-2xl p-6 mb-6 border border-gray-100 dark:border-gray-800`}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{subjectData.icon}</span>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{selectedSubject}</p>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedChapter.title}</h1>
            </div>
          </div>
        </div>

        {/* Chapter navigation */}
        <div className="flex items-center justify-between mb-6">
          {(() => {
            const chapters = SYLLABUS[selectedSubject].chapters
            const idx = chapters.findIndex(c => c.id === selectedChapter.id)
            return (
              <>
                <button
                  disabled={idx === 0}
                  onClick={() => setSelectedChapter(chapters[idx - 1])}
                  className="btn-secondary flex items-center gap-1.5 text-sm disabled:opacity-40"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <span className="text-xs text-gray-400">Chapter {idx + 1} of {chapters.length}</span>
                <button
                  disabled={idx === chapters.length - 1}
                  onClick={() => setSelectedChapter(chapters[idx + 1])}
                  className="btn-secondary flex items-center gap-1.5 text-sm disabled:opacity-40"
                >
                  Next <ChevronRight size={14} />
                </button>
              </>
            )
          })()}
        </div>

        {/* Content — textbook style */}
        <div className="card prose-sm max-w-none">
          <div className="space-y-5">
            {paragraphs.map((para, i) => (
              <div key={i}>
                {i === 0 && (
                  <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <span className={`w-1 h-5 ${subjectData.color} rounded-full inline-block`} />
                    Introduction
                  </h2>
                )}
                {i === 1 && (
                  <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <span className={`w-1 h-5 ${subjectData.color} rounded-full inline-block`} />
                    Key Concepts
                  </h2>
                )}
                {i === 2 && (
                  <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <span className={`w-1 h-5 ${subjectData.color} rounded-full inline-block`} />
                    Applications & Examples
                  </h2>
                )}
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {para.join('. ')}.
                </p>
              </div>
            ))}
          </div>

          {/* Key terms box */}
          <div className={`mt-6 p-4 ${subjectData.light} rounded-xl border border-gray-100 dark:border-gray-800`}>
            <h3 className={`text-sm font-bold ${subjectData.text} mb-2 flex items-center gap-2`}>
              <BookOpen size={14} /> Remember This
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {selectedChapter.content.split('.')[0]}.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── CHAPTER LIST VIEW ──
  if (selectedSubject) {
    const subjectData = SYLLABUS[selectedSubject]
    return (
      <div className="max-w-2xl mx-auto fade-in">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <button onClick={() => setSelectedSubject(null)} className="hover:text-primary-600 transition-colors">
            Textbook
          </button>
          <ChevronRight size={14} />
          <span className="text-gray-700 dark:text-gray-300 font-medium">{selectedSubject}</span>
        </div>

        <div className={`${subjectData.light} rounded-2xl p-5 mb-5 flex items-center gap-4`}>
          <span className="text-4xl">{subjectData.icon}</span>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedSubject}</h2>
            <p className="text-sm text-gray-400">{subjectData.chapters.length} chapters • Class 10</p>
          </div>
        </div>

        <div className="space-y-2">
          {subjectData.chapters.map((ch, i) => (
            <button key={ch.id} onClick={() => setSelectedChapter(ch)}
              className="w-full card flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left group p-4">
              <div className={`w-10 h-10 ${subjectData.color} rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{ch.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{ch.content.slice(0, 80)}...</p>
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-primary-500 transition-colors flex-shrink-0" />
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
          <BookOpen size={20} className="text-primary-600" /> Digital Textbook
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">Select a subject to browse chapters</p>
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
              <div className={`mt-3 text-xs font-medium ${data.text} flex items-center justify-center gap-1`}>
                Open <ChevronRight size={12} />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

