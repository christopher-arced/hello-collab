import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { useAuth } from './useAuth'
import { API_BASE_URL } from '../lib/api'
import { useAuthStore } from '../stores'

// Mock navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Setup MSW
const server = setupServer()

beforeEach(() => {
  server.listen({ onUnhandledRequest: 'warn' })
  vi.clearAllMocks()
  useAuthStore.getState().reset()
})

afterEach(() => {
  server.resetHandlers()
})

afterEach(() => {
  server.close()
})

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  )
}

describe('useAuth', () => {
  describe('register', () => {
    it('registers a new user successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        avatarUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const mockTokens = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      }

      server.use(
        http.post(`${API_BASE_URL}/api/auth/register`, () => {
          return HttpResponse.json({
            success: true,
            data: { user: mockUser, tokens: mockTokens },
          })
        })
      )

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      result.current.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      })

      await waitFor(() => {
        // Tokens are now set via HTTP-only cookies by backend, not localStorage
        expect(mockNavigate).toHaveBeenCalledWith('/')
      })
    })

    it('handles registration error', async () => {
      server.use(
        http.post(`${API_BASE_URL}/api/auth/register`, () => {
          return HttpResponse.json(
            {
              success: false,
              error: 'Email already registered',
            },
            { status: 409 }
          )
        })
      )

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      result.current.register({
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
      })

      await waitFor(() => {
        expect(result.current.registerError).toBeTruthy()
        expect(result.current.registerError?.message).toBe('Email already registered')
      })
    })
  })

  describe('login', () => {
    it('logs in a user successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        avatarUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const mockTokens = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      }

      server.use(
        http.post(`${API_BASE_URL}/api/auth/login`, () => {
          return HttpResponse.json({
            success: true,
            data: { user: mockUser, tokens: mockTokens },
          })
        })
      )

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      result.current.login({
        email: 'test@example.com',
        password: 'password123',
      })

      await waitFor(() => {
        // Tokens are now set via HTTP-only cookies by backend, not localStorage
        expect(mockNavigate).toHaveBeenCalledWith('/')
      })
    })

    it('handles login error with invalid credentials', async () => {
      server.use(
        http.post(`${API_BASE_URL}/api/auth/login`, () => {
          return HttpResponse.json(
            {
              success: false,
              error: 'Invalid email or password',
            },
            { status: 401 }
          )
        })
      )

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      result.current.login({
        email: 'test@example.com',
        password: 'wrongpassword',
      })

      await waitFor(() => {
        expect(result.current.loginError).toBeTruthy()
        expect(result.current.loginError?.message).toBe('Invalid email or password')
      })
    })
  })

  describe('logout', () => {
    it('calls logout API and redirects to login', async () => {
      server.use(
        http.post(`${API_BASE_URL}/api/auth/logout`, () => {
          return HttpResponse.json({
            success: true,
            message: 'Logged out successfully',
          })
        })
      )

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      result.current.logout()

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login')
      })
    })

    it('redirects to login even if logout API fails', async () => {
      server.use(
        http.post(`${API_BASE_URL}/api/auth/logout`, () => {
          return HttpResponse.json({ success: false, error: 'Server error' }, { status: 500 })
        })
      )

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      result.current.logout()

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login')
      })
    })
  })

  describe('isAuthenticated', () => {
    it('returns false when no user is loaded', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      expect(result.current.isAuthenticated).toBe(false)
    })
  })
})
