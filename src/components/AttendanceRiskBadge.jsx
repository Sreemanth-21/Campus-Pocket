export default function AttendanceRiskBadge({ percentage }) {
  if (percentage >= 85) return <span className="badge-green">✓ Safe · {percentage}%</span>
  if (percentage >= 75) return <span className="badge-yellow">⚠ Warning · {percentage}%</span>
  return <span className="badge-red">✕ Critical · {percentage}%</span>
}

