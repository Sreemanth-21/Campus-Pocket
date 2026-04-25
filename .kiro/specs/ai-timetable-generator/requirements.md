# Requirements Document

## Introduction

The AI Timetable Generator is a new feature in the Campus Pocket Admin Portal that enables school administrators to automatically generate weekly class timetables using Gemini AI. The admin provides class configuration and subject-teacher assignments, and the system produces a conflict-free, evenly distributed weekly schedule. The generated timetable can be reviewed, edited manually, and saved to the database, where it becomes immediately visible to students and parents in their respective portals.

The feature integrates with the existing React + Vite frontend (premium dark theme, Tailwind CSS), the existing Supabase `timetable` table, and the existing `src/services/gemini.js` Gemini AI service.

---

## Glossary

- **Timetable_Generator**: The Admin Portal page at `/admin/timetable-generator` that orchestrates the full AI timetable creation workflow.
- **Configuration_Form**: Step 1 of the wizard — collects class name, periods per day, active days, period duration, and start time.
- **Subject_Assignment_Form**: Step 2 of the wizard — a dynamic table where the admin assigns subjects, teachers, and weekly period counts.
- **Gemini_Service**: The existing `src/services/gemini.js` module that communicates with the Google Gemini API.
- **Timetable_Grid**: The visual weekly grid displaying the generated schedule with colour-coded subject cells.
- **Conflict_Detector**: The logic that checks whether any teacher is double-booked across classes at the same period and day before saving.
- **Timetable_Table**: The existing Supabase `timetable` table with columns `id`, `class`, `day`, `subject`, `time`, and the extended `teacher`, `period` columns added by this feature.
- **Admin_Sidebar**: The left navigation panel in `AdminLayout.jsx` that lists all admin sections.
- **Toast_Notification**: A transient on-screen message confirming success or reporting errors.
- **Skeleton_Loader**: An animated placeholder UI shown while Gemini is generating the timetable.

---

## Requirements

### Requirement 1: Navigation Entry Point

**User Story:** As an admin, I want a "Generate Timetable" link in the Admin sidebar under a Timetable section, so that I can quickly navigate to the timetable generator from anywhere in the admin portal.

#### Acceptance Criteria

1. THE Admin_Sidebar SHALL display a "Timetable" section label in the navigation list.
2. THE Admin_Sidebar SHALL render a "Generate Timetable" nav link that navigates to `/admin/timetable-generator`.
3. WHEN the current route is `/admin/timetable-generator`, THE Admin_Sidebar SHALL apply the active highlight style consistent with other active nav links.
4. THE Admin_Sidebar SHALL display a calendar or sparkle icon alongside the "Generate Timetable" label, matching the icon style of existing nav items.

---

### Requirement 2: Class Configuration Form (Step 1)

**User Story:** As an admin, I want to fill in class configuration details in Step 1 of the timetable generator, so that the AI has the structural constraints needed to build the schedule.

#### Acceptance Criteria

1. THE Configuration_Form SHALL render the following fields: class name (text input), number of periods per day (numeric input), active days (Mon–Fri checkboxes), period duration in minutes (numeric input), and start time (time input).
2. WHEN the admin submits Step 1, THE Configuration_Form SHALL validate that class name is non-empty, periods per day is between 1 and 12, at least one day is selected, period duration is between 15 and 120 minutes, and start time is provided.
3. IF any validation rule in Acceptance Criterion 2 is violated, THEN THE Configuration_Form SHALL display an inline error message adjacent to the offending field and prevent progression to Step 2.
4. WHEN all fields in Step 1 are valid and the admin clicks "Next", THE Timetable_Generator SHALL transition to Step 2 and retain the Step 1 values for use in generation.
5. THE Configuration_Form SHALL pre-select Monday through Friday checkboxes by default.

---

### Requirement 3: Subject and Teacher Assignment Form (Step 2)

**User Story:** As an admin, I want to assign subjects, teachers, and weekly period counts in Step 2, so that the AI can distribute lessons correctly across the week.

#### Acceptance Criteria

1. THE Subject_Assignment_Form SHALL render a table with columns: Subject (text input), Teacher (text input), and Periods/Week (numeric input).
2. THE Subject_Assignment_Form SHALL initialise with one empty row and render an "Add Subject" button that appends a new empty row when clicked.
3. WHEN the admin clicks the delete icon on a row, THE Subject_Assignment_Form SHALL remove that row, provided at least one row remains.
4. WHEN the admin submits Step 2, THE Subject_Assignment_Form SHALL validate that every row has a non-empty subject name, a non-empty teacher name, and a periods-per-week value between 1 and the total weekly periods (periods per day × number of selected days).
5. IF any validation rule in Acceptance Criterion 4 is violated, THEN THE Subject_Assignment_Form SHALL display an inline error on the offending row and prevent generation.
6. WHEN the total periods assigned across all subjects exceeds the total available weekly periods, THE Subject_Assignment_Form SHALL display a warning banner stating the over-allocation count and prevent generation.
7. THE Subject_Assignment_Form SHALL allow the admin to navigate back to Step 1 to revise configuration without losing subject data.

---

### Requirement 4: AI Timetable Generation

**User Story:** As an admin, I want to click "✨ Generate Timetable" and have Gemini AI produce a complete weekly schedule, so that I don't have to manually arrange periods.

#### Acceptance Criteria

1. WHEN the admin clicks "✨ Generate Timetable", THE Timetable_Generator SHALL send a structured prompt to the Gemini_Service containing: class name, periods per day, selected days, start time, period duration, subject list with teacher names and weekly frequencies, and the constraint that no subject repeats more than twice per day.
2. THE Gemini_Service SHALL be instructed to return a JSON object keyed by day name, where each day maps to an ordered array of period objects with fields: `period` (integer), `time` (string in "HH:MM–HH:MM" format), `subject` (string), and `teacher` (string).
3. THE Gemini_Service SHALL be instructed to insert a LUNCH break entry at period 4 (or the middle period when periods per day is not 6) with subject "Lunch" and teacher "—".
4. WHEN the Gemini_Service returns a valid JSON response, THE Timetable_Generator SHALL parse and display the Timetable_Grid.
5. IF the Gemini_Service returns an invalid or unparseable JSON response, THEN THE Timetable_Generator SHALL display an error message "Failed to parse AI response. Please try regenerating." and enable the "🔄 Regenerate" button.
6. IF the Gemini_Service call fails due to a network or API error, THEN THE Timetable_Generator SHALL display an error message "AI generation failed. Please check your connection and try again." and enable the "🔄 Regenerate" button.
7. THE Timetable_Generator SHALL call the Gemini_Service with a `maxOutputTokens` value of at least 2000 to accommodate full weekly schedules.

---

### Requirement 5: Loading State

**User Story:** As an admin, I want to see an animated loading state while the AI is generating the timetable, so that I know the system is working and not frozen.

#### Acceptance Criteria

1. WHILE the Gemini_Service call is in progress, THE Timetable_Generator SHALL display a Skeleton_Loader in place of the Timetable_Grid.
2. WHILE the Gemini_Service call is in progress, THE Timetable_Generator SHALL display the text "🤖 AI is scheduling..." as a heading and "Optimizing for zero conflicts..." as a subheading.
3. WHILE the Gemini_Service call is in progress, THE Timetable_Generator SHALL disable the "✨ Generate Timetable" and "🔄 Regenerate" buttons to prevent duplicate requests.
4. THE Skeleton_Loader SHALL animate with a pulse effect consistent with the existing dark theme design system.

---

### Requirement 6: Timetable Grid Display

**User Story:** As an admin, I want to see the generated timetable as a colour-coded weekly grid, so that I can visually verify the schedule before saving.

#### Acceptance Criteria

1. THE Timetable_Grid SHALL render a table with days as columns (Monday through Friday, or the selected days) and period rows as rows.
2. THE Timetable_Grid SHALL display each cell with the subject name and teacher name.
3. THE Timetable_Grid SHALL apply subject-specific colour gradients: Math — blue, Science — green, English — purple, Hindi — orange, Social — teal, Lunch — yellow. Subjects not in this list SHALL receive a default neutral colour.
4. THE Timetable_Grid SHALL highlight the Lunch break row with a yellow background distinct from subject cells.
5. WHEN the current day of the week matches a column header, THE Timetable_Grid SHALL apply a highlight style to that column to indicate today.
6. THE Timetable_Grid SHALL be horizontally scrollable on viewports narrower than 768px.
7. WHEN the Timetable_Grid first appears after generation, THE Timetable_Generator SHALL animate the grid into view with a fade-in or slide-up transition.

---

### Requirement 7: Manual Edit Mode

**User Story:** As an admin, I want to manually edit individual cells in the generated timetable, so that I can make corrections without regenerating the entire schedule.

#### Acceptance Criteria

1. WHEN the admin clicks "✏️ Edit Manually", THE Timetable_Grid SHALL transition each non-Lunch cell into an editable state displaying a subject text input and a teacher text input.
2. WHILE in edit mode, THE Timetable_Grid SHALL display a "✅ Done Editing" button that commits all changes and returns the grid to read-only view.
3. WHEN the admin modifies a cell and clicks "✅ Done Editing", THE Timetable_Generator SHALL update the in-memory timetable data with the new values.
4. WHILE in edit mode, THE Timetable_Grid SHALL preserve the subject colour coding based on the current cell value.

---

### Requirement 8: Conflict Detection

**User Story:** As an admin, I want the system to detect teacher scheduling conflicts before saving, so that I don't accidentally assign the same teacher to two classes at the same time.

#### Acceptance Criteria

1. WHEN the admin clicks "✅ Save to Database", THE Conflict_Detector SHALL query the Timetable_Table for all existing timetable entries across all classes for the same school.
2. THE Conflict_Detector SHALL identify a conflict when a teacher name in the new timetable matches a teacher name in an existing timetable entry for a different class on the same day and at the same period time.
3. WHEN one or more conflicts are detected, THE Timetable_Generator SHALL highlight the conflicting cells in red and display a warning message for each conflict in the format: "⚠️ [Teacher Name] is already teaching [Class Name] during Period [N] on [Day]".
4. WHEN one or more conflicts are detected, THE Timetable_Generator SHALL prevent saving and require the admin to resolve conflicts via manual edit or regeneration before proceeding.
5. WHEN no conflicts are detected, THE Timetable_Generator SHALL proceed to save the timetable to the database.

---

### Requirement 9: Save to Database

**User Story:** As an admin, I want to save the generated timetable to the database, so that students and parents can immediately view the updated schedule in their portals.

#### Acceptance Criteria

1. WHEN the admin clicks "✅ Save to Database" and no conflicts exist, THE Timetable_Generator SHALL delete all existing Timetable_Table rows for the specified class name before inserting the new rows.
2. THE Timetable_Generator SHALL insert one row per period per day into the Timetable_Table, with columns: `class`, `day`, `subject`, `time`, and `teacher`.
3. WHEN the save operation completes successfully, THE Timetable_Generator SHALL display a Toast_Notification with the message "✅ Timetable generated and saved!".
4. IF the save operation fails due to a database error, THEN THE Timetable_Generator SHALL display a Toast_Notification with the message "❌ Failed to save timetable. Please try again." and retain the generated timetable in view.
5. WHEN the timetable is saved, THE Timetable_Table data SHALL be immediately queryable by the student and parent timetable pages using the existing `getTimetable(class)` function.

---

### Requirement 10: Regenerate

**User Story:** As an admin, I want to regenerate the timetable with a single click, so that I can get a different AI-generated schedule if the first one is unsatisfactory.

#### Acceptance Criteria

1. WHEN the admin clicks "🔄 Regenerate", THE Timetable_Generator SHALL call the Gemini_Service again with the same configuration and subject data, producing a new schedule.
2. WHEN regeneration begins, THE Timetable_Generator SHALL replace the current Timetable_Grid with the Skeleton_Loader and display the loading state as defined in Requirement 5.
3. WHEN regeneration completes successfully, THE Timetable_Generator SHALL replace the Skeleton_Loader with the newly generated Timetable_Grid.

---

### Requirement 11: Print Timetable

**User Story:** As an admin, I want to print the generated timetable, so that I can distribute physical copies to teachers and students.

#### Acceptance Criteria

1. WHEN the admin clicks the "Print" button, THE Timetable_Generator SHALL invoke the browser's native print dialog with the Timetable_Grid as the print content.
2. THE Timetable_Generator SHALL apply print-specific CSS that hides the sidebar, topbar, action buttons, and form steps, showing only the Timetable_Grid and class name heading.
3. THE Timetable_Generator SHALL render subject colour coding in the printed output using CSS background colours compatible with print media.

---

### Requirement 12: Timetable Schema Extension

**User Story:** As a developer, I want the Timetable_Table to store teacher names alongside subject and time data, so that the conflict detector and timetable display can reference teacher assignments.

#### Acceptance Criteria

1. THE Timetable_Table SHALL include a `teacher` column of type TEXT to store the assigned teacher's name for each period.
2. THE Timetable_Table SHALL include a `period` column of type INTEGER to store the period number within the day.
3. WHEN existing rows in the Timetable_Table do not have a teacher value, THE Timetable_Table SHALL default the `teacher` column to an empty string to maintain backward compatibility.
4. THE Timetable_Generator SHALL provide a SQL migration snippet in the design document for adding the `teacher` and `period` columns to the existing `timetable` table.
