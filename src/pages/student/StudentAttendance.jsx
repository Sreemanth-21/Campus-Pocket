import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getAttendance } from '../../services/db'
import AttendanceHeatmap from '../../components/AttendanceHeatmap'
import AttendanceRiskBadge from '../../components/AttendanceRiskBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function StudentAttendance() {
  const { profile } = useAuth()
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.id) return
    getAttendance(profile.id).then(d => { setAttendance(d); setLoading(false) })
  }, [profile?.id])

  if (loading) return <LoadingSpinner />

  const present = attendance.filter(a => a.status === 'present').length
  const absent  = attendance.filter(a => a.status === 'absent').length
  const late    = attendance.filter(a => a.status === 'late').length
  const total   = attendance.length
  const pieData = [
    { name: 'Present', value: present, color: '#22c55e' },
    { name: 'Absent',  value: absent,  color: '#ef4444' },
    { name: 'Late',    value: late,    color: '#f59e0b' },
  ]

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Attendance Record</h2>
        <AttendanceRiskBadge percentage={profile?.attendance_percentage || 0} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label:'Present', value:present, color:'text-green-600', bg:'bg-green-50 dark:bg-green-900/20' },
          { label:'Absent',  value:absent,  color:'text-red-600',   bg:'bg-red-50 dark:bg-red-900/20' },
          { label:'Late',    value:late,    color:'text-yellow-600',bg:'bg-yellow-50 dark:bg-yellow-900/20' },
        ].map(s => (
          <div key={s.label} className={`card text-center ${s.bg}`}>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
            <p className="text-xs text-gray-400">{total ? Math.round(s.value / total * 100) : 0}%</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Records</h3>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {[...attendance].reverse().slice(0, 15).map(a => (
              <div key={a.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
                <span className="text-sm text-gray-600 dark:text-gray-400">{a.date}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize
                  ${a.status==='present'?'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400':
                    a.status==='absent'?'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400':
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Attendance Heatmap</h3>
        <div className="overflow-x-auto"><AttendanceHeatmap attendance={attendance} /></div>
      </div>
    </div>
  )
}

