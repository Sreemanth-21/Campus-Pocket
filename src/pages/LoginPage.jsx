import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, GraduationCap, Users, BookOpen, ShieldCheck, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'

const DEMO = [
  { role:'student', label:'Student',  icon:GraduationCap, user:'alex.johnson',   pass:'student123', gradient:'from-brand-500 to-violet-500' },
  { role:'parent',  label:'Parent',   icon:Users,         user:'robert.johnson', pass:'parent123',  gradient:'from-emerald-500 to-teal-500' },
  { role:'teacher', label:'Teacher',  icon:BookOpen,      user:'sarah.williams', pass:'teacher123', gradient:'from-violet-500 to-purple-600' },
  { role:'admin',   label:'Admin',    icon:ShieldCheck,   user:'admin',          pass:'admin123',   gradient:'from-rose-500 to-pink-600' },
]

const FEATURES = [
  'Live attendance & grade tracking',
  'AI-powered student insights',
  'Fee management & reminders',
  'Smart timetable scheduling',
  'Parent-teacher communication',
  'Exam & assessment tracker',
]

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const { user } = await login(username, password)
      navigate(`/${user.role}`)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const fill = (u, p) => { setUsername(u); setPassword(p); setError('') }

  return (
    <div className="min-h-screen flex bg-[#060912]">

      {/* ── LEFT HERO ── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-12">
        {/* Background */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1230 40%, #0f0a2e 100%)' }} />

        {/* Mesh gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-30"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)' }} />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.5) 0%, transparent 70%)' }} />
          <div className="absolute top-[40%] right-[10%] w-[300px] h-[300px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)' }} />

          {/* Subtle grid */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="0.8"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Floating dots */}
          <div className="absolute top-[20%] left-[15%] w-1.5 h-1.5 rounded-full bg-brand-400/60" />
          <div className="absolute top-[35%] left-[60%] w-1 h-1 rounded-full bg-violet-400/40" />
          <div className="absolute top-[65%] left-[25%] w-1 h-1 rounded-full bg-emerald-400/40" />
          <div className="absolute top-[75%] left-[70%] w-1.5 h-1.5 rounded-full bg-brand-300/50" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-[17px] leading-tight tracking-tight">Campus Pocket</p>
            <p className="text-white/40 text-[11px] tracking-wide">Smart School Management</p>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 border border-white/10"
              style={{ background: 'rgba(99,102,241,0.15)', backdropFilter: 'blur(8px)' }}>
              <Sparkles size={11} className="text-brand-300" />
              <span className="text-white/80 text-[11px] font-medium tracking-wide">AI-powered school portal</span>
            </div>
            <h1 className="text-[48px] font-bold text-white leading-[1.08] tracking-tight">
              Your school,<br />
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(135deg, #818CF8, #A78BFA)' }}>
                in your pocket.
              </span>
            </h1>
            <p className="text-white/40 text-[15px] mt-5 leading-relaxed max-w-sm">
              Everything you need to manage students, track progress, and stay connected — beautifully unified.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-2.5">
            {FEATURES.map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(99,102,241,0.25)' }}>
                  <CheckCircle2 size={10} className="text-brand-300" />
                </div>
                <span className="text-white/55 text-[13px]">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 grid grid-cols-3 gap-3">
          {[['2K+','Students'],['50+','Teachers'],['99%','Uptime']].map(([v,l]) => (
            <div key={l} className="rounded-2xl p-4 text-center border border-white/8"
              style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(8px)' }}>
              <p className="text-white text-[22px] font-bold tracking-tight">{v}</p>
              <p className="text-white/35 text-[11px] mt-0.5 tracking-wide">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT FORM ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-surface-2 dark:bg-[#060912]">
        <div className="w-full max-w-[400px] fade-in">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
              <GraduationCap size={17} className="text-white" />
            </div>
            <span className="text-[16px] font-bold text-ink dark:text-[#F1F5F9] tracking-tight">Campus Pocket</span>
          </div>

          <div className="mb-8">
            <h2 className="text-[28px] font-bold text-ink dark:text-[#F1F5F9] leading-tight tracking-tight">
              Welcome back
            </h2>
            <p className="text-[14px] text-ink-4 dark:text-[#3d5070] mt-1.5">
              Sign in to your portal to continue
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 px-4 py-3.5 rounded-xl overflow-hidden
              bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-900/40">
              <div className="w-1.5 h-1.5 bg-danger rounded-full flex-shrink-0 mt-1.5" />
              <p className="text-[13px] text-danger font-medium break-words leading-relaxed">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-ink-2 dark:text-[#8896A8] mb-1.5 tracking-wide">
                USERNAME
              </label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                className="input h-11" placeholder="Enter your username" required />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-ink-2 dark:text-[#8896A8] mb-1.5 tracking-wide">
                PASSWORD
              </label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input h-11 pr-11" placeholder="Enter your password" required />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-4 hover:text-ink-2 dark:hover:text-[#8896A8] transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full h-11 text-[14px] mt-2 font-semibold">
              {loading
                ? <span className="flex items-center gap-2.5">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                : <span className="flex items-center gap-2">
                    Sign in
                    <ArrowRight size={15} />
                  </span>}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border/60 dark:bg-[#1a2235]" />
            <span className="text-[11px] text-ink-4 dark:text-[#3d5070] font-medium tracking-wide">DEMO ACCOUNTS</span>
            <div className="flex-1 h-px bg-border/60 dark:bg-[#1a2235]" />
          </div>

          {/* Demo buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            {DEMO.map(d => (
              <button key={d.role} onClick={() => fill(d.user, d.pass)}
                className="group flex items-center gap-2.5 h-11 px-3.5 rounded-xl
                  border border-border/60 dark:border-[#1a2235]
                  bg-surface dark:bg-[#0D1117]
                  hover:border-brand-400/50 dark:hover:border-brand-500/40
                  hover:bg-brand-50/50 dark:hover:bg-brand-950/20
                  transition-all duration-150">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${d.gradient}`}>
                  <d.icon size={12} className="text-white" />
                </div>
                <span className="text-[12px] font-semibold text-ink-2 dark:text-[#8896A8]
                  group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {d.label}
                </span>
              </button>
            ))}
          </div>
          <p className="text-center text-[11px] text-ink-4 dark:text-[#3d5070] mt-3">
            Click any role to auto-fill credentials
          </p>
        </div>
      </div>
    </div>
  )
}
