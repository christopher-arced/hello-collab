import { useEffect } from 'react'
import { useThemeStore } from '../../stores'

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme, resolvedTheme, setTheme } = useThemeStore()

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolvedTheme)
  }, [resolvedTheme])

  useEffect(() => {
    if (theme !== 'system') return
    if (!window.matchMedia) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      setTheme('system')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, setTheme])

  return <>{children}</>
}
