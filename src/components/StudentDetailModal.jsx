import { useState, useEffect } from 'react'
import {
  X, User, Hash, BookOpen, Calendar, Phone, Mail, MapPin, Droplets,
  Upload, Download, Eye, FileText, Award, Star, Pen, FileCheck
} from 'lucide-react'
import { getGrades, getFees, getAttendance } from '../services/db'
import AttendanceRiskBadge from './AttendanceRiskBadge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// CreditCard used as IdCard alias
import { CreditCard as IdCard } from 'lucide-react'

const FEE_BADGE = { PAID: 'badge-green', PENDING: 'badge-yellow', OVERDUE: 'badge-red' }

const DOCUMENTS = [
  { id: 'birth',    label: 'Birth Certificate',          icon: FileText,  category: 'Personal' },
  { id: 'bonafide', label: 'Bonafide Certificate',        icon: FileCheck, category: 'Academic' },
  { id: 'tc',       label: 'Transfer Certificate (TC)',   icon: FileText,  category: 'Academic' },
  { id: 'sports',   label: 'Sports Certificate',          icon: Award,     category: 'Extra-curricular' },
  { id: 'aadhar',   label: 'Student Aadhar Card',         icon: IdCard,    category: 'Personal' },
  { id: 'father',   label: 'Father Signature',            icon: Pen,       category: 'Personal' },
  { id: 'mother',   label: 'Mother Signature',            icon: Pen,       category: 'Personal' },
  { id: 'rc_t1',    label: 'Report Card — Term 1',        icon: BookOpen,  category: 'Academic' },
  { id: 'rc_t2',    label: 'Report Card — Term 2',        icon: BookOpen,  category: 'Academic' },
  { id: 'rc_t3',    label: 'Report Card — Term 3',        icon: BookOpen,  category: 'Academic' },
]

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={13} className="text-gray-500 dark:text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm font-semibold mt-0.5 text-gray-900 dark:text-white truncate">{value || '—'}</p>
      </div>
    </div>
  )
}

const TABS = ['Overview', 'Documents', 'Performance']

export default function StudentDetailModal({ student, onClose }) {
  const [activeTab, setActiveTab] = useState('Overview')
  const [docStates, setDocStates] = useState({})
  const [grades, setGrades]       = useState([])
  const [fees, setFees]           = useState([])
  const [attendance, setAttendance] = useState([])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    if (!student?.id) return
    Promise.all([
      getGrades(student.id),
      getFees(student.id),
      getAttendance(student.id),
    ]).then(([g, f, a]) => { setGrades(g); setFees(f); setAttendance(a) })
  }, [student?.id])

  if (!student) return null

  const avgGrade  = grades.length ? Math.round(grades.reduce((s, g) => s + g.score, 0) / grades.length) : 0
  const hasOverdue = fees.some(f => f.status === 'OVERDUE')
  const hasPending = fees.some(f => f.status === 'PENDING')
  const feeStatus  = hasOverdue ? 'OVERDUE' : hasPending ? 'PENDING' : 'PAID'
  const present    = attendance.filter(a => a.status === 'present').length
  const absent     = attendance.filter(a => a.status === 'absent').length
  const late       = attendance.filter(a => a.status === 'late').length

  const subjects    = [...new Set(grades.map(g => g.subject))]
  const subjectAvgs = subjects.map(sub => {
    const scores = grades.filter(g => g.subject === sub).map(g => g.score)
    return { subject: sub.slice(0, 4), full: sub, avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) }
  })
  const timeline = grades.map(g => ({ date: g.date.slice(5), score: g.score }))

  const avatarColors = ['from-primary-500 to-accent-500', 'from-green-500 to-teal-500', 'from-orange-500 to-pink-500']
  const avatarColor  = avatarColors[student.id.charCodeAt(student.id.length - 1) % avatarColors.length]

  const handleUpload = (docId) => {
    setDocStates(prev => ({ ...prev, [docId]: 'uploaded' }))
  }

  const docCategories = [...new Set(DOCUMENTS.map(d => d.category))]

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-900 rounded-none sm:rounded-3xl shadow-2xl w-full h-full sm:w-auto sm:h-auto sm:max-w-3xl sm:max-h-[92vh] overflow-hidden flex flex-col fade-in">

        {/* Gradient header */}
        <div className={`bg-gradient-to-r ${avatarColor} p-6 relative flex-shrink-0`}>
          <button onClick={onClose}
            className="absolute top-4 right-4 w-11 h-11 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
            <X size={16} className="text-white" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 border-2 border-white/40 rounded-2xl flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
              {student.name[0]}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{student.name}</h2>
              <p className="text-white/80 text-sm mt-0.5">Class {student.class} — Section {student.section}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full font-medium">{student.admission_number}</span>
                <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full font-medium capitalize">{student.gender}</span>
                {student.blood_group && <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full font-medium">{student.blood_group}</span>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="bg-white/15 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-white">{student.attendance_percentage}%</p>
              <p className="text-xs text-white/70 mt-0.5">Attendance</p>
            </div>
            <div className="bg-white/15 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-white">{avgGrade}%</p>
              <p className="text-xs text-white/70 mt-0.5">Avg Grade</p>
            </div>
            <div className="bg-white/15 rounded-xl p-3 text-center">
              <p className={`text-sm font-bold mt-1 ${feeStatus === 'OVERDUE' ? 'text-red-300' : feeStatus === 'PENDING' ? 'text-yellow-300' : 'text-green-300'}`}>
                {feeStatus}
              </p>
              <p className="text-xs text-white/70 mt-0.5">Fee Status</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-6">

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'Overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Personal Information</p>
                  <div className="card p-4">
                    <InfoRow icon={Hash}     label="Student ID"     value={student.id.slice(0, 12).toUpperCase()} />
                    <InfoRow icon={BookOpen} label="Admission No."  value={student.admission_number} />
                    <InfoRow icon={Calendar} label="Date of Birth"  value={student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null} />
                    <InfoRow icon={User}     label="Gender"         value={student.gender} />
                    <InfoRow icon={Calendar} label="Joining Date"   value={student.joining_date ? new Date(student.joining_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null} />
                    <InfoRow icon={Droplets} label="Blood Group"    value={student.blood_group} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Contact & Guardian</p>
                    <div className="card p-4">
                      <InfoRow icon={User}   label="Guardian Name" value={student.guardian_name} />
                      <InfoRow icon={Phone}  label="Contact"       value={student.contact} />
                      <InfoRow icon={Mail}   label="Email"         value={student.email} />
                      <InfoRow icon={MapPin} label="Address"       value={student.address} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Attendance</p>
                    <div className="card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Risk Level</span>
                        <AttendanceRiskBadge percentage={student.attendance_percentage} />
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-2">
                          <p className="text-lg font-bold text-green-600">{present}</p>
                          <p className="text-xs text-gray-400">Present</p>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-2">
                          <p className="text-lg font-bold text-red-600">{absent}</p>
                          <p className="text-xs text-gray-400">Absent</p>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-2">
                          <p className="text-lg font-bold text-yellow-600">{late}</p>
                          <p className="text-xs text-gray-400">Late</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fees */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Fee Status</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {fees.map(fee => (
                    <div key={fee.id} className={`card p-4 border-l-4 ${fee.status === 'OVERDUE' ? 'border-l-red-500' : fee.status === 'PENDING' ? 'border-l-yellow-500' : 'border-l-green-500'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-gray-400 font-medium">{fee.term}</p>
                        <span className={FEE_BADGE[fee.status]}>{fee.status}</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">₹{fee.amount.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── DOCUMENTS TAB ── */}
          {activeTab === 'Documents' && (
            <div className="space-y-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Upload, download, or view official documents for {student.name.split(' ')[0]}.
              </p>
              {docCategories.map(cat => (
                <div key={cat}>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{cat}</p>
                  <div className="space-y-2">
                    {DOCUMENTS.filter(d => d.category === cat).map(doc => {
                      const Icon = doc.icon
                      const uploaded = !!docStates[doc.id]
                      return (
                        <div key={doc.id}
                          className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${uploaded ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-200 dark:bg-gray-700'}`}>
                              <Icon size={16} className={uploaded ? 'text-green-600' : 'text-gray-400'} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{doc.label}</p>
                              <p className="text-xs text-gray-400">{uploaded ? 'Uploaded' : 'Not uploaded'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {uploaded && (
                              <>
                                <button className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 transition-colors" title="View">
                                  <Eye size={14} />
                                </button>
                                <button className="p-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100 transition-colors" title="Download">
                                  <Download size={14} />
                                </button>
                              </>
                            )}
                            <label className="cursor-pointer">
                              <input type="file" className="hidden" onChange={() => handleUpload(doc.id)} />
                              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                uploaded
                                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200'
                                  : 'bg-primary-600 text-white hover:bg-primary-700'
                              }`}>
                                <Upload size={12} />
                                {uploaded ? 'Replace' : 'Upload'}
                              </span>
                            </label>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── PERFORMANCE TAB ── */}
          {activeTab === 'Performance' && (
            <div className="space-y-6">
              {timeline.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Grade Timeline</p>
                  <div className="card">
                    <div className="h-40 sm:h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timeline}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
              {subjectAvgs.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Subject Averages</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {subjectAvgs.map((s, i) => {
                      const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500', 'bg-cyan-500']
                      return (
                        <div key={s.full} className="card p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-7 h-7 ${colors[i % colors.length]} rounded-lg flex items-center justify-center text-white text-xs font-bold`}>
                              {s.subject}
                            </div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{s.full}</p>
                          </div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.avg}%</p>
                          <div className="mt-2 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-700`} style={{ width: `${s.avg}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
          <p className="text-xs text-gray-400">School ID: {student.school_id} • Demo School</p>
          <button onClick={onClose} className="btn-secondary text-sm">Close</button>
        </div>
      </div>
    </div>
  )
}

