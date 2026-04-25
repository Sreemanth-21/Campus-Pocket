import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getChildrenOfParent, getFees, getGrades, getExams, findStudentByCredentials, linkChildToParent } from '../../services/db'
import AttendanceRiskBadge from '../../components/AttendanceRiskBadge'
import StudentDetailModal from '../../components/StudentDetailModal'
import LoadingSpinner from '../../components/LoadingSpinner'
import { CreditCard, BarChart2, Plus, X, CheckCircle, ChevronRight, AlertTriangle, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

function Ring({ pct, size=56, stroke=5, color='#6366F1' }) {
  const r=(size-stroke)/2, circ=2*Math.PI*r, offset=circ-(pct/100)*circ
  return (
    <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={stroke} className="ring-track" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition:'stroke-dashoffset 1s ease' }} />
    </svg>
  )
}

// (phone resolution handled in admin/teacher portals)

export default function ParentDashboard() {
  const { profile } = useAuth()
  const [children, setChildren]       = useState([])
  const [childData, setChildData]     = useState({})
  const [loading, setLoading]         = useState(true)
  const [showAdd, setShowAdd]         = useState(false)
  const [addUsername, setAddUsername] = useState('')
  const [addPassword, setAddPassword] = useState('')
  const [showAddPass, setShowAddPass] = useState(false)
  const [addError, setAddError]       = useState('')
  const [addSuccess, setAddSuccess]   = useState('')
  const [selected, setSelected]       = useState(null)

  const load = async () => {
    if (!profile?.id) return
    const kids = await getChildrenOfParent(profile.id)
    setChildren(kids)
    const data = {}
    await Promise.all(kids.map(async kid => {
      const [fees, grades, exams] = await Promise.all([
        getFees(kid.id),
        getGrades(kid.id),
        getExams(kid.id),
      ])
      data[kid.id] = { fees, grades, exams }
    }))
    setChildData(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [profile?.id])

  const handleAdd = async (e) => {
    e.preventDefault(); setAddError('')
    try {
      const student = await findStudentByCredentials(addUsername, addPassword)
      if (!student) { setAddError('No student found with that username'); return }
      if (children.find(c => c.id === student.id)) { setAddError('This child is already linked to your account'); return }
      await linkChildToParent(profile.id, student.id)
      setAddSuccess(`${student.name} has been added!`)
      setAddUsername('')
      setAddPassword('')
      await load()
      setTimeout(() => { setAddSuccess(''); setShowAdd(false) }, 2500)
    } catch (err) {
      if (err.message === 'Invalid password') {
        setAddError('Incorrect password. Please check and try again.')
      } else {
        setAddError(err.message || 'Something went wrong. Please try again.')
      }
    }
  }

  const closeAddModal = () => {
    setShowAdd(false)
    setAddUsername('')
    setAddPassword('')
    setAddError('')
    setAddSuccess('')
  }

  if (loading) return <LoadingSpinner />

  const alerts = [
    ...children.filter(c => c.attendance_percentage < 75).map(c => ({
      type:'att', msg:`${c.name}'s attendance is ${c.attendance_percentage}% — below 75%`
    })),
    ...children.filter(c => (childData[c.id]?.fees||[]).some(f=>f.status==='OVERDUE')).map(c => ({
      type:'fee', msg:`${c.name} has overdue fees — please clear them`
    })),
  ]

  return (
    <div className="space-y-5 fade-in max-w-5xl">

      {/* ── HERO ── */}
      <div className="relative overflow-hidden rounded-3xl p-6 text-white"
        style={{ background:'linear-gradient(135deg, #065F46 0%, #059669 40%, #0D9488 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-16 -left-8 w-48 h-48 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)' }} />
        </div>
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-white/60 text-[13px]">Parent Portal 👋</p>
            <h2 className="text-[26px] font-bold mt-0.5">{profile?.name?.split(' ')[0]}</h2>
            <p className="text-white/50 text-[12px] mt-1">
              {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
            </p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="bg-white/15 text-white text-[11px] px-2.5 py-1 rounded-full font-medium">
                {children.length} {children.length===1?'child':'children'} linked
              </span>
              {alerts.length > 0 && (
                <span className="bg-red-400/30 text-white text-[11px] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                  <AlertTriangle size={10} /> {alerts.length} alert{alerts.length>1?'s':''}
                </span>
              )}
            </div>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-[12px] font-semibold px-3.5 py-2 rounded-xl transition-all flex-shrink-0">
            <Plus size={14} /> Add Child
          </button>
        </div>
      </div>

      {/* ── ALERTS ── */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
              a.type==='att'
                ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30'
                : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30'
            }`}>
              <AlertTriangle size={14} className={a.type==='att'?'text-danger':'text-warning'} />
              <p className={`text-[13px] font-medium flex-1 ${a.type==='att'?'text-red-700 dark:text-red-400':'text-amber-700 dark:text-amber-400'}`}>
                {a.msg}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── ADD CHILD MODAL ── */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4">
          <div className="bg-surface dark:bg-[#0D1117] rounded-none sm:rounded-2xl border-0 sm:border border-border/60 dark:border-[#1a2235]
            w-full h-full sm:w-auto sm:h-auto sm:max-w-sm
            shadow-xl dark:shadow-[0_24px_64px_rgba(0,0,0,0.5)]
            slide-up flex flex-col">

            <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 dark:border-[#1a2235]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #059669, #0D9488)' }}>
                  <ShieldCheck size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-ink dark:text-[#F1F5F9]">Add Child</p>
                  <p className="text-[11px] text-ink-4 dark:text-[#3d5070]">Verify with student credentials</p>
                </div>
              </div>
              <button onClick={closeAddModal} className="btn-ghost p-2 w-8 h-8 min-w-0 min-h-0">
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {addSuccess ? (
                <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                    <CheckCircle size={28} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-ink dark:text-[#F1F5F9]">Child Added!</p>
                    <p className="text-[13px] text-ink-4 dark:text-[#3d5070] mt-1">{addSuccess}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAdd} className="space-y-4">
                  <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl
                    bg-brand-50 dark:bg-brand-950/20 border border-brand-100/60 dark:border-brand-900/30">
                    <ShieldCheck size={13} className="text-brand-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[12px] text-brand-700 dark:text-brand-400 leading-relaxed">
                      Enter your child's login credentials to verify their identity before linking.
                    </p>
                  </div>

                  {addError && (
                    <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl
                      bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/30">
                      <div className="w-1.5 h-1.5 bg-danger rounded-full flex-shrink-0 mt-1.5" />
                      <p className="text-[12px] text-danger font-medium leading-relaxed">{addError}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-ink-2 dark:text-[#8896A8] mb-1.5 uppercase tracking-wider">
                      Student Username
                    </label>
                    <input value={addUsername} onChange={e => setAddUsername(e.target.value)}
                      className="input h-11" placeholder="e.g. priya.sharma" autoComplete="off" required />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-ink-2 dark:text-[#8896A8] mb-1.5 uppercase tracking-wider">
                      Student Password
                    </label>
                    <div className="relative">
                      <input type={showAddPass ? 'text' : 'password'} value={addPassword}
                        onChange={e => setAddPassword(e.target.value)}
                        className="input h-11 pr-11" placeholder="Enter student's password"
                        autoComplete="new-password" required />
                      <button type="button" onClick={() => setShowAddPass(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-4 hover:text-ink-2 dark:hover:text-[#8896A8] transition-colors">
                        {showAddPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-ink-4 dark:text-[#3d5070]">
                    Demo: <span className="font-semibold text-ink-3 dark:text-[#64748B]">priya.sharma</span> · <span className="font-semibold text-ink-3 dark:text-[#64748B]">student123</span>
                  </p>

                  <button type="submit" className="btn-primary w-full h-11 mt-1">
                    Verify &amp; Add Child
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {selected && <StudentDetailModal student={selected} onClose={() => setSelected(null)} />}

      {/* ── CHILDREN CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children.map(child => {
          const { fees=[], grades=[], exams=[] } = childData[child.id] || {}
          const avgGrade   = grades.length ? Math.round(grades.reduce((s,g)=>s+g.score,0)/grades.length) : 0
          const hasOverdue = fees.some(f=>f.status==='OVERDUE')
          const hasPending = fees.some(f=>f.status==='PENDING')
          const feeStatus  = hasOverdue?'OVERDUE':hasPending?'PENDING':'PAID'
          const att        = child.attendance_percentage
          const trendData  = grades.slice(-6).map(g=>({ date:g.date?.slice(5), score:g.score }))

          return (
            <div key={child.id} className="card-hover group relative"
              onClick={() => setSelected(child)}>

              {/* Card header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-[16px] font-bold flex-shrink-0"
                    style={{ background:'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>
                    {child.name[0]}
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-ink dark:text-[#E2E8F0]">{child.name}</p>
                    <p className="text-[11px] text-ink-4 dark:text-[#3d5070]">Class {child.class} · Sec {child.section}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AttendanceRiskBadge percentage={att} />
                  <ChevronRight size={14} className="text-border dark:text-[#1a2235] group-hover:text-brand-500 transition-colors" />
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="flex flex-col items-center justify-center py-3 rounded-xl bg-surface-3 dark:bg-[#0f1929]">
                  <div className="relative">
                    <Ring pct={att} size={44} stroke={4} color={att>=85?'#10B981':att>=75?'#F59E0B':'#EF4444'} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-ink dark:text-[#E2E8F0]">{att}%</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-ink-4 dark:text-[#3d5070] mt-1.5">Attend.</p>
                </div>

                <div className="flex flex-col items-center justify-center py-3 rounded-xl bg-surface-3 dark:bg-[#0f1929]">
                  <BarChart2 size={14} className="text-brand-500 mb-1" />
                  <p className="text-[16px] font-bold text-ink dark:text-[#E2E8F0]">{avgGrade}%</p>
                  <p className="text-[10px] text-ink-4 dark:text-[#3d5070]">Grade</p>
                </div>

                <div className={`flex flex-col items-center justify-center py-3 rounded-xl ${
                  hasOverdue ? 'bg-red-50 dark:bg-red-950/20'
                  : hasPending ? 'bg-amber-50 dark:bg-amber-950/20'
                  : 'bg-emerald-50 dark:bg-emerald-950/20'
                }`}>
                  <CreditCard size={14} className={`mb-1 ${hasOverdue?'text-danger':hasPending?'text-warning':'text-success'}`} />
                  <p className={`text-[9px] font-bold ${hasOverdue?'text-danger':hasPending?'text-warning':'text-success'}`}>
                    {feeStatus}
                  </p>
                  <p className="text-[10px] text-ink-4 dark:text-[#3d5070]">Fees</p>
                </div>
              </div>

              {/* Mini grade trend */}
              {trendData.length > 0 && (
                <div className="h-12 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <Line type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={2} dot={false} />
                      <Tooltip
                        contentStyle={{ background:'#fff', border:'1px solid #E2E6F0', borderRadius:8, fontSize:11 }}
                        cursor={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
