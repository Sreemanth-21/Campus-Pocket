import { useMemo } from 'react'

const STATUS_COLORS = {
  present: 'bg-green-500 dark:bg-green-500',
  absent: 'bg-red-400 dark:bg-red-500',
  late: 'bg-yellow-400 dark:bg-yellow-500',
  none: 'bg-gray-100 dark:bg-gray-800',
}

export default function AttendanceHeatmap({ attendance }) {
  const weeks = useMemo(() => {
    const map = {}
    attendance.forEach(a => { map[a.date] = a.status })

    const today = new Date()
    const result = []
    // Build 10 weeks back
    for (let w = 9; w >= 0; w--) {
      const week = []
      for (let d = 0; d < 7; d++) {
        const date = new Date(today)
        date.setDate(today.getDate() - (w * 7) - (6 - d))
        const key = date.toISOString().split('T')[0]
        const isWeekend = date.getDay() === 0 || date.getDay() === 6
        week.push({ date: key, status: isWeekend ? 'weekend' : (map[key] || 'none'), day: date.getDay() })
      }
      result.push(week)
    }
    return result
  }, [attendance])

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[320px]">
        <div className="flex gap-1 mb-1">
          {days.map((d, i) => (
            <div key={i} className="w-7 text-center text-xs text-gray-400">{d}</div>
          ))}
        </div>
        <div className="flex gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => (
                <div
                  key={di}
                  title={`${day.date}: ${day.status}`}
                  className={`w-7 h-7 rounded-md transition-transform hover:scale-110 cursor-default
                    ${day.status === 'weekend' ? 'bg-gray-50 dark:bg-gray-900' : STATUS_COLORS[day.status] || STATUS_COLORS.none}`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500 inline-block" /> Present</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400 inline-block" /> Absent</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-400 inline-block" /> Late</span>
        </div>
      </div>
    </div>
  )
}

