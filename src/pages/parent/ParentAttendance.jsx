import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getChildrenOfParent, getAttendance } from '../../services/db'
import AttendanceHeatmap from '../../components/AttendanceHeatmap'
import AttendanceRiskBadge from '../../components/AttendanceRiskBadge'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function ParentAttendance() {
  const { profile } = useAuth()
  const [children, setChildren]     = useState([])
  const [selected, setSelected]     = useState(null)
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    if (!profile?.id) return
    getChildrenOfParent(profile.id).then(kids => {
      setChildren(kids)
      if (kids.length) setSelected(kids[0].id)
      setLoading(false)
    })
  }, [profile?.id])

  useEffect(() => {
    if (!selected) return
    getAttendance(selected).then(setAttendance)
  }, [selected])

  if (loading) return <LoadingSpinner />

  const child   = children.find(c => c.id === selected)
  const present = attendance.filter(a => a.status === 'present').length
  const absent  = attendance.filter(a => a.status === 'absent').length
  const late    = attendance.filter(a => a.status === 'late').length

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Attendance</h2>
        <div className="flex gap-2">
          {children.map(c => (
            <button key={c.id} onClick={() => setSelected(c.id)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${selected===c.id?'bg-primary-600 text-white':'btn-secondary'}`}>
              {c.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {child && (
        <>
          <div className="card flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">{child.name}</h3>
              <p className="text-sm text-gray-400">Class {child.class} - Section {child.section}</p>
            </div>
            <AttendanceRiskBadge percentage={child.attendance_percentage} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {label:'Present',value:present,color:'text-green-600',bg:'bg-green-50 dark:bg-green-900/20'},
              {label:'Absent', value:absent, color:'text-red-600',  bg:'bg-red-50 dark:bg-red-900/20'},
              {label:'Late',   value:late,   color:'text-yellow-600',bg:'bg-yellow-50 dark:bg-yellow-900/20'},
            ].map(s => (
              <div key={s.label} className={`card text-center ${s.bg}`}>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Attendance Heatmap</h3>
            <div className="overflow-x-auto"><AttendanceHeatmap attendance={attendance} /></div>
          </div>
        </>
      )}
    </div>
  )
}

