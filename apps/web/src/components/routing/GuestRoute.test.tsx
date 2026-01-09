import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../../test/test-utils'
import { GuestRoute } from './GuestRoute'

// Track navigation
const mockNavigate = vi.fn()

// Mock react-router-dom Navigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Navigate: ({ to, replace }: { to: string; replace?: boolean }) => {
      mockNavigate(to, replace)
      return null
    },
  }
})

// Create a mock for useAuth that we can control
const mockUseAuth = vi.fn()
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

describe('GuestRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children when user is not authenticated (guest)', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    })

    render(
      <GuestRoute>
        <div data-testid="guest-content">Login Form</div>
      </GuestRoute>
    )

    expect(screen.getByTestId('guest-content')).toBeInTheDocument()
    expect(screen.getByText('Login Form')).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('redirects to / when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    })

    render(
      <GuestRoute>
        <div data-testid="guest-content">Login Form</div>
      </GuestRoute>
    )

    expect(screen.queryByTestId('guest-content')).not.toBeInTheDocument()
    expect(mockNavigate).toHaveBeenCalledWith('/', true)
  })

  it('shows loading spinner when auth state is loading', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    })

    render(
      <GuestRoute>
        <div data-testid="guest-content">Login Form</div>
      </GuestRoute>
    )

    expect(screen.queryByTestId('guest-content')).not.toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
    // Check for loading spinner
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('does not redirect while loading even if authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: true,
    })

    render(
      <GuestRoute>
        <div>Login Form</div>
      </GuestRoute>
    )

    // Should show loading, not redirect
    expect(mockNavigate).not.toHaveBeenCalled()
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })
})
