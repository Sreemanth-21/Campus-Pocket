import { useState, useMemo } from 'react'
import { useSchoolStore } from '../../store/schoolStore'
import { ChevronLeft, ChevronRight, Plus, X, CheckCircle, Clock, FileText, ClipboardList, Calendar } from 'lucide-react'

// ── Helpers ──────────────────────────────────────────────────
const DAYS_SHORT  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS      = ['January','February','March','April','May','June','July','August','September','October','November','December']

const EVENT_STYLE = {
  exam:       'bg-red-500 text-white',
  deadline:   'bg-amber-500 text-white',
  assignment: 'bg-[#5B5FEF] text-white',
  test:       'bg-red-500 text-white',
  general:    'bg-gray-500 text-white',
  meeting:    'bg-purple-500 text-white',
  holiday:    'bg-green-500 text-white',
}

function fmt12(dateStr) {
  const d = new Date(dateStr)
  let h = d.getHours(), m = d.getMinutes(), ampm = h >= 12 ? 'p' : 'a'
  h = h % 12 || 12
  return `${h}:${String(m).padStart(2,'0')}${ampm}`
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

// ── Build unified event list ──────────────────────────────────
function buildAllEvents(calendarEvents, assignments, tests, classrooms) {
  const events = []
  calendarEvents.forEach(e => events.push({
    id: e.id, title: e.title, date: e.event_date || e.date,
    type: e.event_type || e.type, classroom: classrooms.find(c=>c.id===e.classroom_id)?.name,
  }))
  assignments.forEach(a => events.push({
    id: a.id, title: a.title, date: a.due_date,
    type: 'assignment', classroom: classrooms.find(c=>c.id===a.classroom_id)?.name,
  }))
  tests.forEach(t => events.push({
    id: t.id, title: t.title, date: t.test_date,
    type: 'test', classroom: classrooms.find(c=>c.id===t.classroom_id)?.name,
  }))
  return events.filter(e => e.date).sort((a,b) => new Date(a.date)-new Date(b.date))
}

// ── Add Event Modal ───────────────────────────────────────────
function AddEventModal({ onClose, onAdd, defaultDate }) {
  const { classrooms } = useSchoolStore()
  const [form, setForm] = useState({
    title:'', description:'', classroom_id: classrooms[0]?.id || '',
    event_date: defaultDate || '', event_type:'general',
  })
  const [success, setSuccess] = useState(false)
  const set = (k,v) => setForm(p=>({...p,[k]:v}))

  const handleSubmit = (e) => {
    e.preventDefault()
    onAdd({ id:`evt-${Date.now()}`, ...form })
    setSuccess(true)
    setTimeout(onClose, 1600)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-border dark:border-[#1E293B] w-full max-w-md shadow-2xl slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border dark:border-[#1E293B]">
          <p className="text-[15px] font-bold text-[#111827] dark:text-[#F0F0F0]">Add Event</p>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={16}/></button>
        </div>
        {success ? (
          <div className="flex flex-col items-center py-10 gap-3">
            <CheckCircle size={40} className="text-green-500"/>
            <p className="font-semibold text-green-600">Event added!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Title *</label>
              <input value={form.title} onChange={e=>set('title',e.target.value)} className="input" placeholder="Event title" required/>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Description</label>
              <input value={form.description} onChange={e=>set('description',e.target.value)} className="input" placeholder="Optional"/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Type</label>
                <select value={form.event_type} onChange={e=>set('event_type',e.target.value)} className="input">
                  {['general','exam','deadline','meeting','holiday'].map(t=>(
                    <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Classroom</label>
                <select value={form.classroom_id} onChange={e=>set('classroom_id',e.target.value)} className="input">
                  {classrooms.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#6B7280] mb-1">Date & Time *</label>
              <input type="datetime-local" value={form.event_date} onChange={e=>set('event_date',e.target.value)} className="input" required/>
            </div>
            <button type="submit" className="btn-primary w-full">Add Event</button>
          </form>
        )}
      </div>
    </div>
  )
}

// ── MONTH VIEW ────────────────────────────────────────────────
function MonthView({ year, month, allEvents, onDayClick, onEventClick }) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month+1, 0).getDate()
  const today = new Date()

  // Build grid cells (pad with prev/next month days)
  const cells = []
  const prevDays = new Date(year, month, 0).getDate()
  for (let i = firstDay-1; i >= 0; i--) cells.push({ day: prevDays-i, cur: false })
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, cur: true })
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - daysInMonth - firstDay + 1, cur: false })

  const getEventsForDay = (day) => {
    if (!day.cur) return []
    const d = new Date(year, month, day.day)
    return allEvents.filter(e => sameDay(new Date(e.date), d))
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-border dark:border-[#1E293B]">
        {DAYS_SHORT.map(d => (
          <div key={d} className="py-2 text-center text-[12px] font-bold text-[#6B7280] dark:text-[#9CA3AF]">{d}</div>
        ))}
      </div>
      {/* Weeks */}
      <div className="grid grid-cols-7" style={{ gridAutoRows: 'minmax(90px, 1fr)' }}>
        {cells.map((cell, i) => {
          const isToday = cell.cur && sameDay(new Date(year, month, cell.day), today)
          const events  = getEventsForDay(cell)
          const dateStr = cell.cur ? `${year}-${String(month+1).padStart(2,'0')}-${String(cell.day).padStart(2,'0')}` : ''
          return (
            <div key={i}
              onClick={() => cell.cur && onDayClick(dateStr)}
              className={`border-b border-r border-border dark:border-[#1E293B] p-1 min-h-[90px] cursor-pointer
                ${cell.cur ? 'bg-white dark:bg-[#1A1A1A] hover:bg-[#F9FAFB] dark:hover:bg-[#1E1E1E]' : 'bg-[#F9FAFB] dark:bg-[#111]'}
                transition-colors`}>
              {/* Day number */}
              <div className="flex justify-end mb-1">
                <span className={`text-[12px] font-semibold w-6 h-6 flex items-center justify-center rounded-full
                  ${isToday ? 'bg-[#5B5FEF] text-white' : cell.cur ? 'text-[#111827] dark:text-[#F0F0F0]' : 'text-[#D1D5DB] dark:text-[#444]'}`}>
                  {cell.day}
                </span>
              </div>
              {/* Events */}
              <div className="space-y-0.5">
                {events.slice(0,3).map(ev => (
                  <div key={ev.id}
                    onClick={e => { e.stopPropagation(); onEventClick(ev) }}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium truncate cursor-pointer hover:opacity-80 transition-opacity ${EVENT_STYLE[ev.type] || EVENT_STYLE.general}`}>
                    <span className="truncate">{fmt12(ev.date)} {ev.title}</span>
                  </div>
                ))}
                {events.length > 3 && (
                  <div className="text-[10px] text-[#9CA3AF] pl-1">+{events.length-3} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── WEEK VIEW ─────────────────────────────────────────────────
function WeekView({ year, month, weekStart, allEvents, onEventClick }) {
  const days = Array.from({length:7}, (_,i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate()+i)
    return d
  })
  const today = new Date()
  const hours = Array.from({length:14}, (_,i) => i+7) // 7am–8pm

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="grid grid-cols-8 border-b border-border dark:border-[#1E293B] sticky top-0 bg-white dark:bg-[#1A1A1A] z-10">
        <div className="py-2 text-[11px] text-[#9CA3AF] text-center">GMT+5:30</div>
        {days.map((d,i) => {
          const isToday = sameDay(d, today)
          return (
            <div key={i} className="py-2 text-center">
              <p className="text-[11px] text-[#9CA3AF]">{DAYS_SHORT[d.getDay()]}</p>
              <span className={`text-[18px] font-bold w-9 h-9 flex items-center justify-center rounded-full mx-auto
                ${isToday ? 'bg-[#5B5FEF] text-white' : 'text-[#111827] dark:text-[#F0F0F0]'}`}>
                {d.getDate()}
              </span>
            </div>
          )
        })}
      </div>
      {/* Time grid */}
      <div className="relative">
        {hours.map(h => (
          <div key={h} className="grid grid-cols-8 border-b border-[#F4F5F7] dark:border-[#1E293B]" style={{height:56}}>
            <div className="text-[10px] text-[#9CA3AF] text-right pr-2 pt-1">{h > 12 ? `${h-12}pm` : h === 12 ? '12pm' : `${h}am`}</div>
            {days.map((d,i) => {
              const evs = allEvents.filter(ev => {
                const evd = new Date(ev.date)
                return sameDay(evd, d) && evd.getHours() === h
              })
              return (
                <div key={i} className="border-l border-[#F4F5F7] dark:border-[#1E293B] relative px-0.5">
                  {evs.map(ev => (
                    <div key={ev.id} onClick={() => onEventClick(ev)}
                      className={`absolute left-0.5 right-0.5 top-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium truncate cursor-pointer hover:opacity-80 ${EVENT_STYLE[ev.type]||EVENT_STYLE.general}`}>
                      {ev.title}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── LIST VIEW ─────────────────────────────────────────────────
function ListView({ allEvents, onEventClick }) {
  const upcoming = allEvents.filter(e => new Date(e.date) >= new Date())
  const past     = allEvents.filter(e => new Date(e.date) < new Date())

  const Section = ({ title, events }) => (
    <div className="mb-6">
      <p className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-3 px-4">{title}</p>
      <div className="divide-y divide-[#F4F5F7] dark:divide-[#252525]">
        {events.map(ev => (
          <div key={ev.id} onClick={() => onEventClick(ev)}
            className="flex items-center gap-4 px-4 py-3 hover:bg-[#F9FAFB] dark:hover:bg-[#1E1E1E] cursor-pointer transition-colors">
            <div className="text-center w-12 flex-shrink-0">
              <p className="text-[11px] text-[#9CA3AF]">{new Date(ev.date).toLocaleDateString('en-US',{month:'short'})}</p>
              <p className="text-[20px] font-bold text-[#111827] dark:text-[#F0F0F0] leading-tight">{new Date(ev.date).getDate()}</p>
            </div>
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${ev.type==='exam'||ev.type==='test'?'bg-red-500':ev.type==='assignment'||ev.type==='deadline'?'bg-amber-500':ev.type==='holiday'?'bg-green-500':'bg-[#5B5FEF]'}`}/>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[#111827] dark:text-[#F0F0F0] truncate">{ev.title}</p>
              <p className="text-[11px] text-[#9CA3AF]">{ev.classroom} · {fmt12(ev.date)}</p>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${EVENT_STYLE[ev.type]||EVENT_STYLE.general}`}>{ev.type}</span>
          </div>
        ))}
        {events.length === 0 && <p className="px-4 py-4 text-[13px] text-[#9CA3AF]">No events</p>}
      </div>
    </div>
  )

  return (
    <div className="flex-1 overflow-auto">
      <Section title="Upcoming" events={upcoming}/>
      <Section title="Past" events={past}/>
    </div>
  )
}

// ── MAIN COMPONENT ────────────────────────────────────────────
export default function TeacherCalendar() {
  const { calendarEvents, assignments, tests, classrooms, addCalendarEvent } = useSchoolStore()
  const today = new Date()
  const [view, setView]         = useState('month')
  const [year, setYear]         = useState(today.getFullYear())
  const [month, setMonth]       = useState(today.getMonth())
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date(today); d.setDate(today.getDate() - today.getDay()); return d
  })
  const [showAdd, setShowAdd]   = useState(false)
  const [addDate, setAddDate]   = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)

  const allEvents = useMemo(
    () => buildAllEvents(calendarEvents, assignments, tests, classrooms),
    [calendarEvents, assignments, tests, classrooms]
  )

  // Navigation
  const goToday = () => {
    setYear(today.getFullYear()); setMonth(today.getMonth())
    const d = new Date(today); d.setDate(today.getDate()-today.getDay()); setWeekStart(d)
  }

  const prev = () => {
    if (view === 'month') { if (month===0){setMonth(11);setYear(y=>y-1)}else setMonth(m=>m-1) }
    else if (view === 'week') { const d=new Date(weekStart); d.setDate(d.getDate()-7); setWeekStart(d) }
  }
  const next = () => {
    if (view === 'month') { if (month===11){setMonth(0);setYear(y=>y+1)}else setMonth(m=>m+1) }
    else if (view === 'week') { const d=new Date(weekStart); d.setDate(d.getDate()+7); setWeekStart(d) }
  }

  const headerLabel = view === 'month'
    ? `${MONTHS[month]} ${year}`
    : view === 'week'
    ? `${MONTHS[weekStart.getMonth()]} ${weekStart.getFullYear()}`
    : 'All Events'

  // Upcoming sidebar
  const upcoming = allEvents.filter(e => new Date(e.date) >= today).slice(0,5)
  const dueSoon  = allEvents.filter(e => {
    const d = new Date(e.date), diff = (d-today)/86400000
    return diff >= 0 && diff <= 7 && (e.type==='assignment'||e.type==='deadline')
  })
  const upcomingExams = allEvents.filter(e => {
    const d = new Date(e.date), diff = (d-today)/86400000
    return diff >= 0 && diff <= 14 && (e.type==='exam'||e.type==='test')
  })

  return (
    <div className="flex gap-4 h-[calc(100vh-3.5rem-2rem)] fade-in">

      {/* ── LEFT SIDEBAR ── */}
      <div className="w-64 flex-shrink-0 flex flex-col gap-3">
        {/* Upcoming panel */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-border dark:border-[#1E293B] p-4 flex-shrink-0">
          <p className="text-[14px] font-bold text-[#111827] dark:text-[#F0F0F0] flex items-center gap-2 mb-3">
            <Clock size={14} className="text-[#5B5FEF]"/> Upcoming
          </p>

          {/* Due Soon */}
          <div className="rounded-xl bg-[#5B5FEF] p-3 mb-2 cursor-pointer hover:opacity-90 transition-opacity">
            <p className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">Assignments</p>
            <p className="text-[18px] font-bold text-white mt-0.5">Due Soon</p>
            <div className="flex justify-end mt-1"><ClipboardList size={20} className="text-white/50"/></div>
          </div>

          {/* Upcoming Exams */}
          <div className="rounded-xl bg-red-500 p-3 cursor-pointer hover:opacity-90 transition-opacity">
            <p className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">Exams</p>
            <p className="text-[18px] font-bold text-white mt-0.5">
              {upcomingExams.length > 0 ? upcomingExams[0].title.split(' ').slice(0,2).join(' ') : 'None'}
            </p>
            <div className="flex justify-end mt-1"><FileText size={20} className="text-white/50"/></div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-border dark:border-[#1E293B] p-4 flex-shrink-0">
          <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-3">Legend</p>
          <div className="space-y-2">
            {[
              { color:'bg-[#5B5FEF]', label:'Assignments (Online)' },
              { color:'bg-red-500',   label:'Offline Exams' },
              { color:'bg-gray-400',  label:'Past / Closed' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${l.color}`}/>
                <span className="text-[12px] text-[#6B7280] dark:text-[#9CA3AF]">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Add event button */}
        <button onClick={() => { setAddDate(''); setShowAdd(true) }}
          className="btn-primary flex items-center justify-center gap-2 text-[13px] py-2.5">
          <Plus size={14}/> Add Event
        </button>
      </div>

      {/* ── MAIN CALENDAR ── */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#1A1A1A] rounded-2xl border border-border dark:border-[#1E293B] overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-[#1E293B] flex-shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={prev} className="btn-ghost p-2 rounded-xl"><ChevronLeft size={16}/></button>
            <button onClick={next} className="btn-ghost p-2 rounded-xl"><ChevronRight size={16}/></button>
            <button onClick={goToday}
              className="px-3 py-1.5 rounded-xl text-[12px] font-semibold bg-surface-3 dark:bg-[#1E293B] text-[#374151] dark:text-[#D1D5DB] hover:bg-[#EAEBF0] dark:hover:bg-[#2E2E2E] transition-colors">
              today
            </button>
            <h2 className="text-[16px] font-bold text-[#111827] dark:text-[#F0F0F0] ml-2">{headerLabel}</h2>
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-surface-3 dark:bg-[#1E293B] rounded-xl p-0.5">
            {['month','week','list'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-all ${
                  view===v ? 'bg-white dark:bg-[#1A1A1A] text-[#111827] dark:text-[#F0F0F0] shadow-sm' : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#374151]'
                }`}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar body */}
        {view === 'month' && (
          <MonthView year={year} month={month} allEvents={allEvents}
            onDayClick={d => { setAddDate(d+'T09:00'); setShowAdd(true) }}
            onEventClick={setSelectedEvent}/>
        )}
        {view === 'week' && (
          <WeekView year={year} month={month} weekStart={weekStart} allEvents={allEvents}
            onEventClick={setSelectedEvent}/>
        )}
        {view === 'list' && (
          <ListView allEvents={allEvents} onEventClick={setSelectedEvent}/>
        )}
      </div>

      {/* ── ADD EVENT MODAL ── */}
      {showAdd && (
        <AddEventModal
          defaultDate={addDate}
          onClose={() => setShowAdd(false)}
          onAdd={ev => {
            addCalendarEvent({ ...ev, event_date: ev.event_date, event_type: ev.event_type })
            setShowAdd(false)
          }}
        />
      )}

      {/* ── EVENT DETAIL POPUP ── */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-border dark:border-[#1E293B] w-full max-w-sm shadow-2xl slide-up" onClick={e=>e.stopPropagation()}>
            <div className={`rounded-t-2xl p-4 ${EVENT_STYLE[selectedEvent.type]||EVENT_STYLE.general}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider opacity-80 capitalize">{selectedEvent.type}</p>
                  <p className="text-[17px] font-bold mt-0.5">{selectedEvent.title}</p>
                </div>
                <button onClick={() => setSelectedEvent(null)} className="opacity-70 hover:opacity-100"><X size={16}/></button>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-[13px] text-[#6B7280]">
                <Calendar size={13}/>
                {new Date(selectedEvent.date).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[#6B7280]">
                <Clock size={13}/> {fmt12(selectedEvent.date)}
              </div>
              {selectedEvent.classroom && (
                <div className="flex items-center gap-2 text-[13px] text-[#6B7280]">
                  <ClipboardList size={13}/> {selectedEvent.classroom}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



