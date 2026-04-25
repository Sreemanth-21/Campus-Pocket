import { useState, useRef, useEffect } from 'react'
import { SYLLABUS } from '../../services/syllabusData'
import { solveDoubt } from '../../services/gemini'
import { MessageCircle, Send, Bot, User, ChevronDown, Lock, Sparkles, Trash2 } from 'lucide-react'

export default function StudentDoubtSolver() {
  const [subject, setSubject]   = useState('')
  const [chapter, setChapter]   = useState('')
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const bottomRef = useRef(null)

  const subjects  = Object.keys(SYLLABUS)
  const chapters  = subject ? SYLLABUS[subject].chapters : []
  const chapterObj = chapters.find(c => c.id === chapter)
  const subjectData = subject ? SYLLABUS[subject] : null

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async () => {
    if (!input.trim() || !subject || !chapter || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setLoading(true)
    const answer = await solveDoubt(subject, chapterObj.title, chapterObj.content, userMsg)
    setMessages(prev => [...prev, { role: 'ai', text: answer }])
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const clearChat = () => setMessages([])

  const isReady = subject && chapter

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto fade-in" style={{ minHeight: '70vh' }}>
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageCircle size={20} className="text-primary-600" /> AI Doubt Solver
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">Ask doubts — answers restricted to your selected chapter only</p>
      </div>

      {/* Subject + Chapter selectors */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Lock size={14} className="text-primary-600" />
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Syllabus Scope</p>
          <span className="text-xs text-gray-400 ml-auto">AI answers only from selected chapter</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Subject</label>
            <div className="relative">
              <select
                value={subject}
                onChange={e => { setSubject(e.target.value); setChapter(''); setMessages([]) }}
                className="input appearance-none pr-8"
              >
                <option value="">Select subject</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Chapter</label>
            <div className="relative">
              <select
                value={chapter}
                onChange={e => { setChapter(e.target.value); setMessages([]) }}
                className="input appearance-none pr-8"
                disabled={!subject}
              >
                <option value="">Select chapter</option>
                {chapters.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Active scope badge */}
        {isReady && (
          <div className={`mt-3 flex items-center gap-2 px-3 py-2 ${subjectData.light} rounded-xl`}>
            <span className="text-base">{subjectData.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">
                {subject} → {chapterObj?.title}
              </p>
              <p className="text-xs text-gray-400">AI will only answer from this chapter</p>
            </div>
            <Lock size={12} className="text-green-500 flex-shrink-0" />
          </div>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 card flex flex-col p-0 overflow-hidden" style={{ minHeight: '400px' }}>
        {/* Chat header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
              <Bot size={14} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Campus AI Tutor</p>
              <p className="text-xs text-green-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
                {isReady ? 'Ready' : 'Select subject & chapter'}
              </p>
            </div>
          </div>
          {messages.length > 0 && (
            <button onClick={clearChat} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-10 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 rounded-2xl flex items-center justify-center mb-4">
                <Sparkles size={28} className="text-accent-500" />
              </div>
              <p className="font-semibold text-gray-700 dark:text-gray-300">Ask your doubts</p>
              <p className="text-sm text-gray-400 mt-1 max-w-xs">
                {isReady
                  ? `Ask anything about "${chapterObj?.title}" in ${subject}`
                  : 'Select a subject and chapter above to start'}
              </p>
              {isReady && (
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {['What is the main concept?', 'Give me an example', 'Explain in simple terms'].map(s => (
                    <button key={s} onClick={() => setInput(s)}
                      className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user'
                  ? 'bg-primary-600'
                  : 'bg-gradient-to-br from-primary-500 to-accent-500'
              }`}>
                {msg.role === 'user'
                  ? <User size={14} className="text-white" />
                  : <Bot size={14} className="text-white" />}
              </div>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-tr-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm'
              }`}>
                <p className="whitespace-pre-line">{msg.text}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                <Bot size={14} className="text-white" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1.5 items-center h-5">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!isReady || loading}
              placeholder={isReady ? `Ask about "${chapterObj?.title}"...` : 'Select subject & chapter first'}
              className="input flex-1 resize-none min-h-[44px] max-h-32 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || !isReady || loading}
              className="w-10 h-10 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5 text-center">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}

