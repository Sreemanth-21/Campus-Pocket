# Design Document: Responsive Mobile Layout

## Overview

This feature makes every portal and shared component in Campus Pocket fully responsive across all screen sizes — from 320 px mobile phones to 4K desktops — without a separate mobile build.

The app already has a solid foundation: all four Layout components (`AdminLayout`, `StudentLayout`, `ParentLayout`, `TeacherLayout`) implement a sidebar drawer pattern with `translate-x-full / lg:translate-x-0` toggling, and the shared `Topbar` already hides the username on small screens with `hidden sm:block`. The work is primarily **filling the gaps**: wrapping tables in scroll containers, making stat-card grids responsive, fixing modal sizing, ensuring tap targets meet 44 px minimums, and adding `overflow-x-auto` to the `AttendanceHeatmap`.

### Key Design Decisions

- **No new libraries.** All responsiveness is achieved with Tailwind CSS utility classes already in the project. No additional CSS-in-JS, no media-query hooks.
- **Mobile-first Tailwind.** Base classes target the smallest viewport; `sm:`, `md:`, `lg:` prefixes progressively enhance for larger screens.
- **Minimal component API changes.** Existing component props are preserved. Changes are additive (new classes, new wrapper `<div>`s).
- **No separate mobile routes or components.** The same component tree renders at all sizes.

---

## Architecture

The responsive layout system is a pure CSS/Tailwind concern layered on top of the existing React component tree. No state management changes, no new contexts, no routing changes.

```
App (React Router)
├── LoginPage                    ← fix: full-width form on mobile
├── AdminLayout                  ← fix: sidebar focus trap, tap targets
│   ├── Topbar (shared)          ← already mostly correct; minor tap-target fixes
│   └── <Outlet>
│       ├── AdminDashboard       ← fix: stat-card grid, chart heights
│       ├── AdminStudents        ← fix: table scroll wrapper, modal full-screen
│       ├── AdminAttendance      ← fix: summary grid, table scroll wrapper
│       ├── AdminFees            ← fix: table scroll wrapper
│       ├── AdminAnalytics       ← fix: chart heights
│       ├── AdminTeachers        ← fix: table scroll wrapper
│       ├── AdminLeads           ← fix: table scroll wrapper
│       └── AdminCirculars       ← fix: content grid
├── StudentLayout                ← fix: sidebar focus trap, tap targets
│   └── <Outlet>
│       ├── StudentDashboard     ← fix: stat-card grid, chart heights, hero section
│       ├── StudentAttendance    ← fix: heatmap scroll wrapper
│       └── … (other pages)     ← fix: content grids
├── ParentLayout                 ← fix: sidebar focus trap, tap targets
│   └── <Outlet> …
└── TeacherLayout                ← fix: sidebar focus trap, tap targets
    └── <Outlet> …

Shared Components:
├── Topbar.jsx                   ← minor tap-target fixes
├── StatCard.jsx                 ← no changes needed (already fills cell width)
├── AttendanceHeatmap.jsx        ← fix: wrap in overflow-x-auto
├── StudentDetailModal.jsx       ← fix: full-screen on mobile, body scroll lock
├── NotificationPanel.jsx        ← fix: ensure viewport-contained positioning
└── LoadingSpinner.jsx           ← no changes needed
```

### Breakpoint Strategy

| Tailwind prefix | Viewport | Usage |
|---|---|---|
| (none) | 0 – 639 px | Mobile base styles |
| `sm:` | ≥ 640 px | 2-column grids, show username in topbar |
| `md:` | ≥ 768 px | 2-column content grids, table padding |
| `lg:` | ≥ 1024 px | Sidebar always visible, 4-column grids, `p-6` main padding |

---

## Components and Interfaces

### 1. Layout Components (Admin / Student / Parent / Teacher)

**Current state:** All four layouts already implement the drawer pattern correctly. The sidebar uses `fixed lg:static`, `translate-x-full lg:translate-x-0`, and an overlay `div` with `lg:hidden`. The `open` state is toggled by the hamburger button.

**Gaps to fix:**

| Gap | Fix |
|---|---|
| No focus trap when drawer is open | Add `useEffect` that sets `tabIndex=-1` on main content and calls `focus()` on first sidebar link when `open` is true; restore on close |
| Sidebar nav links lack 44 px min-height | Add `min-h-[44px]` to `.sidebar-link` in `index.css` (or add `py-3` to each NavLink) |
| Close button inside sidebar is `p-1` (too small) | Change to `p-2.5` (≥ 44 px with icon) |

**No interface changes** — `open` / `setOpen` state remains internal.

### 2. Topbar (`src/components/Topbar.jsx`)

**Current state:** Already has `lg:hidden` on the hamburger button, `hidden sm:block` on username/role text, and `btn-ghost p-2` on action buttons.

**Gaps to fix:**

| Gap | Fix |
|---|---|
| `btn-ghost p-2` gives ~36 px tap target | Add `min-h-[44px] min-w-[44px]` to `.btn-ghost` in `index.css` |
| Notification panel can overflow viewport on narrow screens | Add `right-0 max-w-[calc(100vw-2rem)]` to `NotificationPanel` positioning |

### 3. StatCard Grids

**Current state:** Grids use `grid-cols-2 lg:grid-cols-4` (AdminDashboard) or `grid-cols-3` (StudentDashboard quick stats) — missing the single-column base for very narrow screens.

**Fix pattern** (applied to every stat-card grid in all portals):
```jsx
// Before
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

// After
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
```

For 3-card grids (StudentDashboard):
```jsx
// Before
<div className="grid grid-cols-3 gap-3">

// After
<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
```

`StatCard` itself needs no changes — it already fills its grid cell.

### 4. Data Tables

**Current state:** Tables like `AdminFees`, `AdminStudents`, `AdminTeachers`, `AdminLeads` render `<table className="w-full">` directly inside a `.card` with `overflow-hidden`. On narrow viewports the table overflows the card and the page.

**Fix pattern** (applied to every table):
```jsx
// Before
<div className="card p-0 overflow-hidden">
  <table className="w-full">

// After
<div className="card p-0 overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full min-w-[600px]">
```

The `min-w-[600px]` (or appropriate value per table) ensures the table retains its column layout while the outer `overflow-x-auto` provides the scroll affordance.

**Cell padding** — add `px-2 sm:px-4` to `<th>` and `<td>` elements that currently use `px-4` only.

**Row height** — existing `py-3` on rows already gives ~44 px height with 14 px font; no change needed.

### 5. Charts (`Recharts`)

**Current state:** All charts already use `<ResponsiveContainer width="100%">`. Heights are hardcoded (e.g., `height={200}`, `height={160}`).

**Fix:** No code change needed for `width="100%"` — already correct. For height on small screens, use a responsive height approach:

```jsx
// Pattern: use a CSS class on the wrapper instead of a fixed height prop
<div className="h-40 sm:h-[200px]">
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart ...>
```

This lets the chart fill its CSS-controlled container, which shrinks on mobile.

**Tooltip overflow:** Recharts tooltips are positioned absolutely within the chart SVG. No fix needed — they are already contained within the `ResponsiveContainer` bounds.

### 6. AttendanceHeatmap (`src/components/AttendanceHeatmap.jsx`)

**Current state:** The heatmap renders 10 weeks × 7 days = 70 cells of `w-7 h-7` (28 px each). Total width ≈ 10 × (28 + 4) = 320 px. On a 320 px viewport this is exactly full-width with no margin — any padding causes overflow.

**Fix:**
```jsx
// Wrap the entire heatmap content in a scroll container
<div className="overflow-x-auto">
  <div className="min-w-[320px]">
    {/* existing heatmap content */}
  </div>
</div>
```

Cell size stays at `w-7 h-7` (28 px > 20 px minimum). No cell size change needed.

### 7. Modals

**Current state:** `StudentDetailModal` uses `p-4` on the backdrop and `max-w-3xl max-h-[92vh]` on the panel. On a 320 px screen, `p-4` leaves only 288 px for the modal — too narrow for the content.

**`AddStudentModal` and `ImportModal`** in `AdminStudents.jsx` use `max-w-2xl` / `max-w-3xl` with `p-4` backdrop.

**Fix pattern:**
```jsx
// Backdrop: remove padding on mobile, add it back at sm
<div className="fixed inset-0 ... p-0 sm:p-4">

// Panel: full-screen on mobile, constrained at sm+
<div className="... w-full h-full sm:w-auto sm:h-auto sm:max-w-3xl sm:max-h-[92vh] sm:rounded-3xl rounded-none">
```

**Body scroll lock:** Add `useEffect` to modals:
```jsx
useEffect(() => {
  document.body.style.overflow = 'hidden'
  return () => { document.body.style.overflow = '' }
}, [])
```

**Close button tap target:** Change `w-8 h-8` close button to `w-11 h-11` (44 px).

**Form inputs full-width on mobile:** Add `w-full` to all form inputs (already present in most cases via the `.input` class).

### 8. Page Content Grids

**Fix pattern** applied to all `lg:grid-cols-*` grids in page components:

```jsx
// 2-column grids
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">   // already correct in most places

// 5-column grids (StudentDashboard grade trend + schedule)
<div className="grid grid-cols-1 lg:grid-cols-5 gap-4">   // already correct

// 3-column grids (AdminFees summary)
<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">   // fix: add grid-cols-1 base
```

**Main padding:** All layouts already use `p-4 lg:p-6` on `<main>`. No change needed.

**Hero sections (StudentDashboard, LoginPage):** Add responsive text sizing:
```jsx
// StudentDashboard hero name
<h2 className="text-[22px] sm:text-[26px] font-bold ...">

// LoginPage hero heading
<h1 className="text-[36px] lg:text-[46px] font-bold ...">
```

### 9. Login Page

**Current state:** The left hero panel is `hidden lg:flex` — already hidden on mobile. The right form panel is `flex-1` with `p-6 lg:p-12`. The form itself uses `max-w-[400px]` with `w-full`.

**Gaps:**
- Demo account buttons grid is `grid-cols-2` — fine at all sizes.
- No explicit `w-full` on the form container's parent at mobile — the `flex-1` handles this.
- Error message has no overflow protection.

**Fix:**
```jsx
// Error message: add overflow-hidden and break-words
<div className="... overflow-hidden">
  <p className="text-[13px] text-danger font-medium break-words">{error}</p>
</div>
```

### 10. Touch Targets (Global)

**`index.css` changes:**

```css
/* Ensure btn-ghost meets 44px minimum */
.btn-ghost {
  min-height: 44px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Sidebar links: 44px minimum height */
.sidebar-link {
  min-height: 44px;
}

/* Inputs: 16px font to prevent iOS zoom */
.input {
  font-size: 1rem; /* 16px */
}
```

---

## Data Models

This feature involves no data model changes. All changes are presentational (CSS classes, DOM structure wrappers). No new state, no new API calls, no schema changes.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Most acceptance criteria in this feature are CSS/DOM structure checks best verified as example-based tests. However, two criteria express universal properties that hold across all pages and all interactive elements:

### Property 1: No Horizontal Page Overflow

*For any* portal page component rendered at any viewport width ≥ 320 px, the document body's scroll width SHALL equal its client width (i.e., no horizontal overflow is introduced).

**Validates: Requirements 7.5**

### Property 2: Interactive Elements Meet Minimum Tap Target

*For any* interactive element (button, anchor, input, select) rendered within any portal page at a viewport width below 1024 px, the element's rendered height and width SHALL each be at least 44 px.

**Validates: Requirements 8.1**

---

## Error Handling

This feature is purely presentational. There are no new error states to handle. Existing error handling (login errors, data fetch errors) is preserved; the only change is ensuring error message containers use `overflow-hidden` and `break-words` so long error strings do not cause horizontal overflow.

---

## Testing Strategy

### Assessment: PBT Applicability

Property-based testing applies to two universal properties identified above (no horizontal overflow, minimum tap targets). All other acceptance criteria are CSS class/DOM structure checks best handled as example-based unit tests or visual snapshot tests.

### Unit Tests (Example-Based)

For each Layout component (Admin, Student, Parent, Teacher):
- Sidebar is hidden by default (has `-translate-x-full` class, not `translate-x-0`)
- Clicking hamburger button sets `open` to `true`
- Clicking overlay closes sidebar
- Clicking a nav link closes sidebar
- Clicking the X button closes sidebar

For `Topbar`:
- Hamburger button has `lg:hidden` class
- Username/role text has `hidden sm:block` class
- All action buttons have `min-h-[44px]` class or equivalent

For stat-card grids (per portal dashboard):
- Grid container has `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` classes

For data tables (per admin page):
- Table is wrapped in `overflow-x-auto` container
- Table has `min-w-[600px]` or equivalent

For `AttendanceHeatmap`:
- Component is wrapped in `overflow-x-auto` container

For modals (`StudentDetailModal`, `AddStudentModal`, `ImportModal`):
- Panel has `sm:max-w-*` class (constrained at sm+)
- Panel has `rounded-none sm:rounded-3xl` (full-screen on mobile)
- Close button has `min-h-[44px] min-w-[44px]` or `w-11 h-11`
- Body scroll lock is applied on mount and removed on unmount

For `LoginPage`:
- Form container has `w-full max-w-[400px]`
- Error message container has `overflow-hidden`

### Property-Based Tests

**Property Test 1: No Horizontal Page Overflow**
- Library: `@fast-check/jest` (fast-check for JavaScript)
- Generator: arbitrary viewport width in range [320, 1440]
- For each generated width: render the page component in a jsdom environment at that width, assert `document.body.scrollWidth <= document.body.clientWidth`
- Minimum 100 iterations
- Tag: `Feature: responsive-mobile-layout, Property 1: no horizontal page overflow`

**Property Test 2: Interactive Elements Meet Minimum Tap Target**
- Library: `@fast-check/jest`
- Generator: arbitrary portal page component (sampled from the set of all page components)
- For each generated page: render at viewport width 375 px (typical mobile), query all `button, a, input, select` elements, assert each has `offsetHeight >= 44` and `offsetWidth >= 44`
- Minimum 100 iterations
- Tag: `Feature: responsive-mobile-layout, Property 2: interactive elements meet minimum tap target`

### Visual / Manual Tests

- Verify login page hero panel is hidden on mobile and visible on desktop
- Verify chart tooltips do not clip at viewport edges
- Verify `AttendanceHeatmap` scrolls horizontally on 375 px viewport
- Verify modals are full-screen on 375 px and centred with rounded corners on 768 px+
- Verify no text truncation in `StatCard` at 320 px viewport
- Verify iOS Safari does not zoom on input focus (font-size ≥ 16 px)
- Verify keyboard focus is trapped in sidebar drawer when open

### Test Configuration

- Test runner: Vitest (already in project via Vite)
- Component testing: `@testing-library/react` + `jsdom`
- Property-based testing: `fast-check` (`npm install --save-dev fast-check @fast-check/vitest`)
- Each property test: minimum 100 iterations (`numRuns: 100`)
