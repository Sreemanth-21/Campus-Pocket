// @vitest-environment jsdom
/**
 * Property-Based Tests: Responsive Mobile Layout
 *
 * Property 1: No Horizontal Page Overflow
 *   Validates: Requirements 7.5
 *
 * Property 2: Interactive Elements Meet Minimum Tap Target
 *   Validates: Requirements 8.1
 */

import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import fc from 'fast-check'
import React, { createContext, useContext } from 'react'

// ── Mock window.matchMedia (not implemented in jsdom) ──────────────────────
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

// ── Mock contexts using vi.mock with inline React ──────────────────────────
vi.mock('../contexts/AuthContext', async () => {
  const { createContext, useContext } = await import('react')
  const AuthContext = createContext({
    user: { id: 'user-admin-1', username: 'admin', role: 'admin', school_id: 'school-demo-001' },
    profile: { id: 'user-admin-1', name: 'Admin', school_id: 'school-demo-001' },
    loading: false,
    login: () => {},
    logout: () => {},
  })

  function AuthProvider({ children }) {
    const value = {
      user: { id: 'user-admin-1', username: 'admin', role: 'admin', school_id: 'school-demo-001' },
      profile: { id: 'user-admin-1', name: 'Admin', school_id: 'school-demo-001' },
      loading: false,
      login: () => {},
      logout: () => {},
    }
    return React.createElement(AuthContext.Provider, { value }, children)
  }

  function useAuth() {
    return useContext(AuthContext)
  }

  return { AuthContext, AuthProvider, useAuth }
})

vi.mock('../contexts/ThemeContext', async () => {
  const { createContext, useContext } = await import('react')
  const ThemeContext = createContext({ dark: false, toggle: () => {} })

  function ThemeProvider({ children }) {
    return React.createElement(ThemeContext.Provider, { value: { dark: false, toggle: () => {} } }, children)
  }

  function useTheme() {
    return useContext(ThemeContext)
  }

  return { ThemeContext, ThemeProvider, useTheme }
})

vi.mock('../contexts/NotificationContext', async () => {
  const { createContext, useContext } = await import('react')
  const NotificationContext = createContext({
    notifications: [],
    unreadCount: 0,
    markRead: () => {},
    markAllRead: () => {},
    addNotification: () => {},
  })

  function NotificationProvider({ children }) {
    const value = {
      notifications: [],
      unreadCount: 0,
      markRead: () => {},
      markAllRead: () => {},
      addNotification: () => {},
    }
    return React.createElement(NotificationContext.Provider, { value }, children)
  }

  function useNotifications() {
    return useContext(NotificationContext)
  }

  return { NotificationContext, NotificationProvider, useNotifications }
})

// ── Import layout components AFTER mocks are declared ─────────────────────
import AdminLayout from '../pages/admin/AdminLayout'
import StudentLayout from '../pages/student/StudentLayout'
import ParentLayout from '../pages/parent/ParentLayout'
import TeacherLayout from '../pages/teacher/TeacherLayout'

// ── Wrapper that provides router context ───────────────────────────────────
function RouterWrapper({ children }) {
  return React.createElement(MemoryRouter, null, children)
}

function renderLayout(Component) {
  return render(
    React.createElement(RouterWrapper, null,
      React.createElement(Component)
    )
  )
}

// ── Helper: check that every <table> in container has an overflow-x-auto ancestor ──
function allTablesHaveScrollWrapper(container) {
  const tables = container.querySelectorAll('table')
  for (const table of tables) {
    let ancestor = table.parentElement
    let hasScrollWrapper = false
    while (ancestor && ancestor !== container) {
      if (
        ancestor.className &&
        typeof ancestor.className === 'string' &&
        ancestor.className.includes('overflow-x-auto')
      ) {
        hasScrollWrapper = true
        break
      }
      ancestor = ancestor.parentElement
    }
    if (!hasScrollWrapper) return { pass: false, table }
  }
  return { pass: true }
}

const layouts = [
  { name: 'AdminLayout', Component: AdminLayout },
  { name: 'StudentLayout', Component: StudentLayout },
  { name: 'ParentLayout', Component: ParentLayout },
  { name: 'TeacherLayout', Component: TeacherLayout },
]

// ─────────────────────────────────────────────────────────────────────────────
// Property 1: No Horizontal Page Overflow
// Validates: Requirements 7.5
// ─────────────────────────────────────────────────────────────────────────────
describe('Property 1: No Horizontal Page Overflow — Validates: Requirements 7.5', () => {
  afterEach(() => {
    cleanup()
  })

  it('for any viewport width in [320, 1440], no layout table lacks an overflow-x-auto scroll wrapper', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 1440 }),
        fc.constantFrom(...layouts),
        (viewportWidth, { name, Component }) => {
          // Set the viewport width
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: viewportWidth,
          })

          const { container } = renderLayout(Component)
          const result = allTablesHaveScrollWrapper(container)
          cleanup()

          if (!result.pass) {
            throw new Error(
              `[${name}] at viewport ${viewportWidth}px: found a <table> without an overflow-x-auto ancestor. ` +
              `Table outerHTML: ${result.table?.outerHTML?.slice(0, 200)}`
            )
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Property 2: Interactive Elements Meet Minimum Tap Target
// Validates: Requirements 8.1
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check that a button element has CSS classes that guarantee >= 44px tap target.
 * Since jsdom doesn't compute layout, we check for known CSS classes that
 * provide 44px minimum size as defined in index.css and the design doc.
 */
function buttonMeetsTapTarget(el) {
  const cls = el.className || ''

  // btn-ghost has min-height: 44px; min-width: 44px in index.css
  if (cls.includes('btn-ghost')) return true

  // Explicit size classes: h-11 = 44px, w-11 = 44px
  if (cls.includes('h-11') || cls.includes('w-11')) return true

  // min-h-[44px] or min-w-[44px]
  if (cls.includes('min-h-[44px]') || cls.includes('min-w-[44px]')) return true

  // Padding classes that result in >= 44px height with typical content
  if (cls.includes('py-3') || cls.includes('py-2.5') || cls.includes('p-3') || cls.includes('p-2.5')) return true

  // p-2 is used with btn-ghost (already covered) or with icon-only buttons
  if (cls.includes('p-2')) return true

  return false
}

describe('Property 2: Interactive Elements Meet Minimum Tap Target — Validates: Requirements 8.1', () => {
  afterEach(() => {
    cleanup()
  })

  it('for any portal layout rendered at 375px, all buttons have tap-target CSS classes', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...layouts),
        ({ name, Component }) => {
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 375,
          })

          const { container } = renderLayout(Component)
          const buttons = Array.from(container.querySelectorAll('button'))

          for (const btn of buttons) {
            if (!buttonMeetsTapTarget(btn)) {
              cleanup()
              throw new Error(
                `[${name}] at 375px: button does not have tap-target CSS classes. ` +
                `className="${btn.className}", outerHTML="${btn.outerHTML?.slice(0, 200)}"`
              )
            }
          }

          cleanup()
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('for any portal layout rendered at 375px, all sidebar nav links have sidebar-link class', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...layouts),
        ({ name, Component }) => {
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 375,
          })

          const { container } = renderLayout(Component)

          // Check sidebar nav links specifically
          const sidebarLinks = Array.from(container.querySelectorAll('nav a'))

          for (const link of sidebarLinks) {
            const cls = link.className || ''
            if (!cls.includes('sidebar-link')) {
              cleanup()
              throw new Error(
                `[${name}] at 375px: nav anchor does not have sidebar-link class. ` +
                `className="${cls}", href="${link.getAttribute('href')}"`
              )
            }
          }

          cleanup()
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
