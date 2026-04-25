# Design Document — AI Timetable Generator

## Overview

The AI Timetable Generator is an admin-only feature that lets school administrators generate a conflict-free weekly class timetable using Gemini AI. The admin fills in a two-step wizard (class configuration → subject/teacher assignments), clicks "✨ Generate Timetable", and receives a colour-coded weekly grid. The grid can be manually edited, conflict-checked, and saved to the existing Supabase `timetable` table, where it is immediately visible to students and parents.

The feature is entirely frontend + Supabase — no separate backend is needed. Gemini is called directly from the browser via the existing `src/services/gemini.js` service.

### Key Design Decisions

- **Wizard pattern (2 steps)**: Separates structural config from subject assignment, reducing cognitive load and enabling clean validation at each step.
- **Gemini JSON contract**: The prompt instructs Gemini to return a strict JSON schema. A regex-based JSON extractor (already used in `gemini.js`) handles markdown code fences in the response.
- **In-memory timetable state**: The generated schedule lives in React state until the admin explicitly saves it, allowing regeneration and manual edits without touching the database.
- **Delete-then-insert save strategy**: Replacing all rows for a class on save is simpler and safer than diffing, and matches the existing pattern in the codebase.
- **No FastAPI / Edge Function**: The Gemini API key is already exposed to the frontend via `VITE_GEMINI_API_KEY`. Conflict detection is a pure client-side query against Supabase.

---

## Architecture

```mermaid
flowchart TD
    Admin["Admin Browser"]
    AdminLayout["AdminLayout.jsx\n(sidebar nav)"]
    ATG["AdminTimetableGenerator.jsx\n/admin/timetable-generator"]
    Step1["ConfigForm\n(Step 1)"]
    Step2["SubjectForm\n(Step 2)"]
    Grid["TimetableGrid\n(display + edit)"]
    Gemini["src/services/gemini.js\ngenerateClassTimetable()"]
    GeminiAPI["Google Gemini API"]
    Conflict["conflictDetector()\n(pure function)"]
    Supabase["Supabase\ntimetable table"]
    StudentTT["StudentTimetable.jsx"]
    ParentTT["ParentTimetable.jsx"]

    Admin --> AdminLayout
    AdminLayout --> ATG
    ATG --> Step1
    Step1 -->|valid config| Step2
    Step2 -->|generate| Gemini
    Gemini --> GeminiAPI
    GeminiAPI -->|JSON schedule| Gemini
    Gemini -->|parsed schedule| ATG
    ATG --> Grid
    Grid -->|save| Conflict
    Conflict -->|no conflicts| Supabase
    Supabase -->|getTimetable()| StudentTT
    Supabase -->|getTimetable()| ParentTT
```

### Data Flow Summary

1. Admin fills Step 1 (class config) → Step 2 (subjects + teachers).
2. `generateClassTimetable(config, subjects)` builds a prompt and calls `callGemini()`.
3. The raw text response is JSON-extracted and parsed into a `WeeklySchedule` object.
4. The schedule is stored in React state and rendered as `TimetableGrid`.
5. On save, `conflictDetector()` queries Supabase for existing entries across all classes, then compares teacher/day/period overlaps.
6. If clean, the generator deletes existing rows for the class and bulk-inserts the new schedule.
7. `getTimetable(class)` in `db.js` (already used by student and parent pages) picks up the new rows immediately.

---

## Components and Interfaces

### New Files

| File | Purpose |
|------|---------|
| `src/pages/admin/AdminTimetableGenerator.jsx` | Main page component — orchestrates wizard state, generation, editing, conflict detection, and save |
| `src/services/timetableApi.js` | Supabase CRUD for the timetable table (generate prompt, save, delete-by-class, fetch-all-for-conflict) |

### Modified Files

| File | Change |
|------|--------|
| `src/pages/admin/AdminLayout.jsx` | Add "Generate Timetable" nav link with Calendar icon |
| `src/App.jsx` | Add `/admin/timetable-generator` route |
| `src/services/gemini.js` | Add `generateClassTimetable(config, subjects)` export |

---

### `AdminTimetableGenerator` Component

**State:**

```js
const [step, setStep]               = useState(1)           // 1 | 2 | 'result'
const [config, setConfig]           = useState({...})       // Step 1 values
const [subjects, setSubjects]       = useState([{...}])     // Step 2 rows
const [schedule, setSchedule]       = useState(null)        // WeeklySchedule | null
const [editMode, setEditMode]       = useState(false)
const [loading, setLoading]         = useState(false)
const [error, setError]             = useState(null)
const [conflicts, setConflicts]     = useState([])          // ConflictWarning[]
const [toast, setToast]             = useState(null)        // { type, message } | null
const [saving, setSaving]           = useState(false)
```

**Key handlers:**

- `handleGenerate()` — validates Step 2, calls `generateClassTimetable`, sets `schedule`
- `handleEditCell(day, periodIdx, field, value)` — updates `schedule` in-memory
- `handleSave()` — runs conflict detection, then calls `saveTimetable`
- `handlePrint()` — calls `window.print()`

---

### `generateClassTimetable(config, subjects)` — `gemini.js`

**Prompt contract:**

```
You are a school timetable scheduler. Generate a weekly timetable as a JSON object.

Class: {className}
Periods per day: {periodsPerDay}
Active days: {days.join(', ')}
Start time: {startTime}
Period duration: {periodDuration} minutes
Subjects: {JSON.stringify(subjects)}

Rules:
- No subject repeats more than twice per day
- Insert a LUNCH break at period {lunchPeriod} with subject "Lunch" and teacher "—"
- Distribute subjects evenly across the week matching their periods/week count
- Return ONLY valid JSON, no markdown

JSON format:
{
  "Monday": [
    { "period": 1, "time": "08:00–09:00", "subject": "Mathematics", "teacher": "Mr. Smith" },
    ...
  ],
  ...
}
```

**Return type:** `WeeklySchedule | null`

**Fallback:** If Gemini returns null or unparseable JSON, the component sets an error state and shows the retry button. No mock fallback is generated for timetables (unlike AI insights) because the schedule depends entirely on admin-supplied data.

**Token budget:** `maxOutputTokens: 2500` (overrides the default 1500 in `callGemini`). The function passes a custom `generationConfig` to the fetch call.

---

### `timetableApi.js`

```js
// Fetch all timetable rows (for conflict detection across all classes)
export async function getAllTimetableEntries()

// Delete all rows for a class, then bulk-insert new rows
export async function saveTimetable(className, rows)
// rows: Array<{ class, day, subject, time, teacher, period }>

// Fetch rows for a single class (thin wrapper — already exists in db.js)
// Re-exported here for co-location
export { getTimetable } from './db'
```

---

### `conflictDetector(newSchedule, className, existingEntries)`

Pure function — no side effects.

```ts
type ConflictWarning = {
  teacher: string
  existingClass: string
  day: string
  period: number
  time: string
}

function conflictDetector(
  newSchedule: WeeklySchedule,
  className: string,
  existingEntries: TimetableRow[]
): ConflictWarning[]
```

Logic:
1. Build a lookup map: `{ [teacher+day+time]: className }` from `existingEntries` (excluding rows where `class === className`).
2. For each cell in `newSchedule`, if `teacher !== "—"` and the lookup key exists → push a `ConflictWarning`.
3. Return the array (empty = no conflicts).

---

### `TimetableGrid` (sub-component within `AdminTimetableGenerator`)

Props:
```js
{
  schedule: WeeklySchedule,
  editMode: boolean,
  conflicts: ConflictWarning[],
  onCellChange: (day, periodIdx, field, value) => void
}
```

Renders a `<table>` with days as columns and periods as rows. In edit mode, each non-Lunch cell shows two `<input>` elements (subject, teacher). Conflict cells get a red ring. Today's column gets a highlight.

---

## Data Models

### `WeeklySchedule`

```ts
type PeriodEntry = {
  period: number      // 1-based index
  time: string        // "HH:MM–HH:MM"
  subject: string
  teacher: string
}

type WeeklySchedule = {
  [day: string]: PeriodEntry[]   // e.g. "Monday", "Tuesday", ...
}
```

### `SubjectRow` (Step 2 form state)

```ts
type SubjectRow = {
  id: string          // local uuid for React key
  subject: string
  teacher: string
  periodsPerWeek: number
}
```

### `ClassConfig` (Step 1 form state)

```ts
type ClassConfig = {
  className: string
  periodsPerDay: number           // 1–12
  days: string[]                  // subset of ['Monday',...,'Friday']
  periodDuration: number          // 15–120 minutes
  startTime: string               // "HH:MM"
}
```

### Supabase `timetable` Table (extended)

Existing columns: `id`, `class`, `day`, `subject`, `time`

New columns added by this feature:

```sql
ALTER TABLE timetable ADD COLUMN IF NOT EXISTS teacher TEXT NOT NULL DEFAULT '';
ALTER TABLE timetable ADD COLUMN IF NOT EXISTS period  INTEGER NOT NULL DEFAULT 0;
```

Full row shape after migration:

```ts
type TimetableRow = {
  id: string
  class: string
  day: string
  subject: string
  time: string        // "HH:MM–HH:MM"
  teacher: string     // "" for legacy rows
  period: number      // 0 for legacy rows
}
```

### SQL Migration Snippet

```sql
-- Run in Supabase SQL Editor
ALTER TABLE timetable ADD COLUMN IF NOT EXISTS teacher TEXT NOT NULL DEFAULT '';
ALTER TABLE timetable ADD COLUMN IF NOT EXISTS period  INTEGER NOT NULL DEFAULT 0;
```

Backward compatibility: existing rows get `teacher = ''` and `period = 0`. The student and parent timetable pages only read `subject` and `time`, so they are unaffected.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Step 1 validation rejects invalid configs

*For any* class configuration object, if any field violates the validation rules (empty class name, periods per day outside 1–12, no days selected, period duration outside 15–120, missing start time), then the validator function SHALL return a non-empty errors object and SHALL NOT return a valid config.

**Validates: Requirements 2.2, 2.3**

---

### Property 2: Step 2 over-allocation detection

*For any* list of subject rows and a class config, if the sum of `periodsPerWeek` across all rows exceeds `periodsPerDay × days.length`, then the over-allocation checker SHALL return a positive surplus count; otherwise it SHALL return zero or negative.

**Validates: Requirements 3.6**

---

### Property 3: Step 2 row validation rejects incomplete rows

*For any* list of subject rows, if any row has an empty subject name, empty teacher name, or a `periodsPerWeek` value outside `[1, totalWeeklyPeriods]`, then the row validator SHALL flag that row as invalid and SHALL NOT allow generation to proceed.

**Validates: Requirements 3.4, 3.5**

---

### Property 4: Conflict detector identifies teacher double-bookings

*For any* new weekly schedule and any set of existing timetable entries from other classes, the conflict detector SHALL return a warning for every (teacher, day, time) triple that appears in both the new schedule and the existing entries (excluding Lunch entries where teacher is "—").

**Validates: Requirements 8.2, 8.3**

---

### Property 5: Conflict detector produces no false positives for the same class

*For any* new weekly schedule for class X, existing timetable entries that also belong to class X SHALL NOT be flagged as conflicts, because the save operation replaces those rows.

**Validates: Requirements 8.1, 8.2**

---

### Property 6: Save produces one row per period per day

*For any* weekly schedule with D selected days and P periods per day, the `saveTimetable` function SHALL insert exactly D × P rows into the timetable table for the given class.

**Validates: Requirements 9.1, 9.2**

---

### Property 7: Gemini JSON extraction round-trip

*For any* valid `WeeklySchedule` object, serializing it to JSON and then running it through the same JSON-extraction regex used in `generateClassTimetable` SHALL produce an object deeply equal to the original.

**Validates: Requirements 4.2, 4.4**

---

## Error Handling

| Scenario | Behaviour |
|----------|-----------|
| Gemini returns unparseable JSON | Error banner: "Failed to parse AI response. Please try regenerating." Regenerate button enabled. |
| Gemini API network/auth error | Error banner: "AI generation failed. Please check your connection and try again." Regenerate button enabled. |
| Supabase save fails | Toast: "❌ Failed to save timetable. Please try again." Schedule remains in view. |
| Supabase conflict query fails | Treat as no existing entries (conservative — allow save). Log error to console. |
| Step 1 validation failure | Inline field errors. Step 2 blocked. |
| Step 2 validation failure | Inline row errors + over-allocation banner. Generation blocked. |
| Teacher conflict detected | Conflicting cells highlighted red. Warning list shown. Save blocked until resolved. |

---

## Testing Strategy

### Unit Tests (example-based)

- `conflictDetector()` with hand-crafted schedules and existing entries — verify correct conflict identification and no false positives.
- Step 1 validator with boundary values (periodsPerDay = 0, 1, 12, 13; periodDuration = 14, 15, 120, 121).
- Step 2 over-allocation checker with exact-match, under, and over totals.
- `saveTimetable` row count: mock Supabase client, verify delete + insert calls with correct row count.
- JSON extraction regex: valid JSON, JSON wrapped in markdown fences, malformed JSON.

### Property-Based Tests

Using [fast-check](https://github.com/dubzzz/fast-check) (already compatible with Vitest, the project's test runner).

Each property test runs a minimum of **100 iterations**.

Tag format: `// Feature: ai-timetable-generator, Property N: <property_text>`

- **Property 1** — Generate arbitrary `ClassConfig` objects with at least one invalid field; assert validator returns errors.
- **Property 2** — Generate arbitrary subject lists and configs; assert over-allocation checker sign matches arithmetic.
- **Property 3** — Generate subject rows with at least one invalid field; assert row validator flags it.
- **Property 4** — Generate arbitrary schedules and existing-entry sets with deliberate overlaps; assert conflict detector finds all of them.
- **Property 5** — Generate schedules where existing entries share the same class; assert zero conflicts returned.
- **Property 6** — Generate arbitrary valid configs (D days, P periods); assert `saveTimetable` inserts D × P rows.
- **Property 7** — Generate arbitrary `WeeklySchedule` objects; assert JSON round-trip produces deep-equal result.

### Integration Tests

- End-to-end save: generate a minimal schedule, call `saveTimetable`, then call `getTimetable(class)` and verify the rows match.
- Conflict detection against real Supabase data: insert a known entry, run conflict detector, verify warning is returned.

### Manual / Visual Tests

- Skeleton loader pulse animation visible during generation.
- Today's column highlight correct on the current weekday.
- Print CSS hides sidebar, topbar, and action buttons.
- Horizontal scroll on mobile viewport (< 768px).
- Subject colour coding renders correctly in both light and dark themes.
