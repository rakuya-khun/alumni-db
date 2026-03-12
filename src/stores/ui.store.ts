import { create } from 'zustand'

export type FontSize = 'small' | 'default' | 'large' | 'x-large'
export type Theme = 'light' | 'dark' | 'maroon'

const THEME_CLASSES: Theme[] = ['light', 'dark', 'maroon']

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

interface UIState {
  theme: Theme
  isDarkMode: boolean
  fontSize: FontSize
  sidebarCollapsed: boolean
  toasts: Toast[]
  setTheme: (theme: Theme) => void
  cycleTheme: () => void
  toggleDarkMode: () => void
  setDarkMode: (value: boolean) => void
  setFontSize: (size: FontSize) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (value: boolean) => void
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

function applyThemeClass(theme: Theme) {
  const el = document.documentElement
  el.classList.remove('dark', 'maroon')
  if (theme !== 'light') {
    el.classList.add(theme)
  }
}

let toastCounter = 0

export const useUIStore = create<UIState>((set) => ({
  theme: 'light' as Theme,
  isDarkMode: false,
  fontSize: 'default' as FontSize,
  sidebarCollapsed: false,
  toasts: [],

  setTheme: (theme) => {
    applyThemeClass(theme)
    set({ theme, isDarkMode: theme === 'dark' })
  },

  cycleTheme: () =>
    set((state) => {
      const idx = THEME_CLASSES.indexOf(state.theme)
      const next = THEME_CLASSES[(idx + 1) % THEME_CLASSES.length]
      applyThemeClass(next)
      return { theme: next, isDarkMode: next === 'dark' }
    }),

  toggleDarkMode: () =>
    set((state) => {
      const next = state.isDarkMode ? 'light' : 'dark'
      applyThemeClass(next)
      return { theme: next, isDarkMode: next === 'dark' }
    }),

  setDarkMode: (value) => {
    const theme = value ? 'dark' : 'light'
    applyThemeClass(theme)
    set({ theme, isDarkMode: value })
  },

  setFontSize: (size) => {
    const el = document.documentElement
    el.classList.remove('font-size-small', 'font-size-default', 'font-size-large', 'font-size-x-large')
    el.classList.add(`font-size-${size}`)
    set({ fontSize: size })
  },

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (value) => set({ sidebarCollapsed: value }),

  addToast: (toast) => {
    const id = `toast-${++toastCounter}`
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }))
    const duration = toast.duration ?? 5000
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }))
      }, duration)
    }
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))
