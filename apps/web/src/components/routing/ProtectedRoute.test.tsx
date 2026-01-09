import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../../test/test-utils'
import { ProtectedRoute } from './ProtectedRoute'

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

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    })

    render(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('redirects to /login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    })

    render(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    expect(mockNavigate).toHaveBeenCalledWith('/login', true)
  })

  it('shows loading spinner when auth state is loading', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    })

    render(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
    // Check for loading spinner
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('does not redirect while loading even if not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    })

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
