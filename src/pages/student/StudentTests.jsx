import { useState, useEffect, useRef } from 'react'
import { ONLINE_TESTS } from '../../services/syllabusData'
import { ClipboardList, Clock, CheckCircle, XCircle, ChevronRight,
  AlertCircle, Trophy, RotateCcw, BookOpen } from 'lucide-react'

const SUBJECT_COLORS = {
  Mathematics: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-200 dark:border-blue-800',
  Science:     'bg-green-50 dark:bg-green-900/20 text-green-600 border-green-200 dark:border-green-800',
  Social:      'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 border-yellow-200 dark:border-yellow-800',
  English:     'bg-purple-50 dark:bg-purple-900/20 text-purple-600 border-purple-200 dark:border-purple-800',
}

export default function StudentTests() {
  const [tests, setTests]         = useState(ONLINE_TESTS)
  const [view, setView]           = useState('list')   // list | test | result
  const [activeTest, setActiveTest] = useState(null)
  const [answers, setAnswers]     = useState({})
  const [timeLeft, setTimeLeft]   = useState(0)
  const [result, setResult]       = useState(null)
  const timerRef = useRef(null)

  // Timer
  useEffect(() => {
    if (view === 'test' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0 }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [view, activeTest])

  const startTest = (test) => {
    setActiveTest(test)
    setAnswers({})
    setTimeLeft(test.duration * 60)
    setView('test')
  }

  const handleSubmit = (auto = false) => {
    clearInterval(timerRef.current)
    const test = activeTest
    let score = 0
    const evaluated = test.questions.map(q => {
      if (q.type === 'mcq') {
        const selected = answers[q.id]
        const correct  = selected === q.correct
        if (correct) score += q.marks
        return { ...q, selected, correct, attempted: selected !== undefined }
      } else {
        // descriptive: give partial marks if attempted
        const attempted = !!(answers[q.id]?.trim())
        if (attempted) score += Math.floor(q.marks * 0.6) // partial credit
        return { ...q, userAnswer: answers[q.id] || '', attempted }
      }
    })
    setResult({ score, total: test.totalMarks, questions: evaluated, autoSubmit: auto })
    setTests(prev => prev.map(t => t.id === test.id ? { ...t, status: 'completed', score } : t))
    setView('result')
  }

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  const pct = result ? Math.round(result.score / result.total * 100) : 0

  // ── LIST VIEW ──
  if (view === 'list') return (
    <div className="space-y-6 fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ClipboardList size={20} className="text-primary-600" /> Online Tests
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">Tests assigned by your teachers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tests.map(test => (
          <div key={test.id} className="card hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${SUBJECT_COLORS[test.subject] || ''}`}>
                {test.subject}
              </span>
              {test.status === 'completed'
                ? <span className="badge-green flex items-center gap-1"><CheckCircle size={11} /> Done</span>
                : <span className="badge-yellow flex items-center gap-1"><Clock size={11} /> Pending</span>}
            </div>

            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{test.title}</h3>
            <p className="text-xs text-gray-400 mb-3">Chapter: {test.chapter}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4 text-center">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{test.questions.length}</p>
                <p className="text-xs text-gray-400">Questions</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{test.totalMarks}</p>
                <p className="text-xs text-gray-400">Marks</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{test.duration}m</p>
                <p className="text-xs text-gray-400">Time</p>
              </div>
            </div>

            {test.status === 'completed' ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Your Score</p>
                  <p className={`text-lg font-bold ${test.score / test.totalMarks >= 0.7 ? 'text-green-600' : 'text-red-600'}`}>
                    {test.score}/{test.totalMarks}
                  </p>
                </div>
                <button onClick={() => startTest(test)} className="btn-secondary text-xs flex items-center gap-1">
                  <RotateCcw size={12} /> Retry
                </button>
              </div>
            ) : (
              <button onClick={() => startTest(test)} className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
                Start Test <ChevronRight size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  // ── TEST VIEW ──
  if (view === 'test') return (
    <div className="max-w-3xl mx-auto space-y-4 fade-in">
      {/* Header */}
      <div className="card flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white">{activeTest.title}</h2>
          <p className="text-xs text-gray-400">{activeTest.subject} • {activeTest.chapter}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg ${timeLeft < 120 ? 'bg-red-50 dark:bg-red-900/20 text-red-600' : 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'}`}>
          <Clock size={18} /> {fmt(timeLeft)}
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span>{Object.keys(answers).length}/{activeTest.questions.length} answered</span>
        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 rounded-full transition-all"
            style={{ width: `${Object.keys(answers).length / activeTest.questions.length * 100}%` }} />
        </div>
      </div>

      {/* Questions */}
      {activeTest.questions.map((q, idx) => (
        <div key={q.id} className="card">
          <div className="flex items-start gap-3 mb-4">
            <span className="w-7 h-7 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
              {idx + 1}
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${q.type === 'mcq' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                  {q.type === 'mcq' ? 'MCQ' : 'Descriptive'}
                </span>
                <span className="text-xs text-gray-400">{q.marks} mark{q.marks > 1 ? 's' : ''}</span>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{q.question}</p>
            </div>
          </div>

          {q.type === 'mcq' ? (
            <div className="space-y-2 ml-10">
              {q.options.map((opt, oi) => (
                <label key={oi} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  answers[q.id] === oi
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }`}>
                  <input type="radio" name={q.id} className="hidden"
                    checked={answers[q.id] === oi}
                    onChange={() => setAnswers(a => ({ ...a, [q.id]: oi }))} />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    answers[q.id] === oi ? 'border-primary-500' : 'border-gray-300'
                  }`}>
                    {answers[q.id] === oi && <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{opt}</span>
                </label>
              ))}
            </div>
          ) : (
            <textarea
              className="input ml-10 min-h-24 resize-none text-sm"
              placeholder="Write your answer here..."
              value={answers[q.id] || ''}
              onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
            />
          )}
        </div>
      ))}

      <div className="flex gap-3 pb-6">
        <button onClick={() => setView('list')} className="btn-secondary flex-1">Cancel</button>
        <button onClick={() => handleSubmit(false)} className="btn-primary flex-1 flex items-center justify-center gap-2">
          <CheckCircle size={16} /> Submit Test
        </button>
      </div>
    </div>
  )

  // ── RESULT VIEW ──
  if (view === 'result') return (
    <div className="max-w-3xl mx-auto space-y-5 fade-in">
      {/* Score card */}
      <div className={`card text-center py-8 ${pct >= 70 ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' : 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20'}`}>
        {result.autoSubmit && (
          <div className="flex items-center justify-center gap-2 text-orange-600 text-sm mb-3">
            <AlertCircle size={16} /> Time's up! Auto-submitted.
          </div>
        )}
        <Trophy size={48} className={`mx-auto mb-3 ${pct >= 70 ? 'text-green-500' : 'text-orange-500'}`} />
        <p className="text-5xl font-bold text-gray-900 dark:text-white">{result.score}<span className="text-2xl text-gray-400">/{result.total}</span></p>
        <p className="text-lg font-semibold mt-1 text-gray-600 dark:text-gray-400">{pct}%</p>
        <p className={`text-sm font-medium mt-2 ${pct >= 70 ? 'text-green-600' : 'text-red-600'}`}>
          {pct >= 90 ? '🌟 Excellent!' : pct >= 70 ? '✅ Good job!' : pct >= 50 ? '📚 Keep practicing' : '💪 Needs improvement'}
        </p>
      </div>

      {/* Answer review */}
      <h3 className="font-semibold text-gray-900 dark:text-white">Answer Review</h3>
      {result.questions.map((q, idx) => (
        <div key={q.id} className={`card border-l-4 ${
          q.type === 'mcq'
            ? q.correct ? 'border-l-green-500' : 'border-l-red-500'
            : q.attempted ? 'border-l-blue-500' : 'border-l-gray-300'
        }`}>
          <div className="flex items-start gap-2 mb-3">
            <span className="text-xs font-bold text-gray-400 mt-0.5">Q{idx + 1}.</span>
            <p className="text-sm font-medium text-gray-900 dark:text-white flex-1">{q.question}</p>
            {q.type === 'mcq' && (
              q.correct
                ? <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                : <XCircle size={18} className="text-red-500 flex-shrink-0" />
            )}
          </div>

          {q.type === 'mcq' ? (
            <div className="space-y-1.5 ml-5">
              {q.options.map((opt, oi) => (
                <div key={oi} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                  oi === q.correct ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium' :
                  oi === q.selected && !q.correct ? 'bg-red-50 dark:bg-red-900/20 text-red-600 line-through' :
                  'text-gray-500'
                }`}>
                  {oi === q.correct && <CheckCircle size={13} className="text-green-500 flex-shrink-0" />}
                  {oi === q.selected && !q.correct && <XCircle size={13} className="text-red-500 flex-shrink-0" />}
                  {oi !== q.correct && oi !== q.selected && <span className="w-3.5" />}
                  {opt}
                </div>
              ))}
            </div>
          ) : (
            <div className="ml-5 space-y-2">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Your answer:</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{q.userAnswer || '(not attempted)'}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <p className="text-xs text-green-600 font-medium mb-1">Sample answer:</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{q.sampleAnswer}</p>
              </div>
            </div>
          )}

          {q.explanation && (
            <div className="mt-2 ml-5 flex items-start gap-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-lg">
              <BookOpen size={12} className="flex-shrink-0 mt-0.5" />
              <span><strong>Explanation:</strong> {q.explanation}</span>
            </div>
          )}
        </div>
      ))}

      <button onClick={() => setView('list')} className="btn-primary w-full flex items-center justify-center gap-2 mb-6">
        Back to Tests
      </button>
    </div>
  )
}

