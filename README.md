# 🎓 Campus Pocket

A full-stack responsive school management web app with Student and Parent portals.

## Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Charts**: Recharts
- **State**: React Context + Zustand
- **AI**: Google Gemini API
- **Icons**: Lucide React

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
cd campus-pocket
npm install
```

### 2. Configure environment (optional for demo)
```bash
cp .env.example .env
```
Edit `.env` with your Supabase and Gemini keys. The app works fully with demo data without any keys.

### 3. Run the app
```bash
npm run dev
```
Open http://localhost:5173

---

## 🔐 Demo Credentials

| Role    | Username        | Password    |
|---------|----------------|-------------|
| Student | alex.johnson   | student123  |
| Student | priya.sharma   | student123  |
| Parent  | robert.johnson | parent123   |

Click the demo buttons on the login page to auto-fill.

---

## 🗄️ Supabase Setup (Production)

1. Create a project at https://supabase.com
2. Run `supabase/schema.sql` in the SQL Editor
3. Add your project URL and anon key to `.env`
4. Enable Email auth in Authentication settings

---

## 🤖 Gemini AI Setup

1. Get an API key from https://aistudio.google.com
2. Add `VITE_GEMINI_API_KEY=your_key` to `.env`
3. AI Insights will use live Gemini analysis instead of mock data

---

## 📁 Project Structure

```
src/
├── components/          # Shared UI components
│   ├── AttendanceHeatmap.jsx
│   ├── AttendanceRiskBadge.jsx
│   ├── LoadingSpinner.jsx
│   ├── NotificationPanel.jsx
│   ├── ProtectedRoute.jsx
│   ├── StatCard.jsx
│   └── Topbar.jsx
├── contexts/            # React Context providers
│   ├── AuthContext.jsx
│   ├── NotificationContext.jsx
│   └── ThemeContext.jsx
├── pages/
│   ├── LoginPage.jsx
│   ├── student/         # Student portal pages
│   └── parent/          # Parent portal pages
├── services/
│   ├── supabase.js      # Supabase client
│   ├── gemini.js        # Gemini AI integration
│   └── mockData.js      # Demo seed data
└── App.jsx
```

---

## ✨ Features

### Student Portal
- Dashboard with today's schedule, stats, charts
- Attendance heatmap (10-week calendar view)
- Grades with subject comparison charts
- Weekly timetable
- Exam schedule + results
- Digital ID card
- Helpdesk request form
- AI Insights (Gemini-powered)

### Parent Portal
- Children summary cards with risk alerts
- Add child via username/password verification
- Per-child attendance heatmap
- Grade progress timeline
- Fee management (PAID/PENDING/OVERDUE)
- Timetable view
- Exam schedule + results
- Parent-teacher messaging

### Shared Features
- 🌙 Dark mode (persisted in localStorage)
- 🔔 In-app notifications
- 🔐 Role-based routing (students can't access parent routes)
- 📱 Mobile-first responsive design
- ⚡ Attendance risk alerts (Green/Yellow/Red)
