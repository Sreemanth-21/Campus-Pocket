# Tasks

## Task List

- [x] 1. Fix global CSS: tap targets, input font size, sidebar link height
  - [x] 1.1 Add `min-height: 44px; min-width: 44px` to `.btn-ghost` in `src/index.css`
  - [x] 1.2 Add `min-height: 44px` to `.sidebar-link` in `src/index.css`
  - [x] 1.3 Set `font-size: 1rem` on `.input` in `src/index.css` to prevent iOS zoom

- [x] 2. Fix Layout components: focus trap and close-button tap target
  - [x] 2.1 Add focus trap `useEffect` to `AdminLayout.jsx` (trap focus in sidebar when `open` is true, restore on close)
  - [x] 2.2 Add focus trap `useEffect` to `StudentLayout.jsx`
  - [x] 2.3 Add focus trap `useEffect` to `ParentLayout.jsx`
  - [x] 2.4 Add focus trap `useEffect` to `TeacherLayout.jsx`
  - [x] 2.5 Increase sidebar X-close button padding to `p-2.5` in all four Layout components

- [x] 3. Fix Topbar: notification panel overflow
  - [x] 3.1 Add `right-0 max-w-[calc(100vw-2rem)]` positioning to `NotificationPanel` wrapper in `Topbar.jsx`

- [x] 4. Fix stat-card grids: add single-column base
  - [x] 4.1 Change `AdminDashboard.jsx` stats grid from `grid-cols-2 lg:grid-cols-4` to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
  - [x] 4.2 Change `StudentDashboard.jsx` quick-stats grid from `grid-cols-3` to `grid-cols-1 sm:grid-cols-3`
  - [x] 4.3 Change `AdminFees.jsx` summary grid from `grid-cols-3` to `grid-cols-1 sm:grid-cols-3`
  - [x] 4.4 Change `AdminAttendance.jsx` summary grid from `grid-cols-4` to `grid-cols-2 sm:grid-cols-4`
  - [x] 4.5 Audit and fix any remaining stat-card grids in Parent and Teacher portal dashboards (`ParentDashboard.jsx`, `TeacherDashboard.jsx`)

- [x] 5. Fix data tables: wrap in overflow-x-auto scroll containers
  - [x] 5.1 Wrap `AdminFees.jsx` table in `<div className="overflow-x-auto">` and add `min-w-[600px]` to `<table>`; add `px-2 sm:px-4` to `<th>` and `<td>`
  - [x] 5.2 Wrap `AdminStudents.jsx` main students table in `<div className="overflow-x-auto">` with `min-w-[700px]` on `<table>`; add responsive cell padding
  - [x] 5.3 Wrap `AdminTeachers.jsx` table in `<div className="overflow-x-auto">` with `min-w-[600px]`; add responsive cell padding
  - [x] 5.4 Wrap `AdminLeads.jsx` table in `<div className="overflow-x-auto">` with `min-w-[600px]`; add responsive cell padding
  - [x] 5.5 Wrap `AdminAttendance.jsx` attendance list in `<div className="overflow-x-auto">` if it uses a table; add responsive padding
  - [x] 5.6 Audit and wrap any tables in Teacher portal pages (`TeacherAttendance.jsx`, `TeacherAssignments.jsx`, `TeacherTests.jsx`)
  - [x] 5.7 Audit and wrap any tables in Student portal pages (`StudentGrades.jsx`, `StudentExams.jsx`, `StudentTests.jsx`, `StudentAssignments.jsx`)
  - [x] 5.8 Audit and wrap any tables in Parent portal pages (`ParentAttendance.jsx`, `ParentFees.jsx`, `ParentGrades.jsx`, `ParentExams.jsx`)

- [x] 6. Fix charts: responsive height containers
  - [x] 6.1 In `AdminDashboard.jsx`, wrap each `<ResponsiveContainer>` in a `<div className="h-40 sm:h-[200px]">` and change `height` prop to `"100%"`
  - [x] 6.2 In `StudentDashboard.jsx`, wrap grade trend chart in `<div className="h-36 sm:h-[160px]">` and change `height` to `"100%"`
  - [x] 6.3 In `StudentDetailModal.jsx`, wrap the performance chart in `<div className="h-40 sm:h-[200px]">` and change `height` to `"100%"`
  - [x] 6.4 Audit and apply responsive height wrappers to charts in `AdminAnalytics.jsx`, `TeacherDashboard.jsx`, `ParentDashboard.jsx`

- [x] 7. Fix AttendanceHeatmap: horizontal scroll wrapper
  - [x] 7.1 Wrap the entire return content of `AttendanceHeatmap.jsx` in `<div className="overflow-x-auto"><div className="min-w-[320px]">…</div></div>`

- [x] 8. Fix modals: full-screen on mobile, body scroll lock, tap targets
  - [x] 8.1 Update `StudentDetailModal.jsx`: change backdrop to `p-0 sm:p-4`, change panel to `w-full h-full sm:w-auto sm:h-auto sm:max-w-3xl sm:max-h-[92vh] rounded-none sm:rounded-3xl`
  - [x] 8.2 Add body scroll lock `useEffect` to `StudentDetailModal.jsx`
  - [x] 8.3 Change close button in `StudentDetailModal.jsx` from `w-8 h-8` to `w-11 h-11` (44 px)
  - [x] 8.4 Update `AddStudentModal` in `AdminStudents.jsx`: same backdrop/panel responsive sizing pattern as 8.1
  - [x] 8.5 Add body scroll lock `useEffect` to `AddStudentModal`
  - [x] 8.6 Change close button in `AddStudentModal` to `w-11 h-11`
  - [x] 8.7 Update `ImportModal` in `AdminStudents.jsx`: same responsive sizing pattern
  - [x] 8.8 Add body scroll lock `useEffect` to `ImportModal`
  - [x] 8.9 Change close button in `ImportModal` to `w-11 h-11`
  - [x] 8.10 Make `ImportModal` two-column upload/instructions grid collapse to single column on mobile: change `grid-cols-2` to `grid-cols-1 sm:grid-cols-2`

- [x] 9. Fix page content grids: collapse to single column on mobile
  - [x] 9.1 In `AdminDashboard.jsx`, change charts row from `lg:grid-cols-3` to `grid-cols-1 lg:grid-cols-3`; change bottom row from `lg:grid-cols-2` to `grid-cols-1 lg:grid-cols-2`
  - [x] 9.2 In `StudentDashboard.jsx`, change main grid from `lg:grid-cols-5` to `grid-cols-1 lg:grid-cols-5`; change bottom row from `lg:grid-cols-2` to `grid-cols-1 lg:grid-cols-2`
  - [x] 9.3 In `StudentDashboard.jsx` hero section, add responsive text: change `text-[26px]` to `text-[22px] sm:text-[26px]`
  - [x] 9.4 Audit and fix content grids in all Parent portal pages (ensure `grid-cols-1` base with `md:` or `lg:` breakpoints)
  - [x] 9.5 Audit and fix content grids in all Teacher portal pages
  - [x] 9.6 Audit and fix content grids in all Student portal pages (beyond Dashboard)

- [x] 10. Fix Login Page: error message overflow
  - [x] 10.1 Add `overflow-hidden` and `break-words` to the error message container in `LoginPage.jsx`
  - [x] 10.2 Verify the left hero panel is `hidden lg:flex` (already correct — confirm no changes needed)

- [x] 11. Fix AdminStudents detail view: responsive hero stat boxes
  - [x] 11.1 In `StudentDetail` component inside `AdminStudents.jsx`, change the 3 stat boxes flex row to wrap on mobile: add `flex-wrap` and `w-full sm:w-auto` to each stat box

- [x] 12. Write and run property-based tests
  - [x] 12.1 Install `fast-check` dev dependency: `npm install --save-dev fast-check`
  - [x] 12.2 Write property test for "no horizontal page overflow" — for any viewport width in [320, 1440], render each portal layout and assert `scrollWidth <= clientWidth`
  - [x] 12.3 Write property test for "interactive elements meet minimum tap target" — for any portal page rendered at 375 px, assert all `button, a, input, select` elements have `offsetHeight >= 44` and `offsetWidth >= 44`
  - [x] 12.4 Run property tests with `npx vitest run` and confirm both pass with ≥ 100 iterations each
