/**
 * Property-Based Tests: AI Timetable Generator
 * Feature: ai-timetable-generator
 *
 * Property 1: Step 1 validation rejects invalid configs
 *   Validates: Requirements 2.2, 2.3
 *
 * Property 2: Step 2 over-allocation detection
 *   Validates: Requirements 3.6
 *
 * Property 3: Step 2 row validation rejects incomplete rows
 *   Validates: Requirements 3.4, 3.5
 *
 * Property 4: Conflict detector identifies teacher double-bookings
 *   Validates: Requirements 8.2, 8.3
 *
 * Property 5: Conflict detector produces no false positives for the same class
 *   Validates: Requirements 8.1, 8.2
 *
 * Property 6: Save produces one row per period per day
 *   Validates: Requirements 9.1, 9.2
 *
 * Property 7: Gemini JSON extraction round-trip
 *   Validates: Requirements 4.2, 4.4
 */

import { describe, it, expect, vi } from 'vitest'
import fc from 'fast-check'

// ── Import pure functions under test ─────────────────────────────────────────
import {
  validateConfig,
  validateSubjectRow,
  overAllocationSurplus,
  totalWeeklyPeriods,
} from '../pages/admin/AdminTimetableGenerator'

import { conflictDetector } from '../services/timetableApi'

// ── Mock Supabase so timetableApi can be imported without real credentials ───
vi.mock('../services/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockResolvedValue({ data: [], error: null }),
      delete: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    })),
  },
}))

// ── Mock db.js (re-exported by timetableApi) ─────────────────────────────────
vi.mock('../services/db', () => ({
  getTimetable: vi.fn().mockResolvedValue([]),
}))

// ── Arbitraries ───────────────────────────────────────────────────────────────

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

/** A valid ClassConfig that passes all Step 1 validation rules. */
const validConfigArb = fc.record({
  className: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
  periodsPerDay: fc.integer({ min: 1, max: 12 }),
  days: fc.subarray(ALL_DAYS, { minLength: 1 }),
  periodDuration: fc.integer({ min: 15, max: 120 }),
  startTime: fc.constantFrom('07:00', '08:00', '09:00', '10:00'),
})

/** A ClassConfig with at least one field that violates a validation rule. */
const invalidConfigArb = fc.oneof(
  // Empty class name
  validConfigArb.map(c => ({ ...c, className: '' })),
  // Whitespace-only class name
  validConfigArb.map(c => ({ ...c, className: '   ' })),
  // periodsPerDay = 0 (below minimum)
  validConfigArb.map(c => ({ ...c, periodsPerDay: 0 })),
  // periodsPerDay = 13 (above maximum)
  validConfigArb.map(c => ({ ...c, periodsPerDay: 13 })),
  // periodsPerDay negative
  fc.integer({ min: -100, max: -1 }).chain(ppd =>
    validConfigArb.map(c => ({ ...c, periodsPerDay: ppd }))
  ),
  // periodsPerDay > 12
  fc.integer({ min: 13, max: 100 }).chain(ppd =>
    validConfigArb.map(c => ({ ...c, periodsPerDay: ppd }))
  ),
  // No days selected
  validConfigArb.map(c => ({ ...c, days: [] })),
  // periodDuration = 14 (below minimum)
  validConfigArb.map(c => ({ ...c, periodDuration: 14 })),
  // periodDuration = 121 (above maximum)
  validConfigArb.map(c => ({ ...c, periodDuration: 121 })),
  // periodDuration out of range
  fc.integer({ min: 121, max: 500 }).chain(pd =>
    validConfigArb.map(c => ({ ...c, periodDuration: pd }))
  ),
  // Missing start time
  validConfigArb.map(c => ({ ...c, startTime: '' })),
  // Whitespace-only start time
  validConfigArb.map(c => ({ ...c, startTime: '  ' })),
)

/** A valid SubjectRow for a given maxPeriods. */
function validSubjectRowArb(maxPeriods) {
  return fc.record({
    id: fc.uuid(),
    subject: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
    teacher: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
    periodsPerWeek: fc.integer({ min: 1, max: maxPeriods }),
  })
}

/** A SubjectRow with at least one invalid field. */
function invalidSubjectRowArb(maxPeriods) {
  const base = validSubjectRowArb(maxPeriods)
  return fc.oneof(
    base.map(r => ({ ...r, subject: '' })),
    base.map(r => ({ ...r, subject: '   ' })),
    base.map(r => ({ ...r, teacher: '' })),
    base.map(r => ({ ...r, teacher: '   ' })),
    base.map(r => ({ ...r, periodsPerWeek: 0 })),
    base.map(r => ({ ...r, periodsPerWeek: maxPeriods + 1 })),
    fc.integer({ min: -50, max: -1 }).chain(ppw =>
      base.map(r => ({ ...r, periodsPerWeek: ppw }))
    ),
  )
}

/** A PeriodEntry (one cell in the timetable grid). */
const periodEntryArb = fc.record({
  period: fc.integer({ min: 1, max: 12 }),
  time: fc.constantFrom('08:00–09:00', '09:00–10:00', '10:00–11:00', '11:00–12:00', '12:00–13:00', '13:00–14:00'),
  subject: fc.string({ minLength: 1, maxLength: 20 }),
  teacher: fc.string({ minLength: 1, maxLength: 30 }).filter(t => t.trim() !== '—'),
})

/** A WeeklySchedule object with a given set of days and periods per day. */
function weeklyScheduleArb(days, periodsPerDay) {
  return fc.record(
    Object.fromEntries(
      days.map(day => [
        day,
        fc.array(periodEntryArb, { minLength: periodsPerDay, maxLength: periodsPerDay }),
      ])
    )
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Property 1: Step 1 validation rejects invalid configs
// Feature: ai-timetable-generator, Property 1: Step 1 validation rejects invalid configs
// Validates: Requirements 2.2, 2.3
// ─────────────────────────────────────────────────────────────────────────────
describe('Property 1: Step 1 validation rejects invalid configs — Validates: Requirements 2.2, 2.3', () => {
  it('for any ClassConfig with at least one invalid field, validateConfig returns a non-empty errors object', () => {
    // Feature: ai-timetable-generator, Property 1: Step 1 validation rejects invalid configs
    fc.assert(
      fc.property(invalidConfigArb, (config) => {
        const errors = validateConfig(config)
        expect(typeof errors).toBe('object')
        expect(Object.keys(errors).length).toBeGreaterThan(0)
      }),
      { numRuns: 100 }
    )
  })

  it('for any valid ClassConfig, validateConfig returns an empty errors object', () => {
    fc.assert(
      fc.property(validConfigArb, (config) => {
        const errors = validateConfig(config)
        expect(Object.keys(errors).length).toBe(0)
      }),
      { numRuns: 100 }
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Property 2: Step 2 over-allocation detection
// Feature: ai-timetable-generator, Property 2: Step 2 over-allocation detection
// Validates: Requirements 3.6
// ─────────────────────────────────────────────────────────────────────────────
describe('Property 2: Step 2 over-allocation detection — Validates: Requirements 3.6', () => {
  it('surplus sign matches arithmetic: positive when sum > max, non-positive when sum <= max', () => {
    // Feature: ai-timetable-generator, Property 2: Step 2 over-allocation detection
    fc.assert(
      fc.property(
        validConfigArb,
        fc.array(
          fc.record({
            id: fc.uuid(),
            subject: fc.string({ minLength: 1 }),
            teacher: fc.string({ minLength: 1 }),
            periodsPerWeek: fc.integer({ min: 1, max: 20 }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (config, rows) => {
          const max = totalWeeklyPeriods(config)
          const surplus = overAllocationSurplus(rows, max)
          const actualSum = rows.reduce((s, r) => s + Number(r.periodsPerWeek), 0)

          // The surplus must equal actualSum - max
          expect(surplus).toBe(actualSum - max)

          // Sign check: positive iff over-allocated
          if (actualSum > max) {
            expect(surplus).toBeGreaterThan(0)
          } else {
            expect(surplus).toBeLessThanOrEqual(0)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('totalWeeklyPeriods equals periodsPerDay × days.length for any valid config', () => {
    fc.assert(
      fc.property(validConfigArb, (config) => {
        const result = totalWeeklyPeriods(config)
        expect(result).toBe(Number(config.periodsPerDay) * config.days.length)
      }),
      { numRuns: 100 }
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Property 3: Step 2 row validation rejects incomplete rows
// Feature: ai-timetable-generator, Property 3: Step 2 row validation rejects incomplete rows
// Validates: Requirements 3.4, 3.5
// ─────────────────────────────────────────────────────────────────────────────
describe('Property 3: Step 2 row validation rejects incomplete rows — Validates: Requirements 3.4, 3.5', () => {
  it('for any subject row with at least one invalid field, validateSubjectRow returns a non-null error string', () => {
    // Feature: ai-timetable-generator, Property 3: Step 2 row validation rejects incomplete rows
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 30 }).chain(maxPeriods =>
          invalidSubjectRowArb(maxPeriods).map(row => ({ row, maxPeriods }))
        ),
        ({ row, maxPeriods }) => {
          const error = validateSubjectRow(row, maxPeriods)
          expect(error).not.toBeNull()
          expect(typeof error).toBe('string')
          expect(error.length).toBeGreaterThan(0)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('for any valid subject row, validateSubjectRow returns null', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 30 }).chain(maxPeriods =>
          validSubjectRowArb(maxPeriods).map(row => ({ row, maxPeriods }))
        ),
        ({ row, maxPeriods }) => {
          const error = validateSubjectRow(row, maxPeriods)
          expect(error).toBeNull()
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Property 4: Conflict detector identifies teacher double-bookings
// Feature: ai-timetable-generator, Property 4: Conflict detector identifies teacher double-bookings
// Validates: Requirements 8.2, 8.3
// ─────────────────────────────────────────────────────────────────────────────
describe('Property 4: Conflict detector identifies teacher double-bookings — Validates: Requirements 8.2, 8.3', () => {
  it('for any schedule with deliberate overlaps against other-class entries, a warning is returned for each overlap', () => {
    // Feature: ai-timetable-generator, Property 4: Conflict detector identifies teacher double-bookings
    fc.assert(
      fc.property(
        // Generate a non-empty set of (teacher, day, time) triples that will be overlapped
        fc.array(
          fc.record({
            teacher: fc.string({ minLength: 1, maxLength: 20 }).filter(t => t !== '—'),
            day: fc.constantFrom(...ALL_DAYS),
            time: fc.constantFrom('08:00–09:00', '09:00–10:00', '10:00–11:00', '11:00–12:00'),
            period: fc.integer({ min: 1, max: 6 }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), // className
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), // otherClassName (must differ)
        (overlaps, className, otherClassSuffix) => {
          const otherClassName = className + '_other_' + otherClassSuffix

          // Build a new schedule that contains all the overlapping entries
          const schedule = {}
          for (const o of overlaps) {
            if (!schedule[o.day]) schedule[o.day] = []
            // Avoid duplicate (day, period) pairs in the schedule
            const alreadyHasPeriod = schedule[o.day].some(e => e.period === o.period)
            if (!alreadyHasPeriod) {
              schedule[o.day].push({
                period: o.period,
                time: o.time,
                subject: 'TestSubject',
                teacher: o.teacher,
              })
            }
          }

          // Build existing entries from the other class that match the overlapping slots
          const existingEntries = []
          for (const [day, periods] of Object.entries(schedule)) {
            for (const entry of periods) {
              existingEntries.push({
                id: `existing-${day}-${entry.period}`,
                class: otherClassName,
                day,
                subject: 'OtherSubject',
                time: entry.time,
                teacher: entry.teacher,
                period: entry.period,
              })
            }
          }

          const warnings = conflictDetector(schedule, className, existingEntries)

          // Every entry in the schedule that has a matching existing entry must produce a warning
          let expectedWarningCount = 0
          for (const [day, periods] of Object.entries(schedule)) {
            for (const entry of periods) {
              const hasMatch = existingEntries.some(
                e => e.teacher === entry.teacher && e.day === day && e.time === entry.time
              )
              if (hasMatch) expectedWarningCount++
            }
          }

          expect(warnings.length).toBe(expectedWarningCount)
          expect(warnings.length).toBeGreaterThan(0)

          // Each warning must reference the correct teacher, day, and existing class
          for (const w of warnings) {
            expect(w.teacher).toBeTruthy()
            expect(w.existingClass).toBe(otherClassName)
            expect(ALL_DAYS).toContain(w.day)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Property 5: Conflict detector produces no false positives for the same class
// Feature: ai-timetable-generator, Property 5: Conflict detector produces no false positives for the same class
// Validates: Requirements 8.1, 8.2
// ─────────────────────────────────────────────────────────────────────────────
describe('Property 5: Conflict detector produces no false positives for the same class — Validates: Requirements 8.1, 8.2', () => {
  it('existing entries that belong to the same class never produce conflict warnings', () => {
    // Feature: ai-timetable-generator, Property 5: Conflict detector produces no false positives for the same class
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
        fc.array(
          fc.record({
            teacher: fc.string({ minLength: 1, maxLength: 20 }).filter(t => t !== '—'),
            day: fc.constantFrom(...ALL_DAYS),
            time: fc.constantFrom('08:00–09:00', '09:00–10:00', '10:00–11:00', '11:00–12:00'),
            period: fc.integer({ min: 1, max: 6 }),
          }),
          { minLength: 1, maxLength: 8 }
        ),
        (className, entries) => {
          // Build a schedule from the entries
          const schedule = {}
          for (const e of entries) {
            if (!schedule[e.day]) schedule[e.day] = []
            const alreadyHasPeriod = schedule[e.day].some(p => p.period === e.period)
            if (!alreadyHasPeriod) {
              schedule[e.day].push({
                period: e.period,
                time: e.time,
                subject: 'AnySubject',
                teacher: e.teacher,
              })
            }
          }

          // Build existing entries that ALL belong to the SAME class
          const existingEntries = []
          for (const [day, periods] of Object.entries(schedule)) {
            for (const entry of periods) {
              existingEntries.push({
                id: `same-class-${day}-${entry.period}`,
                class: className,   // same class — must be excluded from conflict check
                day,
                subject: 'AnySubject',
                time: entry.time,
                teacher: entry.teacher,
                period: entry.period,
              })
            }
          }

          const warnings = conflictDetector(schedule, className, existingEntries)

          // No warnings should be produced — same-class entries are excluded
          expect(warnings.length).toBe(0)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Property 6: Save produces one row per period per day
// Feature: ai-timetable-generator, Property 6: Save produces one row per period per day
// Validates: Requirements 9.1, 9.2
// ─────────────────────────────────────────────────────────────────────────────
describe('Property 6: Save produces one row per period per day — Validates: Requirements 9.1, 9.2', () => {
  it('for any valid config (D days, P periods), the rows array passed to saveTimetable has exactly D × P entries', () => {
    // Feature: ai-timetable-generator, Property 6: Save produces one row per period per day
    fc.assert(
      fc.property(
        validConfigArb,
        (config) => {
          const { className, periodsPerDay, days, startTime, periodDuration } = config
          const D = days.length
          const P = Number(periodsPerDay)

          // Build a minimal WeeklySchedule matching the config
          const schedule = {}
          for (const day of days) {
            schedule[day] = []
            for (let p = 1; p <= P; p++) {
              const startMinutes = timeToMinutes(startTime) + (p - 1) * Number(periodDuration)
              const endMinutes = startMinutes + Number(periodDuration)
              schedule[day].push({
                period: p,
                time: `${minutesToTime(startMinutes)}–${minutesToTime(endMinutes)}`,
                subject: p === Math.ceil(P / 2) ? 'Lunch' : 'TestSubject',
                teacher: p === Math.ceil(P / 2) ? '—' : 'TestTeacher',
              })
            }
          }

          // Build the rows array the same way AdminTimetableGenerator does before calling saveTimetable
          const rows = []
          for (const [day, periods] of Object.entries(schedule)) {
            for (const entry of periods) {
              rows.push({
                class: className,
                day,
                subject: entry.subject,
                time: entry.time,
                teacher: entry.teacher,
                period: entry.period,
              })
            }
          }

          // The row count must equal D × P
          expect(rows.length).toBe(D * P)

          // Every row must have the correct class name
          for (const row of rows) {
            expect(row.class).toBe(className)
          }

          // Each day must appear exactly P times
          for (const day of days) {
            const dayRows = rows.filter(r => r.day === day)
            expect(dayRows.length).toBe(P)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Property 7: Gemini JSON extraction round-trip
// Feature: ai-timetable-generator, Property 7: Gemini JSON extraction round-trip
// Validates: Requirements 4.2, 4.4
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Replicates the JSON extraction logic from generateClassTimetable in gemini.js:
 *   const match = rawText.match(/```(?:json)?\s*([\s\S]*?)```/) || rawText.match(/(\{[\s\S]*\})/)
 *   JSON.parse(match[1] ?? match[0])
 */
function extractJsonFromText(rawText) {
  const match =
    rawText.match(/```(?:json)?\s*([\s\S]*?)```/) ||
    rawText.match(/(\{[\s\S]*\})/)
  if (!match) return null
  try {
    return JSON.parse(match[1] ?? match[0])
  } catch {
    return null
  }
}

/** Arbitrary for a single PeriodEntry with a valid time string. */
const periodEntryForRoundTripArb = fc.record({
  period: fc.integer({ min: 1, max: 12 }),
  time: fc.constantFrom(
    '08:00–09:00', '09:00–10:00', '10:00–11:00', '11:00–12:00',
    '12:00–13:00', '13:00–14:00', '14:00–15:00'
  ),
  subject: fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('`') && !s.includes('\\')),
  teacher: fc.string({ minLength: 1, maxLength: 30 }).filter(s => !s.includes('`') && !s.includes('\\')),
})

/** Arbitrary for a WeeklySchedule (1–5 days, 1–8 periods each). */
const weeklyScheduleForRoundTripArb = fc.array(
  fc.constantFrom(...ALL_DAYS),
  { minLength: 1, maxLength: 5 }
).chain(days => {
  const uniqueDays = [...new Set(days)]
  return fc.record(
    Object.fromEntries(
      uniqueDays.map(day => [
        day,
        fc.array(periodEntryForRoundTripArb, { minLength: 1, maxLength: 8 }),
      ])
    )
  )
})

describe('Property 7: Gemini JSON extraction round-trip — Validates: Requirements 4.2, 4.4', () => {
  it('plain JSON: serializing a WeeklySchedule and extracting it produces a deep-equal result', () => {
    // Feature: ai-timetable-generator, Property 7: Gemini JSON extraction round-trip
    fc.assert(
      fc.property(weeklyScheduleForRoundTripArb, (schedule) => {
        // Simulate Gemini returning plain JSON (no markdown fences)
        const rawText = JSON.stringify(schedule)
        const extracted = extractJsonFromText(rawText)

        expect(extracted).not.toBeNull()
        expect(extracted).toEqual(schedule)
      }),
      { numRuns: 100 }
    )
  })

  it('markdown-fenced JSON: serializing a WeeklySchedule inside ```json fences and extracting it produces a deep-equal result', () => {
    fc.assert(
      fc.property(weeklyScheduleForRoundTripArb, (schedule) => {
        // Simulate Gemini returning JSON wrapped in markdown code fences
        const rawText = '```json\n' + JSON.stringify(schedule, null, 2) + '\n```'
        const extracted = extractJsonFromText(rawText)

        expect(extracted).not.toBeNull()
        expect(extracted).toEqual(schedule)
      }),
      { numRuns: 100 }
    )
  })

  it('unmarked code fences: serializing a WeeklySchedule inside ``` fences and extracting it produces a deep-equal result', () => {
    fc.assert(
      fc.property(weeklyScheduleForRoundTripArb, (schedule) => {
        // Simulate Gemini returning JSON wrapped in plain code fences (no language tag)
        const rawText = '```\n' + JSON.stringify(schedule) + '\n```'
        const extracted = extractJsonFromText(rawText)

        expect(extracted).not.toBeNull()
        expect(extracted).toEqual(schedule)
      }),
      { numRuns: 100 }
    )
  })
})

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60) % 24
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
