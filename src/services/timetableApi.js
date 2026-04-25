/**
 * timetableApi.js — Timetable CRUD service
 * Handles fetching all timetable entries (for conflict detection) and
 * saving a generated timetable (delete-then-insert per class).
 */
import { supabase } from './supabase'

// ── CONFLICT DETECTOR ─────────────────────────────────────────

/**
 * Pure function — no Supabase calls, no side effects.
 *
 * Detects teacher double-bookings between a new schedule and existing
 * timetable entries from other classes.
 *
 * @param {WeeklySchedule} newSchedule
 *   Object keyed by day name, each value an array of PeriodEntry.
 * @param {string} className
 *   The class being saved. Existing entries for this class are excluded
 *   from the lookup map because save will replace those rows anyway.
 * @param {TimetableRow[]} existingEntries
 *   All rows currently in the timetable table (from getAllTimetableEntries).
 * @returns {ConflictWarning[]}
 *   One warning per detected double-booking. Empty array = no conflicts.
 */
export function conflictDetector(newSchedule, className, existingEntries) {
  // Step 1: Build lookup map { "teacher|day|time": existingClassName }
  // Exclude rows that belong to the class being saved (they will be replaced).
  const lookup = {}
  for (const entry of existingEntries) {
    if (entry.class === className) continue
    const key = `${entry.teacher}|${entry.day}|${entry.time}`
    lookup[key] = entry.class
  }

  // Step 2: Check each cell in the new schedule against the lookup map.
  const warnings = []
  for (const [day, periods] of Object.entries(newSchedule)) {
    for (const periodEntry of periods) {
      // Skip lunch breaks and any unassigned slots
      if (periodEntry.teacher === '—') continue

      const key = `${periodEntry.teacher}|${day}|${periodEntry.time}`
      if (key in lookup) {
        warnings.push({
          teacher: periodEntry.teacher,
          existingClass: lookup[key],
          day,
          period: periodEntry.period,
          time: periodEntry.time,
        })
      }
    }
  }

  return warnings
}

// Re-export getTimetable from db.js for co-location
export { getTimetable } from './db'

// ── CONFLICT DETECTION ───────────────────────────────────────

/**
 * Fetch every row from the timetable table across all classes.
 * Used by the conflict detector to check teacher double-bookings.
 *
 * @returns {Promise<TimetableRow[]>} All timetable rows, or [] on error.
 */
export async function getAllTimetableEntries() {
  const { data, error } = await supabase
    .from('timetable')
    .select('id, class, day, subject, time, teacher, period')

  if (error) {
    console.error('[getAllTimetableEntries]', error.message)
    return []
  }

  return data || []
}

// ── SAVE ─────────────────────────────────────────────────────

/**
 * Replace the timetable for a class with a new set of rows.
 * Deletes all existing rows for `className`, then bulk-inserts `rows`.
 *
 * @param {string} className  - The class identifier (e.g. "Grade 5A")
 * @param {Array<{
 *   class: string,
 *   day: string,
 *   subject: string,
 *   time: string,
 *   teacher: string,
 *   period: number
 * }>} rows - One entry per period per day
 * @returns {Promise<{ data: TimetableRow[] | null, error: Error | null }>}
 */
export async function saveTimetable(className, rows) {
  // Step 1: Delete all existing rows for this class
  const { error: deleteError } = await supabase
    .from('timetable')
    .delete()
    .eq('class', className)

  if (deleteError) {
    console.error('[saveTimetable] delete failed', deleteError.message)
    return { data: null, error: deleteError }
  }

  // Step 2: Bulk-insert the new rows
  const { data, error: insertError } = await supabase
    .from('timetable')
    .insert(rows)
    .select()

  if (insertError) {
    console.error('[saveTimetable] insert failed', insertError.message)
    return { data: null, error: insertError }
  }

  return { data, error: null }
}
