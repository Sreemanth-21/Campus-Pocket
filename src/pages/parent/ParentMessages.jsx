import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getMessages, sendMessage, replyMessage } from '../../services/db'
import LoadingSpinner from '../../components/LoadingSpinner'
import { MessageSquare, Send, User } from 'lucide-react'

export default function ParentMessages() {
  const { profile } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading]   = useState(true)
  const [form, setForm]         = useState({ teacher_name:'', message:'' })
  const [sending, setSending]   = useState(false)
  const [replyId, setReplyId]   = useState(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    if (!profile?.id) return
    getMessages(profile.id).then(d => { setMessages(d); setLoading(false) })
  }, [profile?.id])

  const handleSend = async (e) => {
    e.preventDefault(); setSending(true)
    try {
      const msg = await sendMessage(profile.id, form.teacher_name, form.message)
      setMessages(prev => [msg, ...prev])
      setForm({ teacher_name:'', message:'' })
    } finally { setSending(false) }
  }

  const handleReply = async (id) => {
    const updated = await replyMessage(id, replyText)
    setMessages(prev => prev.map(m => m.id === id ? updated : m))
    setReplyId(null); setReplyText('')
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6 fade-in max-w-3xl">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Parent-Teacher Messages</h2>

      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Send size={16} className="text-primary-600" /> New Message
        </h3>
        <form onSubmit={handleSend} className="space-y-3">
          <input type="text" value={form.teacher_name} onChange={e=>setForm(f=>({...f,teacher_name:e.target.value}))}
            className="input" placeholder="Teacher's name" required />
          <textarea value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))}
            className="input min-h-24 resize-none" placeholder="Write your message..." required />
          <button type="submit" disabled={sending} className="btn-primary flex items-center gap-2 disabled:opacity-60">
            <Send size={14} /> {sending?'Sending...':'Send Message'}
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className="card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                  <User size={14} className="text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{msg.teacher_name}</p>
                  <p className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <MessageSquare size={16} className="text-gray-300" />
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">{msg.message}</p>
            </div>
            {msg.reply ? (
              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-3 ml-4 border-l-2 border-primary-300">
                <p className="text-xs text-primary-600 font-medium mb-1">Your reply</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{msg.reply}</p>
              </div>
            ) : replyId === msg.id ? (
              <div className="ml-4 space-y-2">
                <textarea value={replyText} onChange={e=>setReplyText(e.target.value)}
                  className="input min-h-16 resize-none text-sm" placeholder="Write your reply..." />
                <div className="flex gap-2">
                  <button onClick={() => handleReply(msg.id)} className="btn-primary text-sm py-1.5 flex items-center gap-1">
                    <Send size={12} /> Reply
                  </button>
                  <button onClick={() => setReplyId(null)} className="btn-secondary text-sm py-1.5">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setReplyId(msg.id)} className="text-sm text-primary-600 hover:underline ml-4">Reply</button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

