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

describe('Sidebar responsive behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({ logout: mockLogout })
    mockUseAuthStore.mockReturnValue({ user: mockUser })
    mockUseThemeStore.mockReturnValue({
      resolvedTheme: 'dark',
      toggleTheme: mockToggleTheme,
    })
  })

  describe('when controlled (with onClose)', () => {
    it('applies translate-x-0 class when isOpen is true', () => {
      render(<Sidebar isOpen={true} onClose={vi.fn()} />)

      const aside = document.querySelector('aside')
      expect(aside?.className).toContain('translate-x-0')
      expect(aside?.className).not.toContain('-translate-x-full')
    })

    it('applies -translate-x-full class when isOpen is false', () => {
      render(<Sidebar isOpen={false} onClose={vi.fn()} />)

      const aside = document.querySelector('aside')
      expect(aside?.className).toContain('-translate-x-full')
    })

    it('renders backdrop when open', () => {
      render(<Sidebar isOpen={true} onClose={vi.fn()} />)

      const backdrop = document.querySelector('[aria-hidden="true"]')
      expect(backdrop).toBeInTheDocument()
    })

    it('does not render backdrop when closed', () => {
      render(<Sidebar isOpen={false} onClose={vi.fn()} />)

      const backdrop = document.querySelector('[aria-hidden="true"]')
      expect(backdrop).not.toBeInTheDocument()
    })

    it('calls onClose when backdrop is clicked', () => {
      const onClose = vi.fn()
      render(<Sidebar isOpen={true} onClose={onClose} />)

      const backdrop = document.querySelector('[aria-hidden="true"]')
      fireEvent.click(backdrop!)

      expect(onClose).toHaveBeenCalledOnce()
    })

    it('calls onClose when a nav link is clicked', () => {
      const onClose = vi.fn()
      render(<Sidebar isOpen={true} onClose={onClose} />)

      fireEvent.click(screen.getByRole('link', { name: 'Home' }))

      expect(onClose).toHaveBeenCalledOnce()
    })
  })

  describe('when uncontrolled (no onClose)', () => {
    it('renders sidebar with hidden md:flex classes', () => {
      render(<Sidebar />)

      const aside = document.querySelector('aside')
      expect(aside?.className).toContain('hidden')
      expect(aside?.className).toContain('md:flex')
    })

    it('does not render backdrop', () => {
      render(<Sidebar />)

      const backdrop = document.querySelector('[aria-hidden="true"]')
      expect(backdrop).not.toBeInTheDocument()
    })
  })
})
