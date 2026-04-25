# Tasks — AI Timetable Generator

## Task List

- [x] 1. Database schema migration
  - [x] 1.1 Write and run SQL migration to add `teacher` (TEXT NOT NULL DEFAULT '') and `period` (INTEGER NOT NULL DEFAULT 0) columns to the `timetable` table
  - [x] 1.2 Verify existing timetable rows are unaffected (teacher = '', period = 0)

- [x] 2. Gemini service — `generateClassTimetable`
  - [x] 2.1 Add `generateClassTimetable(config, subjects)` export to `src/services/gemini.js`
  - [x] 2.2 Build the structured prompt string from config and subjects (class name, days, periods per day, start time, period duration, subject list with teacher names and weekly frequencies, lunch break instruction, no-repeat-twice-per-day constraint)
  - [x] 2.3 Call `callGemini` with `maxOutputTokens: 2500` override
  - [x] 2.4 Extract and parse JSON from the response using a regex match (handle markdown code fences)
  - [x] 2.5 Return the parsed `WeeklySchedule` object or `null` on failure

- [x] 3. Timetable API service — `src/services/timetableApi.js`
  - [x] 3.1 Create `src/services/timetableApi.js`
  - [x] 3.2 Implement `getAllTimetableEntries()` — fetch all rows from the `timetable` table (used for conflict detection)
  - [x] 3.3 Implement `saveTimetable(className, rows)` — delete all existing rows for the class, then bulk-insert the new rows
  - [x] 3.4 Re-export `getTimetable` from `db.js` for co-location

- [x] 4. Conflict detector — pure function
  - [x] 4.1 Implement `conflictDetector(newSchedule, className, existingEntries)` as a pure function (no Supabase calls)
  - [x] 4.2 Build a lookup map `{ [teacher+day+time]: className }` from existing entries, excluding rows where `class === className`
  - [x] 4.3 For each cell in `newSchedule` where `teacher !== "—"`, check the lookup map and push a `ConflictWarning` if a match is found
  - [x] 4.4 Return the array of `ConflictWarning` objects (empty = no conflicts)

- [x] 5. Step 1 — Class Configuration Form
  - [x] 5.1 Create the `ConfigForm` sub-component (or section) inside `AdminTimetableGenerator.jsx`
  - [x] 5.2 Render fields: class name (text), periods per day (number), active days (Mon–Fri checkboxes, all pre-checked), period duration (number), start time (time input)
  - [x] 5.3 Implement validation: class name non-empty, periods per day 1–12, at least one day selected, period duration 15–120, start time provided
  - [x] 5.4 Display inline error messages adjacent to offending fields on failed validation
  - [x] 5.5 On valid submission, transition to Step 2 and retain config values

- [x] 6. Step 2 — Subject and Teacher Assignment Form
  - [x] 6.1 Create the `SubjectForm` sub-component (or section) inside `AdminTimetableGenerator.jsx`
  - [x] 6.2 Render a table with columns: Subject (text input), Teacher (text input), Periods/Week (number input)
  - [x] 6.3 Initialise with one empty row; render "Add Subject" button that appends a new empty row
  - [x] 6.4 Render a delete icon on each row; clicking it removes the row (minimum one row must remain)
  - [x] 6.5 Implement row validation: non-empty subject, non-empty teacher, periods-per-week between 1 and `periodsPerDay × days.length`
  - [x] 6.6 Display inline error on each offending row on failed validation
  - [x] 6.7 Implement over-allocation check: if sum of periodsPerWeek > total weekly periods, show a warning banner with the surplus count and block generation
  - [x] 6.8 Render a "← Back" button that returns to Step 1 without losing subject data

- [x] 7. AI generation and loading state
  - [x] 7.1 Wire the "✨ Generate Timetable" button to call `generateClassTimetable(config, subjects)` and set loading state
  - [x] 7.2 While loading, display a `SkeletonLoader` (animated pulse grid) in place of the timetable grid
  - [x] 7.3 While loading, display "🤖 AI is scheduling..." heading and "Optimizing for zero conflicts..." subheading
  - [x] 7.4 While loading, disable the "✨ Generate Timetable" and "🔄 Regenerate" buttons
  - [x] 7.5 On successful parse, store the `WeeklySchedule` in state and transition to the result view with a fade-in animation
  - [x] 7.6 On parse failure, display error message "Failed to parse AI response. Please try regenerating." and enable the Regenerate button
  - [x] 7.7 On network/API error, display error message "AI generation failed. Please check your connection and try again." and enable the Regenerate button

- [x] 8. Timetable Grid display
  - [x] 8.1 Implement `TimetableGrid` as a sub-component accepting `schedule`, `editMode`, `conflicts`, and `onCellChange` props
  - [x] 8.2 Render a `<table>` with days as columns and period rows as rows; each cell shows subject name and teacher name
  - [x] 8.3 Apply subject-specific colour gradients: Math — blue, Science — green, English — purple, Hindi — orange, Social — teal, Lunch — yellow; default neutral for unlisted subjects
  - [x] 8.4 Highlight the Lunch break row with a yellow background distinct from subject cells
  - [x] 8.5 Highlight today's column (compare day name to `new Date().toLocaleDateString('en-US', { weekday: 'long' })`)
  - [x] 8.6 Wrap the table in a horizontally scrollable container for viewports narrower than 768px

- [x] 9. Manual edit mode
  - [x] 9.1 Render an "✏️ Edit Manually" button that sets `editMode = true`
  - [x] 9.2 In edit mode, replace each non-Lunch cell with a subject text input and a teacher text input pre-filled with current values
  - [x] 9.3 Render a "✅ Done Editing" button that sets `editMode = false` and commits all in-memory changes
  - [x] 9.4 Preserve subject colour coding in edit mode based on the current input value

- [x] 10. Conflict detection and save flow
  - [x] 10.1 Render a "✅ Save to Database" button that triggers the save flow
  - [x] 10.2 On save click, call `getAllTimetableEntries()` then run `conflictDetector(schedule, className, existingEntries)`
  - [x] 10.3 If conflicts exist, highlight conflicting cells in red and display a warning list in the format "⚠️ [Teacher] is already teaching [Class] during Period [N] on [Day]"; block save
  - [x] 10.4 If no conflicts, call `saveTimetable(className, rows)` with one row per period per day
  - [x] 10.5 On successful save, display a toast notification "✅ Timetable generated and saved!"
  - [x] 10.6 On save failure, display a toast notification "❌ Failed to save timetable. Please try again." and retain the grid

- [x] 11. Regenerate
  - [x] 11.1 Render a "🔄 Regenerate" button (visible after first generation or on error)
  - [x] 11.2 On click, re-run `generateClassTimetable` with the same config and subjects, replacing the current grid with the skeleton loader during generation

- [x] 12. Print support
  - [x] 12.1 Render a "Print" button that calls `window.print()`
  - [x] 12.2 Add print-specific CSS (`@media print`) that hides the sidebar, topbar, action buttons, and wizard steps, showing only the timetable grid and class name heading
  - [x] 12.3 Ensure subject colour CSS background colours are included in print output (use `-webkit-print-color-adjust: exact`)

- [x] 13. Admin sidebar and routing
  - [x] 13.1 Add a "Timetable" section label and a "Generate Timetable" nav link (with Calendar or Sparkles icon) to the `nav` array in `AdminLayout.jsx`, pointing to `/admin/timetable-generator`
  - [x] 13.2 Add the active title entry `'/admin/timetable-generator': 'Timetable Generator'` to the `titles` map in `AdminLayout.jsx`
  - [x] 13.3 Add the `/admin/timetable-generator` route to `App.jsx` importing `AdminTimetableGenerator`

- [x] 14. Main page component — `AdminTimetableGenerator.jsx`
  - [x] 14.1 Create `src/pages/admin/AdminTimetableGenerator.jsx` with wizard state (`step`: 1 | 2 | 'result'), config state, subjects state, schedule state, editMode, loading, error, conflicts, toast, and saving
  - [x] 14.2 Render a step indicator showing Step 1 → Step 2 → Result
  - [x] 14.3 Compose all sub-components (ConfigForm, SubjectForm, SkeletonLoader, TimetableGrid, toast) based on current state
  - [x] 14.4 Apply the existing dark theme design system (card classes, dark:bg-*, border-border/50, etc.) consistent with other admin pages

- [x] 15. Property-based tests
  - [x] 15.1 Install `fast-check` as a dev dependency (`npm install --save-dev fast-check`)
  - [x] 15.2 Create `src/tests/timetable.property.test.js`
  - [x] 15.3 Write Property 1 test: generate arbitrary ClassConfig objects with at least one invalid field; assert validator returns non-empty errors (min 100 iterations) — `// Feature: ai-timetable-generator, Property 1: Step 1 validation rejects invalid configs`
  - [x] 15.4 Write Property 2 test: generate arbitrary subject lists and configs; assert over-allocation checker sign matches arithmetic (min 100 iterations) — `// Feature: ai-timetable-generator, Property 2: Step 2 over-allocation detection`
  - [x] 15.5 Write Property 3 test: generate subject rows with at least one invalid field; assert row validator flags it (min 100 iterations) — `// Feature: ai-timetable-generator, Property 3: Step 2 row validation rejects incomplete rows`
  - [x] 15.6 Write Property 4 test: generate arbitrary schedules and existing-entry sets with deliberate overlaps; assert conflict detector returns a warning for each overlap (min 100 iterations) — `// Feature: ai-timetable-generator, Property 4: Conflict detector identifies teacher double-bookings`
  - [x] 15.7 Write Property 5 test: generate schedules where existing entries share the same class; assert zero conflicts returned (min 100 iterations) — `// Feature: ai-timetable-generator, Property 5: Conflict detector produces no false positives for the same class`
  - [x] 15.8 Write Property 6 test: generate arbitrary valid configs (D days, P periods); assert saveTimetable inserts exactly D × P rows (min 100 iterations) — `// Feature: ai-timetable-generator, Property 6: Save produces one row per period per day`
  - [x] 15.9 Write Property 7 test: generate arbitrary WeeklySchedule objects; assert JSON round-trip produces deep-equal result (min 100 iterations) — `// Feature: ai-timetable-generator, Property 7: Gemini JSON extraction round-trip`
