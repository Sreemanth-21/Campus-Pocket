import { useState, useEffect } from 'react'
import { ChevronRight, Calendar, Clock, BookOpen, AlertCircle, Plus, Trash2, ArrowLeft, Sparkles, AlertTriangle, RefreshCw, Printer } from 'lucide-react'
import { generateClassTimetable } from '../../services/gemini'
import { getAllTimetableEntries, saveTimetable, conflictDetector } from '../../services/timetableApi'

// ── CONSTANTS ────────────────────────────────────────────────

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

const DEFAULT_CONFIG = {
  className: '',
  periodsPerDay: 6,
  days: [...ALL_DAYS],
  periodDuration: 60,
  startTime: '08:00',
}

// ── VALIDATION ───────────────────────────────────────────────

/**
 * Validates a ClassConfig object.
 * Returns an errors object — empty means valid.
 *
 * @param {typeof DEFAULT_CONFIG} config
 * @returns {{ className?: string, periodsPerDay?: string, days?: string, periodDuration?: string, startTime?: string }}
 */
export function validateConfig(config) {
  const errors = {}

  if (!config.className || config.className.trim() === '') {
    errors.className = 'Class name is required.'
  }

  const ppd = Number(config.periodsPerDay)
  if (!Number.isInteger(ppd) || ppd < 1 || ppd > 12) {
    errors.periodsPerDay = 'Periods per day must be between 1 and 12.'
  }

  if (!config.days || config.days.length === 0) {
    errors.days = 'At least one day must be selected.'
  }

  const pd = Number(config.periodDuration)
  if (!Number.isInteger(pd) || pd < 15 || pd > 120) {
    errors.periodDuration = 'Period duration must be between 15 and 120 minutes.'
  }

  if (!config.startTime || config.startTime.trim() === '') {
    errors.startTime = 'Start time is required.'
  }

  return errors
}

// ── STEP INDICATOR ───────────────────────────────────────────

function StepIndicator({ step }) {
  const steps = [
    { id: 1, label: 'Class Config' },
    { id: 2, label: 'Subjects' },
    { id: 'result', label: 'Result' },
  ]

  const activeIndex = step === 'result' ? 2 : step - 1

  return (
    <div className="flex items-center gap-0 mb-6">
      {steps.map((s, i) => {
        const isActive = s.id === step
        const isDone = i < activeIndex
        return (
          <div key={s.id} className="flex items-center">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all duration-200
              ${isActive
                ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400'
                : isDone
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-ink-4 dark:text-[#3d5070]'
              }`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0
                ${isActive
                  ? 'bg-brand-500 text-white'
                  : isDone
                    ? 'bg-emerald-500 text-white'
                    : 'bg-surface-3 dark:bg-[#1a2235] text-ink-4 dark:text-[#3d5070]'
                }`}>
                {isDone ? '✓' : i + 1}
              </div>
              {s.label}
            </div>
            {i < steps.length - 1 && (
              <ChevronRight size={14} className="text-ink-4 dark:text-[#3d5070] mx-1 flex-shrink-0" />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── INLINE ERROR ─────────────────────────────────────────────

function FieldError({ message }) {
  if (!message) return null
  return (
    <p className="flex items-center gap-1.5 mt-1.5 text-[11px] text-red-600 dark:text-red-400 font-medium">
      <AlertCircle size={11} className="flex-shrink-0" />
      {message}
    </p>
  )
}

// ── SKELETON LOADER ──────────────────────────────────────────

/**
 * Animated pulse grid shown while Gemini is generating the timetable.
 * Renders a table-like skeleton with the same column/row structure as
 * the real TimetableGrid so the layout doesn't shift on load.
 */
function SkeletonLoader({ days = 5, periods = 6 }) {
  return (
    <div className="card max-w-5xl animate-pulse" aria-busy="true" aria-label="Generating timetable…">
      {/* Heading skeleton */}
      <div className="mb-6 space-y-2">
        <div className="h-5 w-56 rounded-lg bg-surface-3 dark:bg-[#1a2235]" />
        <div className="h-3.5 w-72 rounded-lg bg-surface-3 dark:bg-[#1a2235]" />
      </div>

      {/* Table skeleton */}
      <div className="overflow-x-auto rounded-xl border border-border/50 dark:border-[#1a2235]">
        <table className="w-full text-[12px]">
          {/* Header row */}
          <thead>
            <tr className="bg-surface-2 dark:bg-[#0D1117] border-b border-border/50 dark:border-[#1a2235]">
              {/* Period label column */}
              <th className="px-4 py-3 w-24">
                <div className="h-3 w-14 rounded bg-surface-3 dark:bg-[#1a2235]" />
              </th>
              {Array.from({ length: days }).map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <div className="h-3 w-16 mx-auto rounded bg-surface-3 dark:bg-[#1a2235]" />
                </th>
              ))}
            </tr>
          </thead>

          {/* Body rows */}
          <tbody className="divide-y divide-border/30 dark:divide-[#1a2235]">
            {Array.from({ length: periods }).map((_, rowIdx) => (
              <tr key={rowIdx} className="bg-surface dark:bg-[#0D1117]">
                {/* Period label */}
                <td className="px-4 py-4">
                  <div className="h-3 w-12 rounded bg-surface-3 dark:bg-[#1a2235]" />
                </td>
                {Array.from({ length: days }).map((_, colIdx) => (
                  <td key={colIdx} className="px-4 py-4">
                    <div className="space-y-1.5">
                      <div className="h-3 w-20 rounded bg-surface-3 dark:bg-[#1a2235]" />
                      <div className="h-2.5 w-14 rounded bg-surface-3/70 dark:bg-[#1a2235]/70" />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── CONFIG FORM (STEP 1) ─────────────────────────────────────

function ConfigForm({ config, onChange, onNext }) {
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState(false)

  function handleDayToggle(day) {
    const next = config.days.includes(day)
      ? config.days.filter(d => d !== day)
      : [...config.days, day]
    // Preserve Mon–Fri order
    onChange({ ...config, days: ALL_DAYS.filter(d => next.includes(d)) })
  }

  function handleSubmit(e) {
    e.preventDefault()
    setTouched(true)
    const errs = validateConfig(config)
    setErrors(errs)
    if (Object.keys(errs).length === 0) {
      onNext()
    }
  }

  // Live-validate once the user has attempted submission
  function handleChange(field, value) {
    const next = { ...config, [field]: value }
    onChange(next)
    if (touched) {
      setErrors(validateConfig(next))
    }
  }

  function handleDayChange(day) {
    const nextDays = config.days.includes(day)
      ? config.days.filter(d => d !== day)
      : [...config.days, day]
    const next = { ...config, days: ALL_DAYS.filter(d => nextDays.includes(d)) }
    onChange(next)
    if (touched) {
      setErrors(validateConfig(next))
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="card max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center flex-shrink-0">
            <Calendar size={16} className="text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-ink dark:text-[#F1F5F9]">Class Configuration</h2>
            <p className="text-[11px] text-ink-4 dark:text-[#3d5070] mt-0.5">Set up the structural constraints for the AI scheduler</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Class Name */}
          <div>
            <label htmlFor="className" className="block text-[12px] font-semibold text-ink-3 dark:text-[#94A3B8] mb-1.5">
              Class Name <span className="text-red-500">*</span>
            </label>
            <input
              id="className"
              type="text"
              className={`input ${errors.className ? 'border-red-400 dark:border-red-500 focus:ring-red-500/20 focus:border-red-400' : ''}`}
              placeholder="e.g. Grade 5A, Class 10B"
              value={config.className}
              onChange={e => handleChange('className', e.target.value)}
              aria-describedby={errors.className ? 'className-error' : undefined}
              aria-invalid={!!errors.className}
            />
            <FieldError message={errors.className} />
          </div>

          {/* Periods per Day + Period Duration — 2-col grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="periodsPerDay" className="block text-[12px] font-semibold text-ink-3 dark:text-[#94A3B8] mb-1.5">
                Periods per Day <span className="text-red-500">*</span>
              </label>
              <input
                id="periodsPerDay"
                type="number"
                min={1}
                max={12}
                className={`input ${errors.periodsPerDay ? 'border-red-400 dark:border-red-500 focus:ring-red-500/20 focus:border-red-400' : ''}`}
                placeholder="e.g. 6"
                value={config.periodsPerDay}
                onChange={e => handleChange('periodsPerDay', e.target.value === '' ? '' : Number(e.target.value))}
                aria-describedby={errors.periodsPerDay ? 'periodsPerDay-error' : undefined}
                aria-invalid={!!errors.periodsPerDay}
              />
              <FieldError message={errors.periodsPerDay} />
            </div>

            <div>
              <label htmlFor="periodDuration" className="block text-[12px] font-semibold text-ink-3 dark:text-[#94A3B8] mb-1.5">
                Period Duration (min) <span className="text-red-500">*</span>
              </label>
              <input
                id="periodDuration"
                type="number"
                min={15}
                max={120}
                className={`input ${errors.periodDuration ? 'border-red-400 dark:border-red-500 focus:ring-red-500/20 focus:border-red-400' : ''}`}
                placeholder="e.g. 60"
                value={config.periodDuration}
                onChange={e => handleChange('periodDuration', e.target.value === '' ? '' : Number(e.target.value))}
                aria-describedby={errors.periodDuration ? 'periodDuration-error' : undefined}
                aria-invalid={!!errors.periodDuration}
              />
              <FieldError message={errors.periodDuration} />
            </div>
          </div>

          {/* Start Time */}
          <div>
            <label htmlFor="startTime" className="block text-[12px] font-semibold text-ink-3 dark:text-[#94A3B8] mb-1.5">
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
                Start Time <span className="text-red-500">*</span>
              </span>
            </label>
            <input
              id="startTime"
              type="time"
              className={`input max-w-[180px] ${errors.startTime ? 'border-red-400 dark:border-red-500 focus:ring-red-500/20 focus:border-red-400' : ''}`}
              value={config.startTime}
              onChange={e => handleChange('startTime', e.target.value)}
              aria-describedby={errors.startTime ? 'startTime-error' : undefined}
              aria-invalid={!!errors.startTime}
            />
            <FieldError message={errors.startTime} />
          </div>

          {/* Active Days */}
          <div>
            <p className="text-[12px] font-semibold text-ink-3 dark:text-[#94A3B8] mb-2">
              Active Days <span className="text-red-500">*</span>
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Active school days">
              {ALL_DAYS.map(day => {
                const checked = config.days.includes(day)
                return (
                  <label
                    key={day}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[12px] font-semibold cursor-pointer select-none transition-all duration-150
                      ${checked
                        ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-300 dark:border-brand-700 text-brand-700 dark:text-brand-400'
                        : 'bg-surface dark:bg-[#0D1117] border-border/70 dark:border-[#1a2235] text-ink-3 dark:text-[#64748B] hover:border-border dark:hover:border-[#2a3a55]'
                      }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() => handleDayChange(day)}
                      aria-label={day}
                    />
                    <span className={`w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 border transition-all duration-150
                      ${checked
                        ? 'bg-brand-500 border-brand-500'
                        : 'border-border dark:border-[#2a3a55]'
                      }`}>
                      {checked && (
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                          <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    {day.slice(0, 3)}
                  </label>
                )
              })}
            </div>
            <FieldError message={errors.days} />
          </div>

          {/* Summary preview */}
          {config.className && config.days.length > 0 && Number(config.periodsPerDay) > 0 && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-brand-50/60 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900/30">
              <BookOpen size={13} className="text-brand-500 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-brand-700 dark:text-brand-400 leading-relaxed">
                <span className="font-semibold">{config.className}</span>
                {' · '}
                {config.days.length} day{config.days.length !== 1 ? 's' : ''}/week
                {' · '}
                {config.periodsPerDay} period{config.periodsPerDay !== 1 ? 's' : ''}/day
                {' · '}
                {config.periodsPerDay * config.days.length} total periods/week
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6 pt-5 border-t border-border/50 dark:border-[#1a2235]">
          <button type="submit" className="btn-primary flex items-center gap-2">
            Next: Add Subjects
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </form>
  )
}

// ── SUBJECT FORM VALIDATION ──────────────────────────────────

/**
 * Returns the max allowed periodsPerWeek for a given config.
 * @param {{ periodsPerDay: number, days: string[] }} config
 * @returns {number}
 */
export function totalWeeklyPeriods(config) {
  return Number(config.periodsPerDay) * config.days.length
}

/**
 * Validates a single SubjectRow.
 * Returns an error string or null.
 *
 * @param {{ subject: string, teacher: string, periodsPerWeek: number }} row
 * @param {number} maxPeriods
 * @returns {string|null}
 */
export function validateSubjectRow(row, maxPeriods) {
  if (!row.subject || row.subject.trim() === '') {
    return 'Subject name is required.'
  }
  if (!row.teacher || row.teacher.trim() === '') {
    return 'Teacher name is required.'
  }
  const ppw = Number(row.periodsPerWeek)
  if (!Number.isInteger(ppw) || ppw < 1 || ppw > maxPeriods) {
    return `Periods/week must be between 1 and ${maxPeriods}.`
  }
  return null
}

/**
 * Returns the over-allocation surplus (positive = over-allocated, ≤0 = fine).
 *
 * @param {{ periodsPerWeek: number }[]} rows
 * @param {number} maxPeriods
 * @returns {number}
 */
export function overAllocationSurplus(rows, maxPeriods) {
  const total = rows.reduce((sum, r) => sum + Number(r.periodsPerWeek || 0), 0)
  return total - maxPeriods
}

// ── SUBJECT FORM (STEP 2) ─────────────────────────────────────

function SubjectForm({ config, subjects, setSubjects, onBack, onGenerate, loading }) {
  const [rowErrors, setRowErrors] = useState({})   // { [id]: string }
  const [touched, setTouched] = useState(false)

  const max = totalWeeklyPeriods(config)
  const surplus = overAllocationSurplus(subjects, max)

  function addRow() {
    setSubjects(prev => [
      ...prev,
      { id: crypto.randomUUID(), subject: '', teacher: '', periodsPerWeek: 1 },
    ])
  }

  function removeRow(id) {
    if (subjects.length <= 1) return
    setSubjects(prev => prev.filter(r => r.id !== id))
    setRowErrors(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  function updateRow(id, field, value) {
    setSubjects(prev =>
      prev.map(r => r.id === id ? { ...r, [field]: value } : r)
    )
    if (touched) {
      // Re-validate the changed row live
      setRowErrors(prev => {
        const row = subjects.find(r => r.id === id)
        if (!row) return prev
        const updated = { ...row, [field]: value }
        const err = validateSubjectRow(updated, max)
        return { ...prev, [id]: err }
      })
    }
  }

  function validate() {
    const errors = {}
    subjects.forEach(row => {
      const err = validateSubjectRow(row, max)
      if (err) errors[row.id] = err
    })
    setRowErrors(errors)
    return Object.keys(errors).length === 0
  }

  function handleGenerate() {
    setTouched(true)
    const valid = validate()
    if (!valid) return
    if (surplus > 0) return   // over-allocation banner blocks generation
    onGenerate()
  }

  return (
    <div className="card max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center flex-shrink-0">
          <BookOpen size={16} className="text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <h2 className="text-[15px] font-bold text-ink dark:text-[#F1F5F9]">Subject &amp; Teacher Assignment</h2>
          <p className="text-[11px] text-ink-4 dark:text-[#3d5070] mt-0.5">
            Assign subjects, teachers, and weekly period counts for{' '}
            <span className="font-semibold text-brand-600 dark:text-brand-400">{config.className}</span>
            {' '}({max} total periods/week)
          </p>
        </div>
      </div>

      {/* Over-allocation warning banner */}
      {surplus > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 mb-5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
          <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-amber-700 dark:text-amber-300 font-medium leading-relaxed">
            <span className="font-bold">Over-allocated by {surplus} period{surplus !== 1 ? 's' : ''}.</span>
            {' '}The total assigned periods exceed the {max} available weekly periods. Reduce periods/week to proceed.
          </p>
        </div>
      )}

      {/* Subject table */}
      <div className="overflow-x-auto rounded-xl border border-border/50 dark:border-[#1a2235]">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-surface-2 dark:bg-[#0D1117] border-b border-border/50 dark:border-[#1a2235]">
              <th className="text-left px-4 py-3 font-semibold text-ink-3 dark:text-[#94A3B8] w-[40%]">
                Subject <span className="text-red-500">*</span>
              </th>
              <th className="text-left px-4 py-3 font-semibold text-ink-3 dark:text-[#94A3B8] w-[35%]">
                Teacher <span className="text-red-500">*</span>
              </th>
              <th className="text-left px-4 py-3 font-semibold text-ink-3 dark:text-[#94A3B8] w-[18%]">
                Periods/Week <span className="text-red-500">*</span>
              </th>
              <th className="px-4 py-3 w-[7%]" aria-label="Actions" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30 dark:divide-[#1a2235]">
            {subjects.map((row, idx) => {
              const rowErr = rowErrors[row.id]
              return (
                <tr
                  key={row.id}
                  className={`transition-colors ${rowErr ? 'bg-red-50/40 dark:bg-red-950/10' : 'bg-surface dark:bg-[#0D1117] hover:bg-surface-2 dark:hover:bg-[#0a0f1a]'}`}
                >
                  {/* Subject input */}
                  <td className="px-4 py-3 align-top">
                    <input
                      type="text"
                      className={`input text-[12px] ${rowErr && (!row.subject || row.subject.trim() === '') ? 'border-red-400 dark:border-red-500 focus:ring-red-500/20 focus:border-red-400' : ''}`}
                      placeholder="e.g. Mathematics"
                      value={row.subject}
                      onChange={e => updateRow(row.id, 'subject', e.target.value)}
                      aria-label={`Subject for row ${idx + 1}`}
                    />
                    {rowErr && (
                      <p className="flex items-center gap-1 mt-1.5 text-[11px] text-red-600 dark:text-red-400 font-medium">
                        <AlertCircle size={10} className="flex-shrink-0" />
                        {rowErr}
                      </p>
                    )}
                  </td>

                  {/* Teacher input */}
                  <td className="px-4 py-3 align-top">
                    <input
                      type="text"
                      className={`input text-[12px] ${rowErr && (!row.teacher || row.teacher.trim() === '') ? 'border-red-400 dark:border-red-500 focus:ring-red-500/20 focus:border-red-400' : ''}`}
                      placeholder="e.g. Mr. Smith"
                      value={row.teacher}
                      onChange={e => updateRow(row.id, 'teacher', e.target.value)}
                      aria-label={`Teacher for row ${idx + 1}`}
                    />
                  </td>

                  {/* Periods/Week input */}
                  <td className="px-4 py-3 align-top">
                    <input
                      type="number"
                      min={1}
                      max={max}
                      className={`input text-[12px] ${rowErr && (Number(row.periodsPerWeek) < 1 || Number(row.periodsPerWeek) > max) ? 'border-red-400 dark:border-red-500 focus:ring-red-500/20 focus:border-red-400' : ''}`}
                      value={row.periodsPerWeek}
                      onChange={e => updateRow(row.id, 'periodsPerWeek', e.target.value === '' ? '' : Number(e.target.value))}
                      aria-label={`Periods per week for row ${idx + 1}`}
                    />
                  </td>

                  {/* Delete button */}
                  <td className="px-4 py-3 align-top text-center">
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      disabled={subjects.length <= 1}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors
                        ${subjects.length <= 1
                          ? 'text-ink-4/40 dark:text-[#3d5070]/40 cursor-not-allowed'
                          : 'text-ink-4 dark:text-[#64748B] hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 dark:hover:text-red-400'
                        }`}
                      aria-label={`Delete row ${idx + 1}`}
                      title={subjects.length <= 1 ? 'At least one subject is required' : 'Remove this subject'}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Add Subject button */}
      <div className="mt-3">
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-dashed border-border dark:border-[#2a3a55] text-[12px] font-semibold text-ink-3 dark:text-[#64748B] hover:border-brand-400 dark:hover:border-brand-600 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          <Plus size={13} />
          Add Subject
        </button>
      </div>

      {/* Period allocation summary */}
      {subjects.length > 0 && (
        <div className={`flex items-start gap-2.5 px-4 py-3 mt-4 rounded-xl border ${
          surplus > 0
            ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30'
            : 'bg-brand-50/60 dark:bg-brand-950/20 border-brand-100 dark:border-brand-900/30'
        }`}>
          <BookOpen size={13} className={`flex-shrink-0 mt-0.5 ${surplus > 0 ? 'text-amber-500' : 'text-brand-500'}`} />
          <p className={`text-[12px] leading-relaxed ${surplus > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-brand-700 dark:text-brand-400'}`}>
            <span className="font-semibold">
              {subjects.reduce((s, r) => s + Number(r.periodsPerWeek || 0), 0)}
            </span>
            {' '}of{' '}
            <span className="font-semibold">{max}</span>
            {' '}weekly periods assigned
            {surplus > 0 && <span className="font-bold"> (+{surplus} over limit)</span>}
          </p>
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-between mt-6 pt-5 border-t border-border/50 dark:border-[#1a2235]">
        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border/70 dark:border-[#1a2235] text-[12px] font-semibold text-ink-3 dark:text-[#94A3B8] hover:bg-surface-2 dark:hover:bg-[#0a0f1a] hover:border-border dark:hover:border-[#2a3a55] transition-colors"
        >
          <ArrowLeft size={13} />
          Back
        </button>

        {/* Generate button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || surplus > 0}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles size={14} />
          {loading ? 'Generating…' : '✨ Generate Timetable'}
        </button>
      </div>
    </div>
  )
}

// ── TIMETABLE GRID ───────────────────────────────────────────

/**
 * Subject → colour token map.
 * Keys are lowercase for case-insensitive matching.
 * Each entry provides Tailwind classes for the cell background gradient,
 * the subject label, and the teacher label.
 */
const SUBJECT_COLOURS = {
  // Math variants
  math:        { bg: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30',   subject: 'text-blue-800 dark:text-blue-300',   teacher: 'text-blue-600 dark:text-blue-400',   ring: 'ring-blue-200 dark:ring-blue-800' },
  mathematics: { bg: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30',   subject: 'text-blue-800 dark:text-blue-300',   teacher: 'text-blue-600 dark:text-blue-400',   ring: 'ring-blue-200 dark:ring-blue-800' },
  // Science variants
  science:     { bg: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/30', subject: 'text-green-800 dark:text-green-300', teacher: 'text-green-600 dark:text-green-400', ring: 'ring-green-200 dark:ring-green-800' },
  // English variants
  english:     { bg: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/30', subject: 'text-purple-800 dark:text-purple-300', teacher: 'text-purple-600 dark:text-purple-400', ring: 'ring-purple-200 dark:ring-purple-800' },
  // Hindi variants
  hindi:       { bg: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/30', subject: 'text-orange-800 dark:text-orange-300', teacher: 'text-orange-600 dark:text-orange-400', ring: 'ring-orange-200 dark:ring-orange-800' },
  // Social variants
  social:           { bg: 'bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/40 dark:to-teal-900/30', subject: 'text-teal-800 dark:text-teal-300', teacher: 'text-teal-600 dark:text-teal-400', ring: 'ring-teal-200 dark:ring-teal-800' },
  'social studies': { bg: 'bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/40 dark:to-teal-900/30', subject: 'text-teal-800 dark:text-teal-300', teacher: 'text-teal-600 dark:text-teal-400', ring: 'ring-teal-200 dark:ring-teal-800' },
  // Lunch
  lunch:       { bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/40 dark:to-yellow-900/30', subject: 'text-yellow-800 dark:text-yellow-300', teacher: 'text-yellow-600 dark:text-yellow-400', ring: 'ring-yellow-200 dark:ring-yellow-800' },
}

/** Neutral colour for subjects not in the map */
const NEUTRAL_COLOUR = {
  bg:      'bg-gradient-to-br from-surface-2 to-surface-3 dark:from-[#0f1623] dark:to-[#0a0f1a]',
  subject: 'text-ink dark:text-[#F1F5F9]',
  teacher: 'text-ink-3 dark:text-[#64748B]',
  ring:    'ring-border dark:ring-[#1a2235]',
}

/**
 * Returns the colour token set for a given subject name.
 * Matching is case-insensitive and trims whitespace.
 */
function getSubjectColour(subject) {
  if (!subject) return NEUTRAL_COLOUR
  const key = subject.trim().toLowerCase()
  return SUBJECT_COLOURS[key] ?? NEUTRAL_COLOUR
}

/**
 * TimetableGrid — displays the generated weekly schedule as a colour-coded table.
 *
 * Props:
 *   schedule     {WeeklySchedule}       — keyed by day name, each value is an ordered PeriodEntry[]
 *   editMode     {boolean}              — when true, cells render inputs (Task 9)
 *   conflicts    {ConflictWarning[]}    — cells matching a conflict get a red highlight
 *   onCellChange {(day, idx, field, value) => void} — called when a cell input changes (Task 9)
 */
function TimetableGrid({ schedule, editMode = false, conflicts = [], onCellChange }) {
  // Derive the ordered list of days from the schedule keys, preserving Mon–Fri order
  const days = ALL_DAYS.filter(d => Object.prototype.hasOwnProperty.call(schedule, d))

  // Today's day name for column highlight
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })

  // Build a conflict lookup: "teacher|day|time" → true
  const conflictKeys = new Set(
    conflicts.map(c => `${c.teacher}|${c.day}|${c.time}`)
  )

  // Determine the number of periods from the first available day
  const firstDay = days[0]
  const periods = firstDay ? schedule[firstDay] : []

  if (!firstDay || periods.length === 0) {
    return (
      <p className="text-[12px] text-ink-4 dark:text-[#3d5070] text-center py-8">
        No schedule data to display.
      </p>
    )
  }

  return (
    // 8.6 — horizontally scrollable wrapper for narrow viewports
    <div className="overflow-x-auto rounded-xl border border-border/50 dark:border-[#1a2235]">
      <table className="w-full text-[12px] border-collapse min-w-[600px]">
        {/* ── Header row — days as columns ── */}
        <thead>
          <tr className="bg-surface-2 dark:bg-[#0D1117] border-b border-border/50 dark:border-[#1a2235]">
            {/* Period label column header */}
            <th
              scope="col"
              className="px-4 py-3 text-left font-semibold text-ink-3 dark:text-[#94A3B8] w-28 whitespace-nowrap"
            >
              Period
            </th>

            {/* 8.5 — Day column headers; today gets a highlight */}
            {days.map(day => {
              const isToday = day === today
              return (
                <th
                  key={day}
                  scope="col"
                  className={`px-4 py-3 text-center font-semibold whitespace-nowrap transition-colors
                    ${isToday
                      ? 'text-brand-700 dark:text-brand-400 bg-brand-50/60 dark:bg-brand-950/30'
                      : 'text-ink-3 dark:text-[#94A3B8]'
                    }`}
                >
                  <span className="flex flex-col items-center gap-0.5">
                    {day}
                    {isToday && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-brand-500 dark:text-brand-400">
                        Today
                      </span>
                    )}
                  </span>
                </th>
              )
            })}
          </tr>
        </thead>

        {/* ── Body rows — periods as rows ── */}
        <tbody className="divide-y divide-border/30 dark:divide-[#1a2235]">
          {periods.map((periodEntry, periodIdx) => {
            const isLunchRow = periodEntry.subject?.trim().toLowerCase() === 'lunch'

            return (
              <tr
                key={periodIdx}
                // 8.4 — Lunch row gets a distinct yellow row background
                className={`transition-colors ${
                  isLunchRow
                    ? 'bg-yellow-50/70 dark:bg-yellow-950/20'
                    : 'bg-surface dark:bg-[#0D1117]'
                }`}
              >
                {/* Period label cell */}
                <td className="px-4 py-3 align-middle whitespace-nowrap">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-ink dark:text-[#F1F5F9]">
                      {isLunchRow ? '🍽 Lunch' : `Period ${periodEntry.period}`}
                    </span>
                    <span className="text-[10px] text-ink-4 dark:text-[#3d5070]">
                      {periodEntry.time}
                    </span>
                  </div>
                </td>

                {/* One cell per day */}
                {days.map(day => {
                  const cell = schedule[day]?.[periodIdx]
                  if (!cell) {
                    return (
                      <td key={day} className="px-4 py-3 text-center">
                        <span className="text-ink-4 dark:text-[#3d5070]">—</span>
                      </td>
                    )
                  }

                  const isToday = day === today
                  const colour = getSubjectColour(cell.subject)
                  const conflictKey = `${cell.teacher}|${day}|${cell.time}`
                  const hasConflict = !isLunchRow && conflictKeys.has(conflictKey)

                  // 8.3 — subject colour gradient; 8.4 — lunch cells use yellow gradient
                  // 9.2 — in edit mode, non-Lunch cells render subject + teacher inputs
                  // 9.4 — colour updates reactively based on the current input value
                  const inEditMode = editMode && !isLunchRow

                  return (
                    <td
                      key={day}
                      className={`px-3 py-2.5 align-middle transition-colors
                        ${isToday ? 'bg-brand-50/30 dark:bg-brand-950/10' : ''}
                      `}
                    >
                      <div
                        className={`rounded-xl px-3 py-2.5 ring-1 transition-all duration-150
                          ${hasConflict
                            ? 'bg-red-50 dark:bg-red-950/30 ring-red-400 dark:ring-red-600'
                            : `${colour.bg} ${colour.ring}`
                          }`}
                      >
                        {inEditMode ? (
                          /* ── Edit mode: two compact inputs ── */
                          <div className="flex flex-col gap-1.5">
                            {/* Subject input — 9.4: colour updates as user types */}
                            <input
                              type="text"
                              value={cell.subject}
                              onChange={e => onCellChange(day, periodIdx, 'subject', e.target.value)}
                              placeholder="Subject"
                              aria-label={`Subject for ${day} period ${periodEntry.period}`}
                              className={`w-full rounded-lg border px-2 py-1 text-[11px] font-semibold leading-tight bg-white/70 dark:bg-black/30 border-white/50 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-white/60 dark:focus:ring-white/20 placeholder:text-ink-4/60 dark:placeholder:text-[#3d5070]/60
                                ${hasConflict ? 'text-red-700 dark:text-red-300' : colour.subject}`}
                            />
                            {/* Teacher input */}
                            <input
                              type="text"
                              value={cell.teacher}
                              onChange={e => onCellChange(day, periodIdx, 'teacher', e.target.value)}
                              placeholder="Teacher"
                              aria-label={`Teacher for ${day} period ${periodEntry.period}`}
                              className={`w-full rounded-lg border px-2 py-1 text-[10px] leading-tight bg-white/70 dark:bg-black/30 border-white/50 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-white/60 dark:focus:ring-white/20 placeholder:text-ink-4/60 dark:placeholder:text-[#3d5070]/60
                                ${hasConflict ? 'text-red-500 dark:text-red-400' : colour.teacher}`}
                            />
                          </div>
                        ) : (
                          /* ── Read-only mode ── */
                          <>
                            {/* Subject name */}
                            <p className={`font-semibold leading-tight truncate
                              ${hasConflict ? 'text-red-700 dark:text-red-300' : colour.subject}`}
                            >
                              {cell.subject}
                            </p>

                            {/* Teacher name — hidden for Lunch */}
                            {!isLunchRow && (
                              <p className={`text-[10px] mt-0.5 truncate
                                ${hasConflict ? 'text-red-500 dark:text-red-400' : colour.teacher}`}
                              >
                                {cell.teacher}
                              </p>
                            )}
                          </>
                        )}

                        {/* Conflict indicator */}
                        {hasConflict && (
                          <p className="text-[9px] font-bold text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                            <AlertCircle size={9} />
                            Conflict
                          </p>
                        )}
                      </div>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── MAIN PAGE COMPONENT ──────────────────────────────────────

export default function AdminTimetableGenerator() {
  const [step, setStep] = useState(1)                    // 1 | 2 | 'result'
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [subjects, setSubjects] = useState([
    { id: crypto.randomUUID(), subject: '', teacher: '', periodsPerWeek: 1 },
  ])
  const [schedule, setSchedule] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)               // null | 'parse' | 'network'
  const [conflicts, setConflicts] = useState([])
  const [toast, setToast] = useState(null)
  const [saving, setSaving] = useState(false)

  // ── Generate handler ─────────────────────────────────────
  async function handleGenerate() {
    setLoading(true)
    setError(null)
    setSchedule(null)
    setConflicts([])

    try {
      const result = await generateClassTimetable(config, subjects)

      if (result === null) {
        // generateClassTimetable returns null on parse failure or missing API key
        setError('parse')
        setLoading(false)
        return
      }

      setSchedule(result)
      setStep('result')
    } catch (err) {
      console.error('[AdminTimetableGenerator] generation error:', err)
      setError('network')
    } finally {
      setLoading(false)
    }
  }

  // ── Regenerate handler ───────────────────────────────────
  async function handleRegenerate() {
    await handleGenerate()
  }

  // ── Print handler ────────────────────────────────────────
  function handlePrint() {
    window.print()
  }

  // ── Save handler ─────────────────────────────────────────
  async function handleSave() {
    setSaving(true)
    setConflicts([])
    setToast(null)

    // 1. Fetch all existing timetable entries
    const existingEntries = await getAllTimetableEntries()

    // 2. Run conflict detector
    const detected = conflictDetector(schedule, config.className, existingEntries)

    if (detected.length > 0) {
      setConflicts(detected)
      setSaving(false)
      return  // block save
    }

    // 3. No conflicts — build rows and save
    const rows = []
    for (const [day, periods] of Object.entries(schedule)) {
      for (const entry of periods) {
        rows.push({
          class: config.className,
          day,
          subject: entry.subject,
          time: entry.time,
          teacher: entry.teacher,
          period: entry.period,
        })
      }
    }

    const { error: saveError } = await saveTimetable(config.className, rows)

    if (saveError) {
      setToast({ type: 'error', message: '❌ Failed to save timetable. Please try again.' })
    } else {
      setToast({ type: 'success', message: '✅ Timetable generated and saved!' })
    }

    setSaving(false)
  }

  // ── Toast auto-dismiss ───────────────────────────────────
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  return (
    <div className="space-y-5 fade-in max-w-5xl">
      {/* Page header */}
      <div>
        <h1 className="text-[20px] font-bold text-ink dark:text-[#F1F5F9]">✨ AI Timetable Generator</h1>
        <p className="text-[12px] text-ink-4 dark:text-[#3d5070] mt-0.5">
          Generate a conflict-free weekly class schedule using Gemini AI
        </p>
      </div>

      {/* Step indicator */}
      <div className="print:hidden">
        <StepIndicator step={step} />
      </div>

      {/* Step 1 — Class Configuration */}
      {step === 1 && (
        <div className="print:hidden">
          <ConfigForm
            config={config}
            onChange={setConfig}
            onNext={() => setStep(2)}
          />
        </div>
      )}

      {/* Step 2 — Subject & Teacher Assignment */}
      {step === 2 && !loading && (
        <div className="print:hidden">
          <SubjectForm
            config={config}
            subjects={subjects}
            setSubjects={setSubjects}
            onBack={() => setStep(1)}
            onGenerate={handleGenerate}
            loading={loading}
          />
        </div>
      )}

      {/* Loading state — skeleton + status text */}
      {loading && (
        <div className="space-y-4 print:hidden">
          {/* Status heading */}
          <div className="card max-w-5xl py-5 flex flex-col items-center gap-2 text-center">
            <p className="text-[16px] font-bold text-ink dark:text-[#F1F5F9]">🤖 AI is scheduling...</p>
            <p className="text-[12px] text-ink-4 dark:text-[#3d5070]">Optimizing for zero conflicts...</p>
          </div>

          {/* Skeleton grid */}
          <SkeletonLoader days={config.days.length} periods={Number(config.periodsPerDay)} />

          {/* Disabled action buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled
              className="btn-primary flex items-center gap-2 opacity-50 cursor-not-allowed"
            >
              <Sparkles size={14} />
              ✨ Generate Timetable
            </button>
            <button
              type="button"
              disabled
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border/70 dark:border-[#1a2235] text-[12px] font-semibold text-ink-3 dark:text-[#94A3B8] opacity-50 cursor-not-allowed"
            >
              <RefreshCw size={13} />
              🔄 Regenerate
            </button>
          </div>
        </div>
      )}

      {/* Error state — shown after Step 2 or result view when not loading */}
      {!loading && error && (step === 2 || step === 'result') && (
        <div className="card max-w-5xl space-y-4 print:hidden">
          {/* Error banner */}
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50">
            <AlertCircle size={15} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-red-700 dark:text-red-300 font-medium leading-relaxed">
              {error === 'parse'
                ? 'Failed to parse AI response. Please try regenerating.'
                : 'AI generation failed. Please check your connection and try again.'}
            </p>
          </div>

          {/* Regenerate button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRegenerate}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border/70 dark:border-[#1a2235] text-[12px] font-semibold text-ink-3 dark:text-[#94A3B8] hover:bg-surface-2 dark:hover:bg-[#0a0f1a] hover:border-border dark:hover:border-[#2a3a55] transition-colors"
            >
              <RefreshCw size={13} />
              🔄 Regenerate
            </button>
          </div>
        </div>
      )}

      {/* Result view — shown after successful generation */}
      {step === 'result' && !loading && schedule && (
        <div className="space-y-4 fade-in">
          {/* Result header — hidden when printing */}
          <div className="card max-w-5xl py-4 flex items-center justify-between gap-4 print:hidden">
            <div>
              <p className="text-[14px] font-bold text-ink dark:text-[#F1F5F9]">
                ✅ Timetable generated for{' '}
                <span className="text-brand-600 dark:text-brand-400">{config.className}</span>
              </p>
              <p className="text-[11px] text-ink-4 dark:text-[#3d5070] mt-0.5">
                Review the schedule below, then save or regenerate.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
              {/* 9.1 — "✏️ Edit Manually" visible when not in edit mode */}
              {!editMode && (
                <button
                  type="button"
                  onClick={() => { setEditMode(true); setConflicts([]) }}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border/70 dark:border-[#1a2235] text-[12px] font-semibold text-ink-3 dark:text-[#94A3B8] hover:bg-surface-2 dark:hover:bg-[#0a0f1a] hover:border-border dark:hover:border-[#2a3a55] transition-colors"
                >
                  ✏️ Edit Manually
                </button>
              )}

              {/* 9.3 — "✅ Done Editing" visible when in edit mode */}
              {editMode && (
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 text-[12px] font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors"
                >
                  ✅ Done Editing
                </button>
              )}

              <button
                type="button"
                onClick={handleRegenerate}
                disabled={loading}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border/70 dark:border-[#1a2235] text-[12px] font-semibold text-ink-3 dark:text-[#94A3B8] hover:bg-surface-2 dark:hover:bg-[#0a0f1a] hover:border-border dark:hover:border-[#2a3a55] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={13} />
                🔄 Regenerate
              </button>

              {/* 10.1 — "✅ Save to Database" button */}
              <button
                type="button"
                onClick={handleSave}
                disabled={loading || saving || editMode}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-700 bg-emerald-500 dark:bg-emerald-700 text-[12px] font-semibold text-white hover:bg-emerald-600 dark:hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving…' : '✅ Save to Database'}
              </button>

              {/* 12.1 — Print button */}
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border/70 dark:border-[#1a2235] text-[12px] font-semibold text-ink-3 dark:text-[#94A3B8] hover:bg-surface-2 dark:hover:bg-[#0a0f1a] hover:border-border dark:hover:border-[#2a3a55] transition-colors"
                title="Print timetable"
              >
                <Printer size={13} />
                Print
              </button>
            </div>
          </div>

          {/* Conflict warning list — shown when conflicts are detected; hidden when printing */}
          {conflicts.length > 0 && (
            <div className="card max-w-5xl border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-950/20 print:hidden">
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle size={15} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-bold text-red-700 dark:text-red-300">
                    {conflicts.length} Scheduling Conflict{conflicts.length !== 1 ? 's' : ''} Detected
                  </p>
                  <p className="text-[11px] text-red-600/80 dark:text-red-400/80 mt-0.5">
                    Resolve conflicts via manual edit or regeneration before saving.
                  </p>
                </div>
              </div>
              <ul className="space-y-1.5 ml-6">
                {conflicts.map((c, i) => (
                  <li key={i} className="text-[12px] text-red-700 dark:text-red-300 font-medium">
                    ⚠️ {c.teacher} is already teaching {c.existingClass} during Period {c.period} on {c.day}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Timetable Grid — wrapped in print-timetable-area for print CSS targeting */}
          <div className="print-timetable-area card max-w-5xl">
            {/* Class name heading — visible in print output */}
            <h2 className="print-class-heading text-[15px] font-bold text-ink dark:text-[#F1F5F9] mb-4 hidden print:block">
              {config.className} — Weekly Timetable
            </h2>
            <TimetableGrid
              schedule={schedule}
              editMode={editMode}
              conflicts={conflicts}
              onCellChange={(day, idx, field, value) => {
                setSchedule(prev => {
                  const updated = { ...prev }
                  updated[day] = prev[day].map((entry, i) =>
                    i === idx ? { ...entry, [field]: value } : entry
                  )
                  return updated
                })
              }}
            />
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-[13px] font-semibold transition-all duration-300 animate-fade-in
            ${toast.type === 'success'
              ? 'bg-emerald-600 dark:bg-emerald-700 text-white'
              : 'bg-red-600 dark:bg-red-700 text-white'
            }`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}
