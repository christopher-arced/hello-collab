import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useThemeStore } from './themeStore'

// Mock matchMedia
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

describe('themeStore', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear()
    // Reset store state
    useThemeStore.setState({
      theme: 'system',
      resolvedTheme: 'dark',
    })
    // Default to dark system preference
    mockMatchMedia(true)
  })

  describe('initial state', () => {
    it('has system as default theme', () => {
      const state = useThemeStore.getState()
      expect(state.theme).toBe('system')
    })
  })

  describe('setTheme', () => {
    it('sets theme to light', () => {
      useThemeStore.getState().setTheme('light')

      const state = useThemeStore.getState()
      expect(state.theme).toBe('light')
      expect(state.resolvedTheme).toBe('light')
    })

    it('sets theme to dark', () => {
      useThemeStore.getState().setTheme('dark')

      const state = useThemeStore.getState()
      expect(state.theme).toBe('dark')
      expect(state.resolvedTheme).toBe('dark')
    })

    it('sets theme to system and resolves based on system preference', () => {
      mockMatchMedia(false) // System prefers light
      useThemeStore.getState().setTheme('system')

      const state = useThemeStore.getState()
      expect(state.theme).toBe('system')
      expect(state.resolvedTheme).toBe('light')
    })

    it('resolves to dark when system prefers dark', () => {
      mockMatchMedia(true) // System prefers dark
      useThemeStore.getState().setTheme('system')

      const state = useThemeStore.getState()
      expect(state.theme).toBe('system')
      expect(state.resolvedTheme).toBe('dark')
    })
  })

  describe('toggleTheme', () => {
    it('toggles from dark to light', () => {
      useThemeStore.setState({ theme: 'dark', resolvedTheme: 'dark' })
      useThemeStore.getState().toggleTheme()

      const state = useThemeStore.getState()
      expect(state.theme).toBe('light')
      expect(state.resolvedTheme).toBe('light')
    })

    it('toggles from light to dark', () => {
      useThemeStore.setState({ theme: 'light', resolvedTheme: 'light' })
      useThemeStore.getState().toggleTheme()

      const state = useThemeStore.getState()
      expect(state.theme).toBe('dark')
      expect(state.resolvedTheme).toBe('dark')
    })

    it('toggles from system (resolved dark) to light', () => {
      useThemeStore.setState({ theme: 'system', resolvedTheme: 'dark' })
      useThemeStore.getState().toggleTheme()

      const state = useThemeStore.getState()
      expect(state.theme).toBe('light')
      expect(state.resolvedTheme).toBe('light')
    })

    it('toggles from system (resolved light) to dark', () => {
      useThemeStore.setState({ theme: 'system', resolvedTheme: 'light' })
      useThemeStore.getState().toggleTheme()

      const state = useThemeStore.getState()
      expect(state.theme).toBe('dark')
      expect(state.resolvedTheme).toBe('dark')
    })
  })
})
