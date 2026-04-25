import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getChildrenOfParent, getFees, getGrades, getAttendance, getExams } from '../../services/db'
import { askParentBot, getSuggestedQuestions } from '../../services/parentBot'
import { Bot, Send, User, Sparkles, RefreshCw, Trash2, ChevronRight } from 'lucide-react'

// Render markdown-style bold (**text**) and bullet points
function BotMessage({ text }) {
  const lines = text.split('\n')
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />
        // Bold: **text**
        const parts = line.split(/\*\*(.*?)\*\*/g)
        const rendered = parts.map((p, j) =>
          j % 2 === 1 ? <strong key={j} className="font-semibold text-[#111827] dark:text-[#F0F0F0]">{p}</strong> : p
        )
        // Bullet
        if (line.trim().startsWith('•')) {
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="text-[#5B5FEF] mt-0.5 flex-shrink-0">•</span>
              <span>{rendered}</span>
            </div>
          )
        }
        // Heading (starts with emoji + **)
        if (line.match(/^[📅📊📝💰👨‍👩‍👧📋⚠️✅🔴🌟👍📚🏆📉🤔👋]/)) {
          return <p key={i} className="font-semibold text-[#111827] dark:text-[#F0F0F0] mt-1">{rendered}</p>
        }
        return <p key={i}>{rendered}</p>
      })}
    </div>
  )
}

export default function ParentBot() {
  const { profile } = useAuth()
  const [children, setChildren]   = useState([])
  const [childData, setChildData] = useState({})
  const [attendance, setAttendance] = useState({})
  const [grades, setGrades]       = useState({})
  const [fees, setFees]           = useState({})
  const [exams, setExams]         = useState({})
  const [dataLoaded, setDataLoaded] = useState(false)

  const [messages, setMessages]   = useState([
    {
      id: 1, role: 'bot',
      text: "👋 Hi! I'm your Campus Pocket assistant.\n\nI can answer questions about your children's **attendance**, **grades**, **fees**, **exams**, and more.\n\nTry asking something like:\n• \"How many days did Alex miss school?\"\n• \"What are the pending fees?\"\n• \"Give me a progress report\"",
      source: 'local',
    }
  ])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  // Load all child data on mount
  useEffect(() => {
    if (!profile?.id) return
    const load = async () => {
      const kids = await getChildrenOfParent(profile.id)
      setChildren(kids)
      const att = {}, gr = {}, fe = {}, ex = {}, cd = {}
      await Promise.all(kids.map(async kid => {
        const [a, g, f, e] = await Promise.all([
          getAttendance(kid.id), getGrades(kid.id),
          getFees(kid.id), getExams(kid.id),
        ])
        att[kid.id] = a; gr[kid.id] = g
        fe[kid.id]  = f; ex[kid.id] = e
        cd[kid.id]  = {}
      }))
      setAttendance(att); setGrades(gr)
      setFees(fe); setExams(ex); setChildData(cd)
      setDataLoaded(true)
    }
    load()
  }, [profile?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text) => {
    const q = (text || input).trim()
    if (!q || loading) return
    setInput('')

    // Add user message
    const userMsg = { id: Date.now(), role: 'user', text: q }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const { text: answer, source } = await askParentBot(
        q, children, childData, attendance, grades, fees, exams
      )
      setMessages(prev => [...prev, { id: Date.now()+1, role: 'bot', text: answer, source }])
    } catch {
      setMessages(prev => [...prev, { id: Date.now()+1, role: 'bot', text: "Sorry, I couldn't process that. Please try again.", source: 'local' }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const clearChat = () => {
    setMessages([{
      id: Date.now(), role: 'bot',
      text: "Chat cleared! Ask me anything about your children's school progress.",
      source: 'local',
    }])
  }

  const suggestions = getSuggestedQuestions(children)

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-2rem)] max-w-3xl mx-auto fade-in">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h2 className="text-[20px] font-bold text-[#111827] dark:text-[#F0F0F0] flex items-center gap-2">
            <Bot size={20} className="text-[#5B5FEF]" /> Campus Assistant
          </h2>
          <p className="text-[13px] text-[#6B7280] mt-0.5">
            Ask anything about your children's school progress
            {dataLoaded && <span className="ml-2 text-green-500 font-medium">● Live data</span>}
          </p>
        </div>
        <button onClick={clearChat} className="btn-ghost p-2 text-[#9CA3AF] hover:text-red-500" title="Clear chat">
          <Trash2 size={16} />
        </button>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-[#1A1A1A] rounded-2xl border border-border dark:border-[#1E293B] flex flex-col">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user'
                  ? 'bg-[#5B5FEF]'
                  : 'bg-gradient-to-br from-[#5B5FEF] to-purple-500'
              }`}>
                {msg.role === 'user'
                  ? <User size={14} className="text-white" />
                  : <Bot size={14} className="text-white" />}
              </div>

              {/* Bubble */}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#5B5FEF] text-white rounded-tr-sm'
                  : 'bg-surface-3 dark:bg-[#1E293B] text-[#374151] dark:text-[#D1D5DB] rounded-tl-sm'
              }`}>
                {msg.role === 'bot'
                  ? <BotMessage text={msg.text} />
                  : <p>{msg.text}</p>}
                {msg.role === 'bot' && msg.source === 'gemini' && (
                  <div className="flex items-center gap-1 mt-2 pt-2 border-t border-[#E5E7EB] dark:border-[#333]">
                    <Sparkles size={10} className="text-[#5B5FEF]" />
                    <span className="text-[10px] text-[#9CA3AF]">Powered by Gemini AI</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5B5FEF] to-purple-500 flex items-center justify-center flex-shrink-0">
                <Bot size={14} className="text-white" />
              </div>
              <div className="bg-surface-3 dark:bg-[#1E293B] rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1.5 items-center h-5">
                  {[0, 150, 300].map(delay => (
                    <span key={delay} className="w-2 h-2 bg-[#9CA3AF] rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggested questions — show only at start */}
        {messages.length <= 1 && (
          <div className="px-4 pb-3 flex-shrink-0">
            <p className="text-[11px] text-[#9CA3AF] font-medium mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.slice(0, 4).map((s, i) => (
                <button key={i} onClick={() => send(s)}
                  className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-xl bg-surface-3 dark:bg-[#1E293B] text-[#374151] dark:text-[#D1D5DB] hover:bg-[#EEF2FF] dark:hover:bg-[#5B5FEF]/15 hover:text-[#5B5FEF] transition-all">
                  {s} <ChevronRight size={11} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-border dark:border-[#1E293B] flex-shrink-0">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              disabled={loading}
              placeholder="Ask about attendance, grades, fees, exams..."
              rows={1}
              className="input flex-1 resize-none min-h-[44px] max-h-28 py-2.5 text-[13px] disabled:opacity-50"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="w-10 h-10 bg-[#5B5FEF] hover:bg-[#4A4ED8] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
            >
              {loading
                ? <RefreshCw size={15} className="animate-spin" />
                : <Send size={15} />}
            </button>
          </div>
          <p className="text-[11px] text-[#9CA3AF] mt-1.5 text-center">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}

