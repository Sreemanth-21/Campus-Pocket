import { useState, useMemo, useRef, useEffect } from 'react'
import {
  Search, Plus, X, TrendingUp, TrendingDown, AlertTriangle,
  CalendarDays, BarChart2, CreditCard, User, Hash, Phone,
  Mail, MapPin, Droplets, CheckCircle, Clock, ArrowLeft,
  Upload, Download, FileSpreadsheet, Eye, Trash2, MessageCircle
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts'
import { demoStudents, demoGrades, demoFees, demoAttendance } from '../../services/mockData'
import WhatsAppButton from '../../components/WhatsAppButton'

/* ── Ring SVG ── */
function Ring({ pct, size = 56, stroke = 5, color = '#5B5FEF' }) {
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r, offset = circ - (pct / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
    </svg>
  )
}

/* ── helpers ── */
function computeAvgGrade(studentId) {
  const grades = demoGrades.filter(g => g.student_id === studentId)
  if (!grades.length) return 0
  return Math.round(grades.reduce((s, g) => s + g.score, 0) / grades.length)
}

function computeFeeStatus(studentId) {
  const fees = demoFees.filter(f => f.student_id === studentId)
  if (fees.some(f => f.status === 'OVERDUE')) return 'OVERDUE'
  if (fees.some(f => f.status === 'PENDING')) return 'PENDING'
  return 'PAID'
}

const FEE_BADGE = { PAID: 'badge-green', PENDING: 'badge-yellow', OVERDUE: 'badge-red' }

function feeBadge(status) {
  return <span className={FEE_BADGE[status] || 'badge-blue'}>{status}</span>
}

function gradeTrend(avg) {
  if (avg >= 80) return <TrendingUp size={13} className="text-green-500" />
  if (avg >= 60) return <TrendingDown size={13} className="text-amber-500" />
  return <TrendingDown size={13} className="text-red-500" />
}

function genId() {
  return 'student-' + Math.random().toString(36).slice(2, 9)
}

/* ── CSV template with sample row ── */
const CSV_TEMPLATE =
  'name,email,username,password,class,section,admission_number,date_of_birth,gender,guardian_name,contact,blood_group,address\n' +
  'John Smith,john.smith@school.edu,john.smith,Pass@123,10,A,ADM-2024-001,2008-05-15,Male,Robert Smith,+91 98765 00001,O+,"12 Main Street, City"\n' +
  'Priya Patel,priya.patel@school.edu,priya.patel,Pass@123,9,B,ADM-2024-002,2009-03-22,Female,Raj Patel,+91 98765 00002,B+,"45 Park Road, Town"\n'

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'students_import_template.csv'; a.click()
  URL.revokeObjectURL(url)
}

// Robust CSV parser — handles quoted fields, \r\n, BOM
function parseCSVLine(line) {
  const result = []
  let cur = '', inQ = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++ }
      else inQ = !inQ
    } else if (ch === ',' && !inQ) {
      result.push(cur.trim()); cur = ''
    } else {
      cur += ch
    }
  }
  result.push(cur.trim())
  return result
}

function parseCSV(text) {
  // Strip BOM if present
  const clean = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = clean.split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) return []
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, '_'))
  return lines.slice(1).map(line => {
    const vals = parseCSVLine(line)
    const obj = {}
    headers.forEach((h, i) => { obj[h] = vals[i] || '' })
    return obj
  }).filter(r => r.name && r.name !== '') // skip empty rows
}

/* ══════════════════════════════════════════════
   ADD STUDENT MODAL
══════════════════════════════════════════════ */
function AddStudentModal({ onClose, onAdd }) {
  const EMPTY = {
    name: '', email: '', username: '', password: '',
    class: '10', section: 'A', admission_number: '',
    date_of_birth: '', gender: 'Male', guardian_name: '',
    contact: '', blood_group: 'O+', address: ''
  }
  const [form, setForm] = useState(EMPTY)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function handleSubmit(e) {
    e.preventDefault()
    const newStudent = { ...form, id: genId(), school_id: 'school-demo-001', attendance_percentage: 0, joining_date: new Date().toISOString().split('T')[0] }
    onAdd(newStudent)
    setSuccess(true)
    setTimeout(onClose, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1A1A1A] rounded-none sm:rounded-3xl border border-border dark:border-[#1E293B] w-full h-full sm:w-auto sm:h-auto sm:max-w-2xl sm:max-h-[92vh] overflow-y-auto shadow-2xl slide-up">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border dark:border-[#1E293B]">
          <h3 className="text-[16px] font-bold text-[#111827] dark:text-[#F0F0F0]">Add New Student</h3>
          <button onClick={onClose} className="btn-ghost w-11 h-11"><X size={16} /></button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <CheckCircle size={48} className="text-green-500" />
            <p className="text-[15px] font-semibold text-[#111827] dark:text-[#F0F0F0]">Student added successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Full Name *</label>
                <input required className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Alex Johnson" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Email *</label>
                <input required type="email" className="input" value={form.email} onChange={e => set('email', e.target.value)} placeholder="student@school.edu" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Username *</label>
                <input required className="input" value={form.username} onChange={e => set('username', e.target.value)} placeholder="alex.johnson" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Password *</label>
                <input required type="password" className="input" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Admission Number</label>
                <input className="input" value={form.admission_number} onChange={e => set('admission_number', e.target.value)} placeholder="ADM-2024-007" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Class</label>
                <select className="input" value={form.class} onChange={e => set('class', e.target.value)}>
                  {['9', '10', '11'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Section</label>
                <select className="input" value={form.section} onChange={e => set('section', e.target.value)}>
                  {['A', 'B', 'C'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Date of Birth</label>
                <input type="date" className="input" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Gender</label>
                <select className="input" value={form.gender} onChange={e => set('gender', e.target.value)}>
                  {['Male', 'Female', 'Other'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Guardian Name</label>
                <input className="input" value={form.guardian_name} onChange={e => set('guardian_name', e.target.value)} placeholder="Parent / Guardian" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Contact</label>
                <input className="input" value={form.contact} onChange={e => set('contact', e.target.value)} placeholder="+91 98765 00000" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Blood Group</label>
                <select className="input" value={form.blood_group} onChange={e => set('blood_group', e.target.value)}>
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Address</label>
                <textarea rows={2} className="input resize-none" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street, City" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary flex items-center gap-2"><Plus size={15} /> Add Student</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   BULK IMPORT MODAL
══════════════════════════════════════════════ */
function ImportModal({ onClose, onImport }) {
  const fileRef = useRef(null)
  const [file, setFile] = useState(null)
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const [importing, setImporting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function handleFile(f) {
    if (!f) return
    setError('')
    setRows([])

    const ext = f.name.split('.').pop().toLowerCase()

    // .xlsx/.xls are binary — can't parse without a library
    // Tell user to save as CSV instead
    if (ext === 'xlsx' || ext === 'xls') {
      setFile(f)
      setError('Excel (.xlsx/.xls) files cannot be read directly. Please open the file in Excel, then go to File → Save As → CSV (Comma delimited) and upload the .csv file instead.')
      return
    }

    if (ext !== 'csv') {
      setError('Unsupported file type. Please upload a .csv file.')
      return
    }

    setFile(f)
    const reader = new FileReader()
    reader.onload = e => {
      const parsed = parseCSV(e.target.result)
      if (parsed.length === 0) {
        setError('No valid data found. Make sure the file has a header row and at least one data row.')
      } else {
        setRows(parsed)
      }
    }
    reader.onerror = () => setError('Failed to read file. Please try again.')
    reader.readAsText(f, 'UTF-8')
  }

  function handleDrop(e) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  function handleImport() {
    setImporting(true)
    let p = 0
    const iv = setInterval(() => {
      p += 7
      setProgress(Math.min(p, 100))
      if (p >= 100) {
        clearInterval(iv)
        const newStudents = rows.map(r => ({
          id: genId(),
          name: r.name || 'Unknown',
          email: r.email || '',
          username: r.username || '',
          class: r.class || '10',
          section: r.section || 'A',
          admission_number: r.admission_number || '',
          date_of_birth: r.date_of_birth || '',
          gender: r.gender || '',
          guardian_name: r.guardian_name || '',
          contact: r.contact || '',
          blood_group: r.blood_group || '',
          address: r.address || '',
          attendance_percentage: 0,
          school_id: 'school-demo-001',
          joining_date: new Date().toISOString().split('T')[0]
        }))
        onImport(newStudents)
        setDone(true)
        setTimeout(onClose, 2500)
      }
    }, 80)
  }

  const previewRows = rows.slice(0, 5)
  const previewHeaders = rows.length ? Object.keys(rows[0]) : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1A1A1A] rounded-none sm:rounded-3xl border border-border dark:border-[#1E293B] w-full h-full sm:w-auto sm:h-auto sm:max-w-3xl sm:max-h-[92vh] overflow-y-auto shadow-2xl slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border dark:border-[#1E293B]">
          <h3 className="text-[16px] font-bold text-[#111827] dark:text-[#F0F0F0]">Import Students</h3>
          <button onClick={onClose} className="btn-ghost w-11 h-11"><X size={16} /></button>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <CheckCircle size={48} className="text-green-500" />
            <p className="text-[15px] font-semibold text-[#111827] dark:text-[#F0F0F0]">{rows.length} student{rows.length !== 1 ? 's' : ''} imported successfully!</p>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* LEFT — upload */}
              <div className="space-y-3">
                <p className="text-[13px] font-semibold text-[#111827] dark:text-[#F0F0F0]">Upload File</p>
                <div
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-border dark:border-[#1E293B] rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-[#5B5FEF] hover:bg-[#F4F5FF] dark:hover:bg-[#5B5FEF]/5 transition-all"
                >
                  <FileSpreadsheet size={36} className="text-[#5B5FEF]" />
                  {file ? (
                    <div className="text-center">
                      <p className="text-[13px] font-semibold text-[#111827] dark:text-[#F0F0F0]">{file.name}</p>
                      <p className="text-[11px] text-[#9CA3AF]">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-[13px] font-semibold text-[#111827] dark:text-[#F0F0F0]">Drag & drop your CSV file here</p>
                      <p className="text-[12px] text-[#9CA3AF]">or click to browse (.csv only)</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept=".csv" className="hidden"
                    onChange={e => handleFile(e.target.files[0])} />
                </div>
                <button onClick={downloadTemplate} className="btn-secondary w-full flex items-center justify-center gap-2 text-[13px]">
                  <Download size={14} /> Download Template (CSV)
                </button>
                {error && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[12px] text-red-700 dark:text-red-400 leading-relaxed">{error}</p>
                  </div>
                )}
              </div>

              {/* RIGHT — instructions */}
              <div className="space-y-3">
                <p className="text-[13px] font-semibold text-[#111827] dark:text-[#F0F0F0]">How to import</p>
                <ol className="space-y-2.5">
                  {[
                    'Download the CSV template (has sample rows)',
                    'Open in Excel or Google Sheets and fill in your data',
                    'Required columns: name, email, username, password, class, section',
                    'Optional: admission_number, date_of_birth, gender, guardian_name, contact, blood_group, address',
                    'Save as CSV (File → Save As → CSV) and upload',
                  ].map((step, i) => (
                    <li key={i} className="flex gap-2.5 text-[12px] text-[#6B7280] dark:text-[#9CA3AF]">
                      <span className="w-5 h-5 rounded-full bg-[#5B5FEF]/10 text-[#5B5FEF] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Preview */}
            {previewRows.length > 0 && (
              <div className="space-y-2">
                <p className="text-[12px] font-semibold text-[#6B7280]">Preview ({rows.length} rows)</p>
                <div className="overflow-x-auto rounded-xl border border-border dark:border-[#1E293B]">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="bg-[#F9FAFB] dark:bg-[#1E1E1E] border-b border-border dark:border-[#1E293B]">
                        {previewHeaders.map(h => (
                          <th key={h} className="px-3 py-2 text-left font-bold text-[#6B7280] uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, i) => (
                        <tr key={i} className="border-b border-[#F4F5F7] dark:border-[#1E293B]">
                          {previewHeaders.map(h => (
                            <td key={h} className="px-3 py-1.5 text-[#374151] dark:text-[#D1D5DB] whitespace-nowrap">{row[h]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Progress */}
            {importing && !done && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-[#9CA3AF]">
                  <span>Importing…</span><span>{progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-surface-3 dark:bg-[#1E293B] overflow-hidden">
                  <div className="h-full bg-[#5B5FEF] rounded-full transition-all duration-150" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button onClick={onClose} className="btn-secondary">Cancel</button>
              <button
                disabled={!file || importing || rows.length === 0 || !!error}
                onClick={handleImport}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload size={14} /> Import {rows.length > 0 ? `${rows.length} Students` : 'Students'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   STUDENT DETAIL VIEW
══════════════════════════════════════════════ */
function StudentDetail({ student, onBack }) {
  const grades = demoGrades.filter(g => g.student_id === student.id)
  const fees = demoFees.filter(f => f.student_id === student.id)
  const attendance = demoAttendance.filter(a => a.student_id === student.id)

  const present = attendance.filter(a => a.status === 'present').length
  const absent = attendance.filter(a => a.status === 'absent').length
  const late = attendance.filter(a => a.status === 'late').length
  const total = attendance.length
  const attPct = total ? Math.round(((present + late) / total) * 100) : student.attendance_percentage

  const avgGrade = grades.length ? Math.round(grades.reduce((s, g) => s + g.score, 0) / grades.length) : 0
  const feeStatus = fees.some(f => f.status === 'OVERDUE') ? 'OVERDUE' : fees.some(f => f.status === 'PENDING') ? 'PENDING' : 'PAID'

  // Grade trend chart data — group by date
  const gradeChartData = grades
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(g => ({ date: g.date.slice(5), score: g.score, subject: g.subject }))

  // Subject averages
  const subjectMap = {}
  grades.forEach(g => {
    if (!subjectMap[g.subject]) subjectMap[g.subject] = []
    subjectMap[g.subject].push(g.score)
  })
  const subjects = Object.entries(subjectMap).map(([sub, scores]) => ({
    subject: sub,
    avg: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
  }))

  const attRisk = attPct < 75
  const perfLevel = avgGrade >= 85 ? 'Excellent' : avgGrade >= 70 ? 'Good' : avgGrade >= 55 ? 'Average' : 'Needs Help'
  const perfColor = avgGrade >= 85 ? 'badge-green' : avgGrade >= 70 ? 'badge-blue' : avgGrade >= 55 ? 'badge-yellow' : 'badge-red'

  const insights = [
    attPct >= 90 && { type: 'good', text: 'Excellent attendance record' },
    attPct < 75 && { type: 'bad', text: 'Attendance below 75% — at risk' },
    avgGrade >= 85 && { type: 'good', text: 'High academic performance' },
    avgGrade < 60 && { type: 'bad', text: 'Academic performance needs attention' },
    feeStatus === 'PAID' && { type: 'good', text: 'All fees cleared' },
    feeStatus === 'OVERDUE' && { type: 'bad', text: 'Overdue fee payments' },
  ].filter(Boolean)

  return (
    <div className="space-y-5 fade-in max-w-5xl">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-2 text-[13px] text-[#6B7280] hover:text-[#111827] dark:hover:text-[#F0F0F0] transition-colors">
        <ArrowLeft size={15} /> Back to Students
      </button>

      {/* Hero card */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#5B5FEF,#818CF8)' }}>
            {student.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[20px] font-bold text-[#111827] dark:text-[#F0F0F0]">{student.name}</h2>
            <p className="text-[13px] text-[#6B7280]">Class {student.class}{student.section} · {student.admission_number || '—'}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {attRisk && <span className="badge-red flex items-center gap-1"><AlertTriangle size={10} /> Attendance Risk</span>}
              <span className={perfColor}>{perfLevel}</span>
              <span className={FEE_BADGE[feeStatus] || 'badge-blue'}>{feeStatus}</span>
            </div>
          </div>
          {/* 3 stat boxes */}
          <div className="flex flex-wrap gap-3 flex-shrink-0">
            {[
              { label: 'Attendance', value: `${attPct}%`, color: attPct < 75 ? '#DC2626' : '#16A34A' },
              { label: 'Avg Grade', value: `${avgGrade}%`, color: avgGrade < 60 ? '#DC2626' : '#5B5FEF' },
              { label: 'Fee Status', value: feeStatus, color: feeStatus === 'OVERDUE' ? '#DC2626' : feeStatus === 'PENDING' ? '#CA8A04' : '#16A34A' },
            ].map(s => (
              <div key={s.label} className="w-full sm:w-auto text-center px-4 py-3 rounded-xl bg-surface-3 dark:bg-[#1E293B] min-w-[80px]">
                <p className="text-[11px] text-[#9CA3AF] font-medium">{s.label}</p>
                <p className="text-[15px] font-bold mt-0.5" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp alert button */}
        <div className="mt-4 pt-4 border-t border-border/50 dark:border-[#1a2235] flex items-center justify-between flex-wrap gap-3">
          <p className="text-[12px] text-ink-4 dark:text-[#3d5070]">
            Guardian: <span className="font-semibold text-ink-2 dark:text-[#8896A8]">{student.guardian_name}</span>
            {student.contact && <span className="ml-2 text-ink-4">· {student.contact}</span>}
          </p>
          <WhatsAppButton
            student={student}
            parentPhone={student.parent_phone}
            fees={fees}
            size="sm"
          />
        </div>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Personal info */}
        <div className="card space-y-3">
          <p className="text-[13px] font-bold text-[#111827] dark:text-[#F0F0F0]">Personal Information</p>
          {[
            { icon: Hash, label: 'Admission No', value: student.admission_number || '—' },
            { icon: User, label: 'Gender', value: student.gender || '—' },
            { icon: CalendarDays, label: 'Date of Birth', value: student.date_of_birth || '—' },
            { icon: Droplets, label: 'Blood Group', value: student.blood_group || '—' },
            { icon: Phone, label: 'Contact', value: student.contact || '—' },
            { icon: Mail, label: 'Email', value: student.email || '—' },
            { icon: User, label: 'Guardian', value: student.guardian_name || '—' },
            { icon: MapPin, label: 'Address', value: student.address || '—' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-surface-3 dark:bg-[#1E293B] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon size={13} className="text-[#6B7280]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-[#9CA3AF] font-medium uppercase tracking-wider">{label}</p>
                <p className="text-[13px] text-[#111827] dark:text-[#F0F0F0] break-words">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right column: attendance ring + insights */}
        <div className="space-y-4">
          {/* Attendance breakdown */}
          <div className="card">
            <p className="text-[13px] font-bold text-[#111827] dark:text-[#F0F0F0] mb-4">Attendance Breakdown</p>
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                <Ring pct={attPct} size={80} stroke={7} color={attPct < 75 ? '#DC2626' : '#5B5FEF'} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[13px] font-bold text-[#111827] dark:text-[#F0F0F0]">{attPct}%</span>
                </div>
              </div>
              <div className="space-y-2 flex-1">
                {[
                  { label: 'Present', count: present, color: 'bg-green-500' },
                  { label: 'Absent', count: absent, color: 'bg-red-500' },
                  { label: 'Late', count: late, color: 'bg-amber-500' },
                ].map(({ label, count, color }) => (
                  <div key={label} className="flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${color}`} />
                      <span className="text-[#6B7280]">{label}</span>
                    </div>
                    <span className="font-semibold text-[#111827] dark:text-[#F0F0F0]">{count} days</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="card">
            <p className="text-[13px] font-bold text-[#111827] dark:text-[#F0F0F0] mb-3">Insights</p>
            <div className="space-y-2">
              {insights.length === 0 && <p className="text-[12px] text-[#9CA3AF]">No insights available.</p>}
              {insights.map((ins, i) => (
                <div key={i} className={`flex items-start gap-2 p-2.5 rounded-xl text-[12px] ${ins.type === 'good' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                  {ins.type === 'good'
                    ? <CheckCircle size={13} className="mt-0.5 flex-shrink-0" />
                    : <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />}
                  {ins.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grade trend chart */}
      {gradeChartData.length > 0 && (
        <div className="card">
          <p className="text-[13px] font-bold text-[#111827] dark:text-[#F0F0F0] mb-4">Grade Trend</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={gradeChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5B5FEF" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#5B5FEF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: 10, fontSize: 12 }}
                formatter={(v, n, p) => [`${v}%`, p.payload.subject]}
              />
              <Area type="monotone" dataKey="score" stroke="#5B5FEF" strokeWidth={2} fill="url(#gradeGrad)" dot={{ r: 3, fill: '#5B5FEF' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Subject scores */}
      {subjects.length > 0 && (
        <div className="card">
          <p className="text-[13px] font-bold text-[#111827] dark:text-[#F0F0F0] mb-4">Subject Scores</p>
          <div className="space-y-3">
            {subjects.map(({ subject, avg }) => (
              <div key={subject}>
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="text-[#374151] dark:text-[#D1D5DB] font-medium">{subject}</span>
                  <span className="font-bold text-[#111827] dark:text-[#F0F0F0]">{avg}%</span>
                </div>
                <div className="h-2 rounded-full bg-surface-3 dark:bg-[#1E293B] overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${avg}%`, background: avg >= 80 ? '#16A34A' : avg >= 60 ? '#5B5FEF' : '#DC2626' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fee details */}
      {fees.length > 0 && (
        <div className="card">
          <p className="text-[13px] font-bold text-[#111827] dark:text-[#F0F0F0] mb-4">Fee Details</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {fees.map(f => {
              const borderColor = f.status === 'PAID' ? '#16A34A' : f.status === 'PENDING' ? '#CA8A04' : '#DC2626'
              return (
                <div key={f.id} className="rounded-xl border border-border dark:border-[#1E293B] p-4 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ background: borderColor }} />
                  <p className="text-[12px] font-semibold text-[#374151] dark:text-[#D1D5DB] pl-2">{f.term}</p>
                  <p className="text-[18px] font-bold text-[#111827] dark:text-[#F0F0F0] pl-2 mt-1">₹{f.amount.toLocaleString()}</p>
                  <div className="pl-2 mt-2">
                    <span className={FEE_BADGE[f.status] || 'badge-blue'}>{f.status}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function AdminStudents() {
  const [view, setView] = useState('list') // 'list' | 'detail'
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('All')
  const [perfFilter, setPerfFilter] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [extraStudents, setExtraStudents] = useState([])

  const allStudents = useMemo(() => [...demoStudents, ...extraStudents], [extraStudents])

  const enriched = useMemo(() => allStudents.map(s => ({
    ...s,
    avgGrade: computeAvgGrade(s.id),
    feeStatus: computeFeeStatus(s.id),
  })), [allStudents])

  const filtered = useMemo(() => enriched.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.admission_number || '').toLowerCase().includes(search.toLowerCase())
    const matchClass = classFilter === 'All' || s.class === classFilter
    const matchPerf = perfFilter === 'All' ||
      (perfFilter === 'High' && s.avgGrade >= 80) ||
      (perfFilter === 'Medium' && s.avgGrade >= 60 && s.avgGrade < 80) ||
      (perfFilter === 'Low' && s.avgGrade < 60)
    return matchSearch && matchClass && matchPerf
  }), [enriched, search, classFilter, perfFilter])

  // Stats
  const total = enriched.length
  const active = enriched.filter(s => s.attendance_percentage > 0 || s.avgGrade > 0).length
  const lowAtt = enriched.filter(s => s.attendance_percentage < 75).length
  const overdueFees = enriched.filter(s => s.feeStatus === 'OVERDUE').length

  function openDetail(student) {
    setSelected(student)
    setView('detail')
  }

  if (view === 'detail' && selected) {
    return <StudentDetail student={selected} onBack={() => { setView('list'); setSelected(null) }} />
  }

  return (
    <div className="space-y-5 fade-in max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-[20px] font-bold text-[#111827] dark:text-[#F0F0F0]">
          Students <span className="text-[#9CA3AF] font-normal text-[15px]">({total})</span>
        </h2>
        <div className="flex gap-2">
          <button onClick={() => setShowImport(true)} className="btn-secondary flex items-center gap-2 text-[13px] py-2 px-4">
            <Upload size={14} /> Import Excel
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 text-[13px] py-2 px-4">
            <Plus size={14} /> Add Student
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Students', value: total, icon: User, color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' },
          { label: 'Active', value: active, icon: CheckCircle, color: 'bg-green-50 dark:bg-green-900/20 text-green-600' },
          { label: 'Low Attendance', value: lowAtt, icon: AlertTriangle, color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' },
          { label: 'Overdue Fees', value: overdueFees, icon: CreditCard, color: 'bg-red-50 dark:bg-red-900/20 text-red-600' },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <s.icon size={16} />
            </div>
            <div>
              <p className="text-[11px] text-[#9CA3AF] font-medium">{s.label}</p>
              <p className="text-[20px] font-bold text-[#111827] dark:text-[#F0F0F0]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input pl-10 h-10 text-[13px]" placeholder="Search by name or admission no…" />
        </div>
        <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
          className="input h-10 text-[13px] w-auto min-w-[120px]">
          <option value="All">All Classes</option>
          {['9', '10', '11'].map(c => <option key={c} value={c}>Class {c}</option>)}
        </select>
        <select value={perfFilter} onChange={e => setPerfFilter(e.target.value)}
          className="input h-10 text-[13px] w-auto min-w-[140px]">
          <option value="All">All Performance</option>
          <option value="High">High (≥80%)</option>
          <option value="Medium">Medium (60–79%)</option>
          <option value="Low">Low (&lt;60%)</option>
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-border dark:border-[#1E293B] bg-[#F9FAFB] dark:bg-[#1E1E1E]">
                {['Student', 'Class', 'Attendance', 'Avg Grade', 'Fee Status', ''].map(h => (
                  <th key={h} className="text-left px-2 sm:px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-2 sm:px-4 py-10 text-center text-[13px] text-[#9CA3AF]">No students found.</td>
                </tr>
              )}
              {filtered.map(s => (
                <tr key={s.id}
                  onClick={() => openDetail(s)}
                  className="border-b border-[#F4F5F7] dark:border-[#1E293B] hover:bg-[#F9FAFB] dark:hover:bg-[#1E1E1E] transition-colors cursor-pointer group">
                  {/* Student */}
                  <td className="px-2 sm:px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#5B5FEF,#818CF8)' }}>
                        {s.name[0]}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#111827] dark:text-[#F0F0F0]">{s.name}</p>
                        <p className="text-[11px] text-[#9CA3AF]">{s.admission_number || '—'}</p>
                      </div>
                    </div>
                  </td>
                  {/* Class */}
                  <td className="px-2 sm:px-4 py-3">
                    <span className="badge-indigo">{s.class}{s.section}</span>
                  </td>
                  {/* Attendance */}
                  <td className="px-2 sm:px-4 py-3">
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <div className="flex-1 h-1.5 rounded-full bg-surface-3 dark:bg-[#1E293B] overflow-hidden">
                        <div className="h-full rounded-full"
                          style={{ width: `${s.attendance_percentage}%`, background: s.attendance_percentage < 75 ? '#DC2626' : '#16A34A' }} />
                      </div>
                      <span className={`text-[12px] font-semibold ${s.attendance_percentage < 75 ? 'text-red-600' : 'text-green-600'}`}>
                        {s.attendance_percentage}%
                      </span>
                    </div>
                  </td>
                  {/* Avg Grade */}
                  <td className="px-2 sm:px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {gradeTrend(s.avgGrade)}
                      <span className="text-[13px] font-semibold text-[#111827] dark:text-[#F0F0F0]">{s.avgGrade}%</span>
                    </div>
                  </td>
                  {/* Fee Status */}
                  <td className="px-2 sm:px-4 py-3">{feeBadge(s.feeStatus)}</td>
                  {/* Actions */}
                  <td className="px-2 sm:px-4 py-3">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={e => e.stopPropagation()}>
                      <WhatsAppButton
                        student={s}
                        parentPhone={s.parent_phone}
                        size="sm"
                        variant="icon"
                      />
                      <button className="flex items-center gap-1.5 text-[12px] text-[#5B5FEF] font-medium"
                        onClick={e => { e.stopPropagation(); openDetail(s) }}>
                        <Eye size={13} /> View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAdd && (
        <AddStudentModal
          onClose={() => setShowAdd(false)}
          onAdd={s => setExtraStudents(prev => [...prev, s])}
        />
      )}
      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImport={students => setExtraStudents(prev => [...prev, ...students])}
        />
      )}
    </div>
  )
}

