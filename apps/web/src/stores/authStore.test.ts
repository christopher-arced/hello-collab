import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'

const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  avatarUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.getState().reset()
  })

  describe('initial state', () => {
    it('has correct initial values', () => {
      const state = useAuthStore.getState()

      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(true)
    })
  })

  describe('setUser', () => {
    it('sets user and updates isAuthenticated to true', () => {
      useAuthStore.getState().setUser(mockUser)

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.isAuthenticated).toBe(true)
    })

    it('clears user and sets isAuthenticated to false when null', () => {
      useAuthStore.getState().setUser(mockUser)
      useAuthStore.getState().setUser(null)

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })

    it('does not modify isLoading state', () => {
      useAuthStore.getState().setLoading(false)
      useAuthStore.getState().setUser(mockUser)

      expect(useAuthStore.getState().isLoading).toBe(false)

      useAuthStore.getState().setLoading(true)
      useAuthStore.getState().setUser(null)

      expect(useAuthStore.getState().isLoading).toBe(true)
    })
  })

  describe('setLoading', () => {
    it('updates loading state', () => {
      useAuthStore.getState().setLoading(false)
      expect(useAuthStore.getState().isLoading).toBe(false)

      useAuthStore.getState().setLoading(true)
      expect(useAuthStore.getState().isLoading).toBe(true)
    })
  })

  describe('reset', () => {
    it('resets store to initial state', () => {
      useAuthStore.getState().setUser(mockUser)
      useAuthStore.getState().reset()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(true)
    })
  })
})
