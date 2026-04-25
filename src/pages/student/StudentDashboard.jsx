import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getAttendance, getGrades, getTimetable, getExams, subscribeAttendance } from '../../services/db'
import AttendanceRiskBadge from '../../components/AttendanceRiskBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import { CalendarDays, BarChart2, BookOpen, Clock, FileText, Zap, TrendingUp } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const SUBJ_COLOR = {
  Mathematics:'#6366F1', Science:'#10B981', English:'#F59E0B',
  History:'#8B5CF6', Physics:'#EF4444', Chemistry:'#06B6D4',
}

function Ring({ pct, size=80, stroke=7, color='#6366F1' }) {
  const r = (size-stroke)/2, circ = 2*Math.PI*r, offset = circ-(pct/100)*circ
  return (
    <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={stroke} className="ring-track" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition:'stroke-dashoffset 1s ease' }} />
    </svg>
  )
}

export default function StudentDashboard() {
  const { profile } = useAuth()
  const [attendance, setAttendance] = useState([])
  const [grades, setGrades]         = useState([])
  const [timetable, setTimetable]   = useState([])
  const [exams, setExams]           = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    if (!profile?.id) return
    Promise.all([getAttendance(profile.id), getGrades(profile.id), getTimetable(profile.class), getExams(profile.id)])
      .then(([att, gr, tt, ex]) => { setAttendance(att); setGrades(gr); setTimetable(tt); setExams(ex); setLoading(false) })
    const sub = subscribeAttendance(profile.id, () => getAttendance(profile.id).then(setAttendance))
    return () => sub?.unsubscribe?.()
  }, [profile?.id])

  if (loading) return <LoadingSpinner />

  const today         = DAYS[new Date().getDay()]
  const todayClasses  = timetable.filter(t => t.day === today)
  const subjects      = [...new Set(grades.map(g => g.subject))]
  const avgGrade      = grades.length ? Math.round(grades.reduce((s,g)=>s+g.score,0)/grades.length) : 0
  const upcomingExams = exams.filter(e => !e.score && new Date(e.date) >= new Date())
  const att           = profile?.attendance_percentage || 0
  const hour          = new Date().getHours()
  const greeting      = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const trendData     = grades.slice(-8).map(g => ({ date: g.date?.slice(5), score: g.score }))

  const subjectAvgs = subjects.map(sub => {
    const sc = grades.filter(g=>g.subject===sub).map(g=>g.score)
    return { sub, avg: Math.round(sc.reduce((a,b)=>a+b,0)/sc.length) }
  })

  return (
    <div className="space-y-5 fade-in max-w-5xl">

      {/* Hero greeting */}
      <div className="relative overflow-hidden rounded-3xl p-6 text-white"
        style={{ background: 'linear-gradient(135deg, #3730A3 0%, #4F46E5 40%, #7C3AED 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-16 -left-8 w-56 h-56 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)' }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="sgrid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.6"/>
            </pattern></defs>
            <rect width="100%" height="100%" fill="url(#sgrid)" />
          </svg>
        </div>
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-white/60 text-[13px] font-medium">{greeting} 👋</p>
            <h2 className="text-[22px] sm:text-[26px] font-bold mt-0.5 leading-tight">{profile?.name?.split(' ')[0]}</h2>
            <p className="text-white/50 text-[12px] mt-1">
              {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
            </p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <AttendanceRiskBadge percentage={att} />
              <span className="bg-white/15 text-white text-[11px] px-2.5 py-1 rounded-full font-medium">
                Class {profile?.class}{profile?.section}
              </span>
            </div>
          </div>
          {/* Attendance ring */}
          <div className="relative flex-shrink-0">
            <Ring pct={att} size={90} stroke={8} color="rgba(255,255,255,0.9)" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[20px] font-bold text-white">{att}%</span>
              <span className="text-[9px] text-white/60 font-semibold uppercase tracking-wider">Attend</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label:'Avg Grade',    value:`${avgGrade}%`, icon:BarChart2,  color:'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' },
          { label:'Subjects',     value:subjects.length, icon:BookOpen,  color:'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400' },
          { label:'Exams Due',    value:upcomingExams.length, icon:Zap,  color:'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' },
        ].map(s => (
          <div key={s.label} className="card text-center pop-in">
            <div className={`w-9 h-9 ${s.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
              <s.icon size={16} />
            </div>
            <p className="text-[22px] font-bold text-ink dark:text-[#E2E8F0]">{s.value}</p>
            <p className="text-[11px] text-ink-4 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Grade trend */}
        <div className="card lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[14px] font-bold text-ink dark:text-[#E2E8F0] flex items-center gap-2">
                <TrendingUp size={14} className="text-brand-500" /> Grade Trend
              </p>
              <p className="text-[11px] text-ink-4 mt-0.5">Last 8 assessments</p>
            </div>
            <span className={`badge ${avgGrade>=80?'badge-green':avgGrade>=60?'badge-yellow':'badge-red'}`}>
              {avgGrade>=80?'On track':avgGrade>=60?'Average':'Needs work'}
            </span>
          </div>
          <div className="h-36 sm:h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EF" className="dark:stroke-[#1E293B]" />
              <XAxis dataKey="date" tick={{ fontSize:10, fill:'#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0,100]} tick={{ fontSize:10, fill:'#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background:'#fff', border:'1px solid #E4E7EF', borderRadius:10, fontSize:12 }} />
              <Area type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={2.5} fill="url(#g1)" dot={{ r:3, fill:'#6366F1', strokeWidth:0 }} />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </div>

        {/* Today's schedule */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[14px] font-bold text-ink dark:text-[#E2E8F0] flex items-center gap-2">
              <Clock size={14} className="text-brand-500" /> Today
            </p>
            <span className="text-[11px] text-ink-4">{today}</span>
          </div>
          {todayClasses.length === 0
            ? <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="text-3xl mb-2">🎉</span>
                <p className="text-[13px] text-ink-4">No classes today</p>
              </div>
            : <div className="space-y-2">
                {todayClasses.map((cls, i) => (
                  <div key={cls.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${i===0?'bg-brand-50 dark:bg-brand-900/15':'bg-surface-3 dark:bg-[#1E293B]'}`}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: SUBJ_COLOR[cls.subject]||'#94A3B8' }} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-semibold truncate ${i===0?'text-brand-600 dark:text-brand-400':'text-ink dark:text-[#E2E8F0]'}`}>{cls.subject}</p>
                      <p className="text-[11px] text-ink-4">{cls.time}</p>
                    </div>
                    {i===0 && <span className="badge-indigo text-[10px]">Now</span>}
                  </div>
                ))}
              </div>
          }
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Subject performance */}
        <div className="card">
          <p className="text-[14px] font-bold text-ink dark:text-[#E2E8F0] flex items-center gap-2 mb-4">
            <BarChart2 size={14} className="text-brand-500" /> Subject Performance
          </p>
          <div className="space-y-3">
            {subjectAvgs.map(({ sub, avg }) => (
              <div key={sub}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SUBJ_COLOR[sub]||'#94A3B8' }} />
                    <span className="text-[12px] font-medium text-ink-2 dark:text-[#CBD5E1]">{sub}</span>
                  </div>
                  <span className="text-[12px] font-bold" style={{ color: SUBJ_COLOR[sub]||'#94A3B8' }}>{avg}%</span>
                </div>
                <div className="h-1.5 bg-surface-3 dark:bg-[#1E293B] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width:`${avg}%`, backgroundColor: SUBJ_COLOR[sub]||'#94A3B8' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming exams */}
        <div className="card">
          <p className="text-[14px] font-bold text-ink dark:text-[#E2E8F0] flex items-center gap-2 mb-4">
            <FileText size={14} className="text-brand-500" /> Upcoming Exams
          </p>
          {upcomingExams.length === 0
            ? <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="text-3xl mb-2">✅</span>
                <p className="text-[13px] text-ink-4">No upcoming exams</p>
              </div>
            : <div className="space-y-2.5">
                {upcomingExams.map(exam => {
                  const daysLeft = Math.ceil((new Date(exam.date)-new Date())/86400000)
                  return (
                    <div key={exam.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-3 dark:bg-[#1E293B]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[12px] font-bold"
                          style={{ backgroundColor: SUBJ_COLOR[exam.subject]||'#94A3B8' }}>
                          {exam.subject[0]}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-ink dark:text-[#E2E8F0]">{exam.subject}</p>
                          <p className="text-[11px] text-ink-4">{new Date(exam.date).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</p>
                        </div>
                      </div>
                      <span className={daysLeft<=7?'badge-red':'badge-yellow'}>{daysLeft}d left</span>
                    </div>
                  )
                })}
              </div>
          }
        </div>
      </div>
    </div>
  )
}

