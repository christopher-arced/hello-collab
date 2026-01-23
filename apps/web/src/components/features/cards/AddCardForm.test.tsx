import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../../test/test-utils'
import userEvent from '@testing-library/user-event'
import AddCardForm from './AddCardForm'

describe('AddCardForm', () => {
  const mockOnAdd = vi.fn()
  const mockOnOpenChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockOnAdd.mockResolvedValue(undefined)
  })

  it('renders textarea and buttons', () => {
    render(<AddCardForm onAdd={mockOnAdd} />)

    expect(screen.getByPlaceholderText('Enter a title for this card...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add card' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  describe('form submission', () => {
    it('calls onAdd with trimmed title on submit', async () => {
      const user = userEvent.setup()
      render(<AddCardForm onAdd={mockOnAdd} />)

      const textarea = screen.getByPlaceholderText('Enter a title for this card...')
      await user.type(textarea, '  New Card Title  ')

      // Use mouseDown to prevent blur
      const submitButton = screen.getByRole('button', { name: 'Add card' })
      fireEvent.mouseDown(submitButton)
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockOnAdd).toHaveBeenCalledWith('New Card Title')
      })
    })

    it('calls onAdd when pressing Enter', async () => {
      const user = userEvent.setup()
      render(<AddCardForm onAdd={mockOnAdd} />)

      const textarea = screen.getByPlaceholderText('Enter a title for this card...')
      await user.type(textarea, 'Card Title{Enter}')

      await waitFor(() => {
        expect(mockOnAdd).toHaveBeenCalledWith('Card Title')
      })
    })

    it('does not call onAdd for empty title', async () => {
      const user = userEvent.setup()
      render(<AddCardForm onAdd={mockOnAdd} />)

      const textarea = screen.getByPlaceholderText('Enter a title for this card...')
      await user.type(textarea, '   {Enter}')

      expect(mockOnAdd).not.toHaveBeenCalled()
    })

    it('clears input and reopens after successful submission', async () => {
      const user = userEvent.setup()
      render(<AddCardForm onAdd={mockOnAdd} onOpenChange={mockOnOpenChange} />)

      const textarea = screen.getByPlaceholderText('Enter a title for this card...')
      await user.type(textarea, 'New Card{Enter}')

      await waitFor(() => {
        expect(mockOnAdd).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenLastCalledWith(true)
      })
    })
  })

  describe('keyboard interactions', () => {
    it('allows multiline with Shift+Enter', async () => {
      const user = userEvent.setup()
      render(<AddCardForm onAdd={mockOnAdd} />)

      const textarea = screen.getByPlaceholderText('Enter a title for this card...')
      await user.type(textarea, 'Line 1{Shift>}{Enter}{/Shift}Line 2')

      expect(mockOnAdd).not.toHaveBeenCalled()
      expect(textarea).toHaveValue('Line 1\nLine 2')
    })

    it('closes form and clears input on Escape', async () => {
      const user = userEvent.setup()
      render(<AddCardForm onAdd={mockOnAdd} onOpenChange={mockOnOpenChange} />)

      const textarea = screen.getByPlaceholderText('Enter a title for this card...')
      await user.type(textarea, 'Some text{Escape}')

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('cancel button', () => {
    it('closes form and clears input when cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<AddCardForm onAdd={mockOnAdd} onOpenChange={mockOnOpenChange} />)

      const textarea = screen.getByPlaceholderText('Enter a title for this card...')
      await user.type(textarea, 'Some text')

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      fireEvent.mouseDown(cancelButton)
      await user.click(cancelButton)

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('blur behavior', () => {
    it('closes form on blur', async () => {
      render(<AddCardForm onAdd={mockOnAdd} onOpenChange={mockOnOpenChange} />)

      const textarea = screen.getByPlaceholderText('Enter a title for this card...')
      fireEvent.blur(textarea)

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('controlled mode', () => {
    it('respects controlled isOpen prop', async () => {
      render(<AddCardForm onAdd={mockOnAdd} isOpen={true} onOpenChange={mockOnOpenChange} />)

      const textarea = screen.getByPlaceholderText('Enter a title for this card...')

      // Should focus when isOpen is true
      await waitFor(() => {
        expect(document.activeElement).toBe(textarea)
      })
    })
  })

  describe('input constraints', () => {
    it('has maxLength of 512', () => {
      render(<AddCardForm onAdd={mockOnAdd} />)

      const textarea = screen.getByPlaceholderText('Enter a title for this card...')
      expect(textarea).toHaveAttribute('maxLength', '512')
    })
  })
})
