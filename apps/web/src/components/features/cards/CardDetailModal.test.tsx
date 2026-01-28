import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../../../test/test-utils'
import userEvent from '@testing-library/user-event'
import CardDetailModal from './CardDetailModal'
import type { Card } from '@hello/types'

const mockCard: Card = {
  id: 'card-123',
  title: 'Test Card',
  description: 'Test description',
  listId: 'list-123',
  position: 0,
  dueDate: null,
  coverUrl: null,
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-02T10:00:00Z'),
}

describe('CardDetailModal', () => {
  const mockOnClose = vi.fn()
  const mockOnUpdate = vi.fn()
  const mockOnDelete = vi.fn()
  const mockResetUpdateError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockOnUpdate.mockResolvedValue(undefined)
    mockOnDelete.mockResolvedValue(undefined)
  })

  it('renders nothing when closed', () => {
    render(
      <CardDetailModal
        card={mockCard}
        isOpen={false}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.queryByText('Card details')).not.toBeInTheDocument()
  })

  it('renders modal with card data when open', () => {
    render(
      <CardDetailModal
        card={mockCard}
        isOpen={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('Card details')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Card')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument()
  })

  it('shows optional labels for non-required fields', () => {
    render(
      <CardDetailModal
        card={mockCard}
        isOpen={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    const optionalLabels = screen.getAllByText('(optional)')
    expect(optionalLabels.length).toBe(3) // Description, Due date, Cover image URL
  })

  it('shows card metadata (created and updated dates)', () => {
    render(
      <CardDetailModal
        card={mockCard}
        isOpen={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText(/Created:/)).toBeInTheDocument()
    expect(screen.getByText(/Updated:/)).toBeInTheDocument()
  })

  describe('form submission', () => {
    it('calls onUpdate with changed title', async () => {
      const user = userEvent.setup()
      render(
        <CardDetailModal
          card={mockCard}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      )

      const titleInput = screen.getByDisplayValue('Test Card')
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Title')
      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith({ title: 'Updated Title' })
      })
    })

    it('calls onUpdate with changed description', async () => {
      const user = userEvent.setup()
      render(
        <CardDetailModal
          card={mockCard}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      )

      const descInput = screen.getByDisplayValue('Test description')
      await user.clear(descInput)
      await user.type(descInput, 'New description')
      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith({ description: 'New description' })
      })
    })

    it('sends null for cleared description', async () => {
      const user = userEvent.setup()
      render(
        <CardDetailModal
          card={mockCard}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      )

      const descInput = screen.getByDisplayValue('Test description')
      await user.clear(descInput)
      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith({ description: null })
      })
    })

    it('does not call onUpdate when no changes made', () => {
      render(
        <CardDetailModal
          card={mockCard}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      )

      // Save button should be disabled when no changes
      const saveButton = screen.getByRole('button', { name: /save/i })
      expect(saveButton).toBeDisabled()
    })

    it('closes modal after successful update', async () => {
      const user = userEvent.setup()
      render(
        <CardDetailModal
          card={mockCard}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      )

      const titleInput = screen.getByDisplayValue('Test Card')
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Title')
      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })
    })
  })

  describe('due date', () => {
    it('renders due date input', () => {
      const { container } = render(
        <CardDetailModal
          card={mockCard}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      )

      const dueDateInput = container.querySelector('input[type="datetime-local"]')
      expect(dueDateInput).toBeInTheDocument()
    })

    it('shows clear button when due date is set', async () => {
      const cardWithDueDate = { ...mockCard, dueDate: new Date('2024-12-25T10:00:00Z') }
      render(
        <CardDetailModal
          card={cardWithDueDate}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      )

      // Should have a Clear button for due date
      const clearButtons = screen.getAllByRole('button', { name: /clear/i })
      expect(clearButtons.length).toBeGreaterThan(0)
    })
  })

  describe('cover image', () => {
    it('shows cover image preview when URL is set', () => {
      const cardWithCover = { ...mockCard, coverUrl: 'https://example.com/image.jpg' }
      const { container } = render(
        <CardDetailModal
          card={cardWithCover}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      )

      const img = container.querySelector('img[alt="Cover preview"]')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', 'https://example.com/image.jpg')
    })

    it('allows empty cover URL (optional field)', async () => {
      const user = userEvent.setup()
      const cardWithCover = { ...mockCard, coverUrl: 'https://example.com/image.jpg' }
      render(
        <CardDetailModal
          card={cardWithCover}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      )

      // Find and click the Clear button for cover URL
      const clearButtons = screen.getAllByRole('button', { name: /clear/i })
      // The second Clear button should be for cover image
      await user.click(clearButtons[clearButtons.length - 1])
      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith({ coverUrl: null })
      })
    })
  })

  describe('delete functionality', () => {
    it('renders delete button', () => {
      render(
        <CardDetailModal
          card={mockCard}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      )

      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
    })

    it('calls onDelete when delete button clicked', async () => {
      const user = userEvent.setup()
      render(
        <CardDetailModal
          card={mockCard}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      )

      await user.click(screen.getByRole('button', { name: /delete/i }))

      expect(mockOnDelete).toHaveBeenCalled()
    })

    it('shows deleting state', () => {
      render(
        <CardDetailModal
          card={mockCard}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          isDeleting={true}
        />
      )

      expect(screen.getByText(/deleting/i)).toBeInTheDocument()
    })
  })

  describe('cancel and close', () => {
    it('calls onClose when cancel button clicked', async () => {
      const user = userEvent.setup()
      render(
        <CardDetailModal
          card={mockCard}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      )

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('calls onClose when close button (X) clicked', async () => {
      const user = userEvent.setup()
      render(
        <CardDetailModal
          card={mockCard}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      )

      await user.click(screen.getByRole('button', { name: /close modal/i }))

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('resets update error on close', async () => {
      const user = userEvent.setup()
      render(
        <CardDetailModal
          card={mockCard}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          resetUpdateError={mockResetUpdateError}
        />
      )

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(mockResetUpdateError).toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('displays update error message', () => {
      render(
        <CardDetailModal
          card={mockCard}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          updateError={{ message: 'Failed to update card' }}
        />
      )

      expect(screen.getByText('Failed to update card')).toBeInTheDocument()
    })
  })

  describe('loading states', () => {
    it('shows updating state on save button', () => {
      render(
        <CardDetailModal
          card={mockCard}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          isUpdating={true}
        />
      )

      expect(screen.getByText(/saving/i)).toBeInTheDocument()
    })
  })

  describe('validation', () => {
    it('shows error for empty title', async () => {
      const user = userEvent.setup()
      render(
        <CardDetailModal
          card={mockCard}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      )

      const titleInput = screen.getByDisplayValue('Test Card')
      await user.clear(titleInput)

      // Try to submit - find a way to trigger validation
      // The button should still be enabled since title was changed
      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)

      // Should show validation error and not call onUpdate
      await waitFor(() => {
        expect(mockOnUpdate).not.toHaveBeenCalled()
      })
    })
  })
})
