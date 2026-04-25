import { demoStudents, demoGrades, demoFees, demoAttendance } from '../../services/mockData'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'

const COLORS = ['#5B5FEF','#10B981','#F59E0B','#EF4444','#8B5CF6','#06B6D4']

export default function AdminAnalytics() {
  // Attendance by class
  const attByClass = ['9','10','11'].map(cls => {
    const students = demoStudents.filter(s => s.class === cls)
    const avg = students.length ? Math.round(students.reduce((a,s)=>a+s.attendance_percentage,0)/students.length) : 0
    return { class:`Class ${cls}`, avg }
  })

  // Grade distribution
  const allGrades = demoGrades.map(g => g.score)
  const gradeDist = [
    { range:'90-100', count:allGrades.filter(s=>s>=90).length },
    { range:'80-89',  count:allGrades.filter(s=>s>=80&&s<90).length },
    { range:'70-79',  count:allGrades.filter(s=>s>=70&&s<80).length },
    { range:'60-69',  count:allGrades.filter(s=>s>=60&&s<70).length },
    { range:'<60',    count:allGrades.filter(s=>s<60).length },
  ]

  // Subject averages
  const subjects = [...new Set(demoGrades.map(g=>g.subject))]
  const subjectAvg = subjects.map(sub => {
    const scores = demoGrades.filter(g=>g.subject===sub).map(g=>g.score)
    return { subject:sub.slice(0,4), avg:Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) }
  })

  // Fee collection trend (mock monthly)
  const feeMonths = ['Jan','Feb','Mar','Apr','May','Jun'].map((m,i) => ({
    month:m, collected:(i+1)*45000, target:90000
  }))

  // Top performers
  const topStudents = demoStudents.map(s => {
    const grades = demoGrades.filter(g=>g.student_id===s.id)
    const avg = grades.length ? Math.round(grades.reduce((a,g)=>a+g.score,0)/grades.length) : 0
    return { ...s, avg }
  }).sort((a,b)=>b.avg-a.avg).slice(0,5)

  return (
    <div className="space-y-5 fade-in max-w-6xl">
      <h2 className="text-[20px] font-bold text-[#111827] dark:text-[#F0F0F0]">Analytics</h2>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label:'School Avg Grade',    value:`${Math.round(demoGrades.reduce((a,g)=>a+g.score,0)/demoGrades.length)}%`, color:'text-[#5B5FEF]' },
          { label:'School Avg Attendance',value:`${Math.round(demoStudents.reduce((a,s)=>a+s.attendance_percentage,0)/demoStudents.length)}%`, color:'text-[#10B981]' },
          { label:'Fee Collection Rate', value:`${Math.round(demoFees.filter(f=>f.status==='PAID').length/demoFees.length*100)}%`, color:'text-[#F59E0B]' },
          { label:'At-Risk Students',    value:demoStudents.filter(s=>s.attendance_percentage<75).length, color:'text-[#EF4444]' },
        ].map(k => (
          <div key={k.label} className="card text-center">
            <p className={`text-[28px] font-bold ${k.color}`}>{k.value}</p>
            <p className="text-[12px] text-[#6B7280] dark:text-[#9CA3AF] mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Attendance by class */}
        <div className="card">
          <p className="text-[15px] font-bold text-[#111827] dark:text-[#F0F0F0] mb-4">Attendance by Class</p>
          <div className="h-40 sm:h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attByClass} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F4F5F7" vertical={false} />
              <XAxis dataKey="class" tick={{ fontSize:12, fill:'#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0,100]} tick={{ fontSize:11, fill:'#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:10, fontSize:12 }} />
              <Bar dataKey="avg" radius={[8,8,0,0]} fill="#5B5FEF" label={{ position:'top', fontSize:11, fill:'#9CA3AF' }} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>

        {/* Grade distribution */}
        <div className="card">
          <p className="text-[15px] font-bold text-[#111827] dark:text-[#F0F0F0] mb-4">Grade Distribution</p>
          <div className="h-40 sm:h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gradeDist} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F4F5F7" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize:11, fill:'#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:10, fontSize:12 }} />
              <Bar dataKey="count" radius={[6,6,0,0]}>
                {gradeDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Subject radar */}
        <div className="card">
          <p className="text-[15px] font-bold text-[#111827] dark:text-[#F0F0F0] mb-4">Subject Averages</p>
          <div className="h-40 sm:h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={subjectAvg}>
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize:11, fill:'#9CA3AF' }} />
              <Radar dataKey="avg" stroke="#5B5FEF" fill="#5B5FEF" fillOpacity={0.15} strokeWidth={2} />
              <Tooltip contentStyle={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:10, fontSize:12 }} />
            </RadarChart>
          </ResponsiveContainer>
          </div>
        </div>

        {/* Top performers */}
        <div className="card">
          <p className="text-[15px] font-bold text-[#111827] dark:text-[#F0F0F0] mb-4">Top Performers</p>
          <div className="space-y-3">
            {topStudents.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 ${i===0?'bg-yellow-400':i===1?'bg-gray-400':i===2?'bg-amber-600':'bg-[#E5E7EB] dark:bg-[#1E293B] text-[#6B7280] dark:text-[#9CA3AF]'}`}>
                  {i+1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-[13px] font-semibold text-[#111827] dark:text-[#F0F0F0] truncate">{s.name}</p>
                    <span className="text-[13px] font-bold text-[#5B5FEF] ml-2">{s.avg}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-3 dark:bg-[#1E293B] rounded-full overflow-hidden">
                    <div className="h-full bg-[#5B5FEF] rounded-full" style={{ width:`${s.avg}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

