import { demoStudents, demoFees, demoAttendance, demoGrades } from '../../services/mockData'
import { Users, CreditCard, AlertTriangle, TrendingUp, CheckCircle, Clock, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface dark:bg-[#0D1117] border border-border/60 dark:border-[#1a2235] rounded-xl px-3 py-2.5 shadow-lg">
      <p className="text-[11px] text-ink-4 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-[13px] font-bold" style={{ color: p.color }}>{p.value}</p>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const totalStudents  = demoStudents.length
  const lowAttendance  = demoStudents.filter(s => s.attendance_percentage < 75).length
  const allFees        = demoFees
  const totalRevenue   = allFees.filter(f => f.status === 'PAID').reduce((s,f) => s+f.amount, 0)
  const overdueCount   = allFees.filter(f => f.status === 'OVERDUE').length
  const pendingCount   = allFees.filter(f => f.status === 'PENDING').length

  const classDist = ['9','10','11'].map(cls => ({
    class: `Class ${cls}`,
    count: demoStudents.filter(s => s.class === cls).length,
  }))

  const gradeData = demoStudents.map(s => {
    const sg = demoGrades.filter(g => g.student_id === s.id)
    return { name: s.name.split(' ')[0], avg: sg.length ? Math.round(sg.reduce((a,g)=>a+g.score,0)/sg.length) : 0 }
  })

  const feePie = [
    { name:'Paid',    value: allFees.filter(f=>f.status==='PAID').length,    color:'#10B981' },
    { name:'Pending', value: allFees.filter(f=>f.status==='PENDING').length, color:'#F59E0B' },
    { name:'Overdue', value: allFees.filter(f=>f.status==='OVERDUE').length, color:'#EF4444' },
  ]

  const alerts = demoStudents
    .filter(s => s.attendance_percentage < 75)
    .map(s => ({ type:'attendance', msg:`${s.name}`, sub:`Attendance ${s.attendance_percentage}%`, color:'red' }))
  const overdueStudents = [...new Set(demoFees.filter(f=>f.status==='OVERDUE').map(f=>f.student_id))]
    .map(id => demoStudents.find(s=>s.id===id))
    .filter(Boolean)
    .map(s => ({ type:'fee', msg:`${s.name}`, sub:'Fee overdue', color:'amber' }))

  const allAlerts = [...alerts, ...overdueStudents].slice(0, 5)

  const metrics = [
    {
      label: 'Total Students',
      value: totalStudents,
      sub: '+3 this month',
      trend: 'up',
      icon: Users,
      gradient: 'from-brand-500 to-violet-500',
      bg: 'bg-brand-50 dark:bg-brand-950/30',
      text: 'text-brand-600 dark:text-brand-400',
    },
    {
      label: 'Revenue Collected',
      value: `₹${(totalRevenue/1000).toFixed(0)}K`,
      sub: 'This academic year',
      trend: 'up',
      icon: CreditCard,
      gradient: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Low Attendance',
      value: lowAttendance,
      sub: 'Below 75% threshold',
      trend: 'down',
      icon: AlertTriangle,
      gradient: 'from-red-500 to-rose-500',
      bg: 'bg-red-50 dark:bg-red-950/30',
      text: 'text-red-600 dark:text-red-400',
    },
    {
      label: 'Overdue Fees',
      value: overdueCount,
      sub: `${pendingCount} pending`,
      trend: 'down',
      icon: Clock,
      gradient: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      text: 'text-amber-600 dark:text-amber-400',
    },
  ]

  return (
    <div className="space-y-5 fade-in max-w-6xl">

      {/* ── METRIC CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={m.label} className="metric-card group cursor-default"
            style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-ink-4 dark:text-[#3d5070] uppercase tracking-wider mb-2">
                  {m.label}
                </p>
                <p className="text-[28px] font-bold text-ink dark:text-[#F1F5F9] leading-none mb-1.5">
                  {m.value}
                </p>
                <div className="flex items-center gap-1.5">
                  {m.trend === 'up'
                    ? <ArrowUpRight size={12} className="text-emerald-500" />
                    : <ArrowDownRight size={12} className="text-red-400" />}
                  <p className="text-[11px] text-ink-4 dark:text-[#3d5070]">{m.sub}</p>
                </div>
              </div>
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${m.bg}
                group-hover:scale-110 transition-transform duration-200`}>
                <m.icon size={18} className={m.text} />
              </div>
            </div>
            {/* Bottom accent line */}
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl bg-gradient-to-r ${m.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
          </div>
        ))}
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Grade bar chart */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[15px] font-bold text-ink dark:text-[#F1F5F9]">Student Performance</p>
              <p className="text-[11px] text-ink-4 dark:text-[#3d5070] mt-0.5">Average grades across all students</p>
            </div>
            <span className="badge-indigo">Avg Grades</span>
          </div>
          <div className="h-44 sm:h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeData} barSize={22} barGap={4}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={1} />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E6F0" className="dark:stroke-[#1a2235]" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize:11, fill:'#8896A8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0,100]} tick={{ fontSize:11, fill:'#8896A8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill:'rgba(99,102,241,0.06)', radius:8 }} />
                <Bar dataKey="avg" radius={[6,6,0,0]} fill="url(#barGrad)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fee pie */}
        <div className="card">
          <div className="mb-5">
            <p className="text-[15px] font-bold text-ink dark:text-[#F1F5F9]">Fee Status</p>
            <p className="text-[11px] text-ink-4 dark:text-[#3d5070] mt-0.5">Collection overview</p>
          </div>
          <div className="h-44 sm:h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={feePie} cx="50%" cy="50%" innerRadius={42} outerRadius={65}
                  paddingAngle={4} dataKey="value" strokeWidth={0}>
                  {feePie.map((e,i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-3">
            {feePie.map(f => (
              <div key={f.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor:f.color }} />
                  <span className="text-[12px] text-ink-3 dark:text-[#64748B]">{f.name}</span>
                </div>
                <span className="text-[13px] font-bold text-ink dark:text-[#E2E8F0]">{f.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Alerts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                <Activity size={14} className="text-danger" />
              </div>
              <p className="text-[14px] font-bold text-ink dark:text-[#F1F5F9]">Alerts</p>
            </div>
            {allAlerts.length > 0 && (
              <span className="badge-red">{allAlerts.length} active</span>
            )}
          </div>
          <div className="space-y-2">
            {allAlerts.length === 0 ? (
              <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                <CheckCircle size={15} className="text-emerald-500 flex-shrink-0" />
                <p className="text-[13px] font-medium text-emerald-700 dark:text-emerald-400">All students are on track</p>
              </div>
            ) : allAlerts.map((a, i) => (
              <div key={i} className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border
                ${a.color==='red'
                  ? 'bg-red-50/60 dark:bg-red-950/20 border-red-100 dark:border-red-900/30'
                  : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30'}`}>
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${a.color==='red'?'bg-red-500':'bg-amber-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-semibold ${a.color==='red'?'text-red-700 dark:text-red-400':'text-amber-700 dark:text-amber-400'}`}>
                    {a.msg}
                  </p>
                  <p className={`text-[11px] ${a.color==='red'?'text-red-500/70 dark:text-red-500/60':'text-amber-500/70 dark:text-amber-500/60'}`}>
                    {a.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Class distribution */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-xl bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center">
              <Users size={14} className="text-brand-600 dark:text-brand-400" />
            </div>
            <p className="text-[14px] font-bold text-ink dark:text-[#F1F5F9]">Class Distribution</p>
          </div>
          <div className="space-y-4">
            {classDist.map((c, i) => {
              const pct = Math.round((c.count / totalStudents) * 100)
              const colors = ['#6366F1', '#10B981', '#F59E0B']
              return (
                <div key={c.class}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i] }} />
                      <span className="text-[13px] font-semibold text-ink-2 dark:text-[#CBD5E1]">{c.class}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-bold" style={{ color: colors[i] }}>{c.count}</span>
                      <span className="text-[11px] text-ink-4 dark:text-[#3d5070]">students</span>
                    </div>
                  </div>
                  <div className="h-2 bg-surface-3 dark:bg-[#0f1929] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width:`${pct}%`, backgroundColor: colors[i] }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
