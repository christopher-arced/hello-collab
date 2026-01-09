import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../../../test/test-utils'
import userEvent from '@testing-library/user-event'
import RegisterForm from './RegisterForm'

// Mock useAuth hook
const mockRegister = vi.fn()
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    register: mockRegister,
    registerAsync: vi.fn(),
    isRegistering: false,
    registerError: null,
  }),
}))

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all form fields', () => {
    render(<RegisterForm />)

    expect(screen.getByText('Create your account')).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/work email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByText(/terms of service/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields on blur', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/work email/i)

    await user.click(nameInput)
    await user.tab()

    await user.click(emailInput)
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument()
    })
  })

  it('shows email validation error for invalid email', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    const emailInput = screen.getByLabelText(/work email/i)
    await user.type(emailInput, 'invalid-email')
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
    })
  })

  it('shows password validation error for short password', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    const passwordInput = screen.getByLabelText(/^password$/i)
    await user.type(passwordInput, 'short')
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    })
  })

  it('shows password mismatch error', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmInput = screen.getByLabelText(/confirm password/i)

    await user.type(passwordInput, 'password123')
    await user.type(confirmInput, 'different123')
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
  })

  it('shows password strength indicator', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    const passwordInput = screen.getByLabelText(/^password$/i)

    // Weak password
    await user.type(passwordInput, '12345')
    await waitFor(() => {
      expect(screen.getByText('Weak')).toBeInTheDocument()
    })

    // Clear and type fair password
    await user.clear(passwordInput)
    await user.type(passwordInput, '12345678')
    await waitFor(() => {
      expect(screen.getByText('Fair')).toBeInTheDocument()
    })

    // Clear and type strong password
    await user.clear(passwordInput)
    await user.type(passwordInput, 'Password123')
    await waitFor(() => {
      expect(screen.getByText('Strong')).toBeInTheDocument()
    })
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    const passwordInput = screen.getByLabelText(/^password$/i)
    const toggleButton = screen.getAllByRole('button').find((btn) => btn.textContent === '👁️')

    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(toggleButton!)
    expect(passwordInput).toHaveAttribute('type', 'text')

    await user.click(toggleButton!)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('disables submit button when terms not agreed', () => {
    render(<RegisterForm />)

    const submitButton = screen.getByRole('button', { name: /create account/i })
    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when terms are agreed', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    const checkbox = screen.getByText(/i agree to the/i).parentElement?.querySelector('div')
    await user.click(checkbox!)

    const submitButton = screen.getByRole('button', { name: /create account/i })
    expect(submitButton).not.toBeDisabled()
  })

  it('calls register on valid form submission', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    // Fill form
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/work email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'Password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123')

    // Agree to terms
    const checkbox = screen.getByText(/i agree to the/i).parentElement?.querySelector('div')
    await user.click(checkbox!)

    // Submit
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
      })
    })
  })

  it('does not submit when terms not agreed', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    // Fill form but don't agree to terms
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/work email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'Password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123')

    // Button should be disabled
    const submitButton = screen.getByRole('button', { name: /create account/i })
    expect(submitButton).toBeDisabled()

    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('shows checkmark when passwords match', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    await user.type(screen.getByLabelText(/^password$/i), 'Password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123')

    await waitFor(() => {
      expect(screen.getByText('✓')).toBeInTheDocument()
    })
  })
})
