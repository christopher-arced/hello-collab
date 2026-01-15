import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '../../test/test-utils'
import Sidebar from './Sidebar'

const mockLogout = vi.fn()
const mockUseAuth = vi.fn()
const mockUseAuthStore = vi.fn()

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

const mockToggleTheme = vi.fn()
const mockUseThemeStore = vi.fn()

vi.mock('../../stores', () => ({
  useAuthStore: () => mockUseAuthStore(),
  useThemeStore: () => mockUseThemeStore(),
}))

const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'John Doe',
  avatarUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({ logout: mockLogout })
    mockUseAuthStore.mockReturnValue({ user: mockUser })
    mockUseThemeStore.mockReturnValue({
      resolvedTheme: 'dark',
      toggleTheme: mockToggleTheme,
    })
  })

  it('renders logo', () => {
    render(<Sidebar />)
    expect(document.querySelector('svg')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Sidebar />)
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
  })

  it('renders action buttons', () => {
    render(<Sidebar />)
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Toggle theme' })).toBeInTheDocument()
  })

  it('displays user initials from name', () => {
    render(<Sidebar />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('displays ?? when user has no name', () => {
    mockUseAuthStore.mockReturnValue({ user: { ...mockUser, name: null } })
    render(<Sidebar />)
    expect(screen.getByText('??')).toBeInTheDocument()
  })

  it('displays ?? when user is null', () => {
    mockUseAuthStore.mockReturnValue({ user: null })
    render(<Sidebar />)
    expect(screen.getByText('??')).toBeInTheDocument()
  })

  it('calls logout when logout button is clicked', () => {
    render(<Sidebar />)
    const logoutButton = screen.getByRole('button', { name: 'Logout' })
    fireEvent.click(logoutButton)
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })

  it('calls toggleTheme when theme toggle button is clicked', () => {
    render(<Sidebar />)
    const themeToggle = screen.getByRole('button', { name: 'Toggle theme' })
    fireEvent.click(themeToggle)
    expect(mockToggleTheme).toHaveBeenCalledTimes(1)
  })

  it('shows notification badge', () => {
    render(<Sidebar />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('has correct link paths', () => {
    render(<Sidebar />)
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
  })
})
