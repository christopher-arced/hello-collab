import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
}

interface ThemeActions {
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

type ThemeStore = ThemeState & ThemeActions

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const resolveTheme = (theme: Theme): 'light' | 'dark' => {
  return theme === 'system' ? getSystemTheme() : theme
}

const initialState: ThemeState = {
  theme: 'system',
  resolvedTheme: getSystemTheme(),
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setTheme: (theme) =>
        set({
          theme,
          resolvedTheme: resolveTheme(theme),
        }),

      toggleTheme: () => {
        const current = get().resolvedTheme
        set({
          theme: current === 'dark' ? 'light' : 'dark',
          resolvedTheme: current === 'dark' ? 'light' : 'dark',
        })
      },
    }),
    {
      name: 'hello-theme',
    }
  )
)
