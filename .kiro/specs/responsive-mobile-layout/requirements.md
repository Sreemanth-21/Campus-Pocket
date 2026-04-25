# Requirements Document

## Introduction

Campus Pocket is a school management web application built with React 18, Vite, and Tailwind CSS. It serves four user portals — Admin, Student, Parent, and Teacher — each with its own layout, sidebar navigation, dashboards, data tables, charts, and modals.

Currently the application is designed primarily for desktop viewports. This feature makes every portal and shared component fully responsive and mobile-friendly, so the app works correctly and comfortably on any screen size — from a 320 px mobile phone to a 4K desktop monitor — without requiring a separate mobile build.

## Glossary

- **App**: The Campus Pocket web application.
- **Portal**: One of the four role-specific sections: Admin Portal, Student Portal, Parent Portal, Teacher Portal.
- **Layout**: The root shell component for a portal (`AdminLayout`, `StudentLayout`, `ParentLayout`, `TeacherLayout`), which contains the Sidebar and Topbar.
- **Sidebar**: The vertical navigation panel rendered inside a Layout component.
- **Topbar**: The shared `Topbar` component rendered at the top of every portal page.
- **Hamburger Button**: A button in the Topbar that, when tapped on mobile, opens the Sidebar drawer.
- **Drawer**: The Sidebar when it slides in as an overlay on small screens.
- **Overlay**: A semi-transparent backdrop rendered behind the open Drawer to allow dismissal by tapping outside.
- **Breakpoint**: A Tailwind CSS responsive breakpoint. `sm` = 640 px, `md` = 768 px, `lg` = 1024 px.
- **StatCard**: The shared `StatCard` component used to display a single metric (value, label, icon).
- **Heatmap**: The `AttendanceHeatmap` component that renders a grid of day cells.
- **Modal**: Any full-screen overlay dialog, including `StudentDetailModal` and the Add/Import modals in `AdminStudents`.
- **Data Table**: Any `<table>` element used to display rows of records.
- **Chart**: Any Recharts component (`BarChart`, `AreaChart`, `PieChart`, `LineChart`).
- **Fluid Grid**: A CSS grid whose column count changes at defined breakpoints.

---

## Requirements

### Requirement 1: Responsive Sidebar Navigation

**User Story:** As a user on a mobile device, I want the sidebar to be hidden by default and openable via a hamburger button, so that the main content area uses the full screen width.

#### Acceptance Criteria

1. WHEN the viewport width is below the `lg` breakpoint (1024 px), THE Sidebar SHALL be hidden off-screen to the left by default.
2. WHEN the viewport width is at or above the `lg` breakpoint, THE Sidebar SHALL be permanently visible and shall not require a hamburger button to open.
3. WHEN the user taps the Hamburger Button in the Topbar on a viewport below `lg`, THE Sidebar SHALL slide into view as a Drawer over the page content.
4. WHEN the Drawer is open and the user taps the Overlay, THE Sidebar SHALL close and return to its off-screen position.
5. WHEN the Drawer is open and the user taps a navigation link, THE Sidebar SHALL close automatically.
6. WHEN the Drawer is open and the user taps the close (X) button inside the Sidebar, THE Sidebar SHALL close.
7. THE Sidebar SHALL display the Overlay behind it when open on mobile, preventing interaction with the page content beneath.
8. WHILE the Drawer is open, THE App SHALL trap focus within the Drawer for keyboard accessibility.
9. THE Sidebar SHALL apply the same slide-in/slide-out behavior consistently across all four Layouts (Admin, Student, Parent, Teacher).

---

### Requirement 2: Responsive Topbar

**User Story:** As a user on any device, I want the Topbar to adapt its layout so that all controls remain accessible without overflow or clipping.

#### Acceptance Criteria

1. THE Topbar SHALL display the Hamburger Button only when the viewport width is below the `lg` breakpoint.
2. WHEN the viewport width is at or above the `lg` breakpoint, THE Topbar SHALL hide the Hamburger Button.
3. THE Topbar SHALL display the current page title at all viewport widths.
4. WHEN the viewport width is below the `sm` breakpoint (640 px), THE Topbar SHALL hide the username and role text next to the avatar, showing only the avatar icon.
5. THE Topbar SHALL keep all action buttons (theme toggle, notifications, logout) visible and tappable at all viewport widths, with a minimum tap target size of 44 × 44 px.
6. IF the notification panel is open and the user taps outside it, THEN THE Topbar SHALL close the notification panel.

---

### Requirement 3: Responsive Dashboard Stat Cards

**User Story:** As a user on a mobile device, I want stat card grids to stack into fewer columns so that each card is readable without horizontal scrolling.

#### Acceptance Criteria

1. WHEN the viewport width is below the `sm` breakpoint, THE StatCard grid SHALL render in a single column (1 card per row).
2. WHEN the viewport width is at or above the `sm` breakpoint and below the `lg` breakpoint, THE StatCard grid SHALL render in two columns (2 cards per row).
3. WHEN the viewport width is at or above the `lg` breakpoint, THE StatCard grid SHALL render in four columns (4 cards per row) where four cards exist, or in the column count appropriate to the number of cards.
4. THE StatCard component SHALL fill the full width of its grid cell at every breakpoint.
5. THE StatCard SHALL display the icon, value, title, and subtitle without text truncation at any viewport width above 320 px.

---

### Requirement 4: Responsive Data Tables

**User Story:** As a user on a mobile device, I want data tables to be horizontally scrollable so that all columns remain accessible without breaking the page layout.

#### Acceptance Criteria

1. THE App SHALL wrap every Data Table in a horizontally scrollable container so that the table does not overflow the viewport.
2. WHEN the viewport width is below the `md` breakpoint (768 px), THE Data Table container SHALL display a horizontal scrollbar when the table content is wider than the viewport.
3. THE Data Table SHALL preserve all columns and data at every viewport width; no column SHALL be hidden or removed to achieve responsiveness.
4. THE Data Table rows SHALL maintain a minimum row height of 44 px to ensure touch targets are usable on mobile.
5. WHEN the viewport width is below the `sm` breakpoint, THE Data Table SHALL reduce cell padding to a minimum of 8 px horizontally to maximise visible content.

---

### Requirement 5: Responsive Charts and Heatmap

**User Story:** As a user on any device, I want charts and the attendance heatmap to resize fluidly so that data is always visible and readable.

#### Acceptance Criteria

1. THE Chart SHALL use `ResponsiveContainer` with `width="100%"` so that it fills its parent container at every viewport width.
2. WHEN the viewport width is below the `sm` breakpoint, THE Chart height SHALL be reduced to a minimum of 160 px to preserve readability on small screens.
3. THE AttendanceHeatmap SHALL be wrapped in a horizontally scrollable container so that all 10 weeks of cells remain accessible on narrow viewports.
4. WHEN the viewport width is below the `md` breakpoint, THE AttendanceHeatmap cell size SHALL remain at least 20 × 20 px so that individual day cells are distinguishable.
5. THE Chart tooltip SHALL remain fully visible within the viewport and SHALL NOT be clipped by the screen edge at any viewport width.

---

### Requirement 6: Responsive Modals

**User Story:** As a user on a mobile device, I want modals to occupy the full screen so that content is readable and forms are usable without zooming.

#### Acceptance Criteria

1. WHEN the viewport width is below the `sm` breakpoint, THE Modal SHALL expand to fill the full viewport width and height (full-screen modal).
2. WHEN the viewport width is at or above the `sm` breakpoint, THE Modal SHALL be centred with a maximum width and rounded corners as currently designed.
3. THE Modal SHALL be scrollable internally when its content exceeds the viewport height, at all viewport widths.
4. THE Modal close button SHALL remain visible and tappable at all viewport widths, with a minimum tap target size of 44 × 44 px.
5. WHEN a Modal is open, THE App SHALL prevent the background page from scrolling.
6. THE Modal form inputs and action buttons SHALL be full-width on viewports below the `sm` breakpoint to maximise usability.

---

### Requirement 7: Responsive Page Layouts and Content Grids

**User Story:** As a user on any device, I want all page content grids to reflow into appropriate column counts so that content is never clipped or requires horizontal scrolling.

#### Acceptance Criteria

1. THE App SHALL use Fluid Grids for all multi-column content sections, with column counts that decrease as viewport width decreases.
2. WHEN the viewport width is below the `md` breakpoint, multi-column content grids that use `lg:grid-cols-2` or higher SHALL collapse to a single column.
3. WHEN the viewport width is at or above the `md` breakpoint and below the `lg` breakpoint, two-column grids SHALL remain at two columns where content permits.
4. THE main content area (`<main>`) SHALL use `p-4` padding on viewports below `lg` and `p-6` padding on viewports at or above `lg`.
5. THE App SHALL NOT produce horizontal page overflow (scrollbar on `<body>`) at any viewport width from 320 px upward.
6. WHEN the viewport width is below the `sm` breakpoint, hero or banner sections SHALL reduce font sizes and padding so that all text remains within the viewport without wrapping to an unreadable size.

---

### Requirement 8: Touch and Interaction Usability

**User Story:** As a user on a touch device, I want all interactive elements to have adequate tap target sizes so that I can use the app without accidentally tapping the wrong control.

#### Acceptance Criteria

1. THE App SHALL ensure all interactive elements (buttons, links, inputs, selects) have a minimum tap target size of 44 × 44 px on viewports below the `lg` breakpoint.
2. THE Sidebar navigation links SHALL have a minimum height of 44 px on mobile viewports.
3. THE App SHALL NOT rely on hover-only interactions to reveal critical functionality on touch devices.
4. WHEN a form input receives focus on a mobile device, THE App SHALL NOT cause the page to zoom in (achieved by ensuring input font size is at least 16 px or `font-size: 1rem`).
5. THE App SHALL support standard touch gestures (tap, scroll) for all navigation and content interaction; no custom swipe gesture is required.

---

### Requirement 9: Login Page Responsiveness

**User Story:** As a user on a mobile device, I want the login page to be fully usable so that I can sign in without horizontal scrolling or layout issues.

#### Acceptance Criteria

1. THE Login Page SHALL display its form centred and within the viewport at all widths from 320 px upward.
2. THE Login Page form fields and submit button SHALL be full-width on viewports below the `sm` breakpoint.
3. IF the login form is submitted with invalid credentials, THEN THE Login Page SHALL display the error message within the viewport without overflow.
4. THE Login Page SHALL maintain its branding and visual design at all viewport widths.
