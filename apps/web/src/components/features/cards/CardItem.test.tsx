import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../../test/test-utils'
import userEvent from '@testing-library/user-event'
import CardItem from './CardItem'
import type { Card } from '@hello/types'

const mockCard: Card = {
  id: 'card-123',
  title: 'Test Card',
  description: null,
  listId: 'list-123',
  position: 0,
  dueDate: null,
  coverUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('CardItem', () => {
  const mockOnUpdateTitle = vi.fn()
  const mockOnDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders card title', () => {
    render(<CardItem card={mockCard} onUpdateTitle={mockOnUpdateTitle} onDelete={mockOnDelete} />)

    expect(screen.getByText('Test Card')).toBeInTheDocument()
  })

  it('renders cover image when coverUrl is provided', () => {
    const cardWithCover = { ...mockCard, coverUrl: 'https://example.com/image.jpg' }
    const { container } = render(
      <CardItem card={cardWithCover} onUpdateTitle={mockOnUpdateTitle} onDelete={mockOnDelete} />
    )

    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg')
  })

  it('does not render cover image when coverUrl is null', () => {
    const { container } = render(
      <CardItem card={mockCard} onUpdateTitle={mockOnUpdateTitle} onDelete={mockOnDelete} />
    )

    expect(container.querySelector('img')).not.toBeInTheDocument()
  })

  it('renders description when provided', () => {
    const cardWithDescription = { ...mockCard, description: 'Test description' }
    render(
      <CardItem
        card={cardWithDescription}
        onUpdateTitle={mockOnUpdateTitle}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  describe('due date formatting', () => {
    it('shows "Overdue" for past dates', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const cardWithDueDate = { ...mockCard, dueDate: yesterday }
      render(
        <CardItem
          card={cardWithDueDate}
          onUpdateTitle={mockOnUpdateTitle}
          onDelete={mockOnDelete}
        />
      )

      expect(screen.getByText('Overdue')).toBeInTheDocument()
    })

    it('shows "Today" for today', () => {
      // Use current time - the function uses Math.ceil so we need diff to be 0
      // which happens when dueDate is at or slightly before now
      const today = new Date()
      const cardWithDueDate = { ...mockCard, dueDate: today }
      render(
        <CardItem
          card={cardWithDueDate}
          onUpdateTitle={mockOnUpdateTitle}
          onDelete={mockOnDelete}
        />
      )

      expect(screen.getByText('Today')).toBeInTheDocument()
    })

    it('shows "Tomorrow" for tomorrow', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const cardWithDueDate = { ...mockCard, dueDate: tomorrow }
      render(
        <CardItem
          card={cardWithDueDate}
          onUpdateTitle={mockOnUpdateTitle}
          onDelete={mockOnDelete}
        />
      )

      expect(screen.getByText('Tomorrow')).toBeInTheDocument()
    })

    it('shows formatted date for future dates', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 10)
      const cardWithDueDate = { ...mockCard, dueDate: futureDate }
      render(
        <CardItem
          card={cardWithDueDate}
          onUpdateTitle={mockOnUpdateTitle}
          onDelete={mockOnDelete}
        />
      )

      // Should NOT show Overdue, Today, or Tomorrow for 10 days in future
      expect(screen.queryByText('Overdue')).not.toBeInTheDocument()
      expect(screen.queryByText('Today')).not.toBeInTheDocument()
      expect(screen.queryByText('Tomorrow')).not.toBeInTheDocument()

      // Should show a formatted date (locale-dependent, e.g., "Jan 15" or "15 Jan")
      const expectedDate = futureDate.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
      expect(screen.getByText(expectedDate)).toBeInTheDocument()
    })
  })

  describe('editing', () => {
    it('enters edit mode when clicking on title', async () => {
      const user = userEvent.setup()
      render(<CardItem card={mockCard} onUpdateTitle={mockOnUpdateTitle} onDelete={mockOnDelete} />)

      await user.click(screen.getByText('Test Card'))

      expect(screen.getByRole('textbox')).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toHaveValue('Test Card')
    })

    it('calls onUpdateTitle when submitting with Enter', async () => {
      const user = userEvent.setup()
      render(<CardItem card={mockCard} onUpdateTitle={mockOnUpdateTitle} onDelete={mockOnDelete} />)

      await user.click(screen.getByText('Test Card'))
      const textarea = screen.getByRole('textbox')
      await user.clear(textarea)
      await user.type(textarea, 'Updated Title{Enter}')

      expect(mockOnUpdateTitle).toHaveBeenCalledWith('Updated Title')
    })

    it('does not call onUpdateTitle when title is unchanged', async () => {
      const user = userEvent.setup()
      render(<CardItem card={mockCard} onUpdateTitle={mockOnUpdateTitle} onDelete={mockOnDelete} />)

      await user.click(screen.getByText('Test Card'))
      const textarea = screen.getByRole('textbox')
      await user.type(textarea, '{Enter}')

      expect(mockOnUpdateTitle).not.toHaveBeenCalled()
    })

    it('cancels edit and restores title on Escape', async () => {
      const user = userEvent.setup()
      render(<CardItem card={mockCard} onUpdateTitle={mockOnUpdateTitle} onDelete={mockOnDelete} />)

      await user.click(screen.getByText('Test Card'))
      const textarea = screen.getByRole('textbox')
      await user.clear(textarea)
      await user.type(textarea, 'Changed Title{Escape}')

      expect(mockOnUpdateTitle).not.toHaveBeenCalled()
      expect(screen.getByText('Test Card')).toBeInTheDocument()
    })

    it('cancels edit and restores title on blur', async () => {
      const user = userEvent.setup()
      render(<CardItem card={mockCard} onUpdateTitle={mockOnUpdateTitle} onDelete={mockOnDelete} />)

      await user.click(screen.getByText('Test Card'))
      const textarea = screen.getByRole('textbox')
      await user.clear(textarea)
      await user.type(textarea, 'Changed Title')
      fireEvent.blur(textarea)

      expect(mockOnUpdateTitle).not.toHaveBeenCalled()
      await waitFor(() => {
        expect(screen.getByText('Test Card')).toBeInTheDocument()
      })
    })

    it('trims whitespace from title before submitting', async () => {
      const user = userEvent.setup()
      render(<CardItem card={mockCard} onUpdateTitle={mockOnUpdateTitle} onDelete={mockOnDelete} />)

      await user.click(screen.getByText('Test Card'))
      const textarea = screen.getByRole('textbox')
      await user.clear(textarea)
      await user.type(textarea, '  Trimmed Title  {Enter}')

      expect(mockOnUpdateTitle).toHaveBeenCalledWith('Trimmed Title')
    })

    it('does not submit empty title', async () => {
      const user = userEvent.setup()
      render(<CardItem card={mockCard} onUpdateTitle={mockOnUpdateTitle} onDelete={mockOnDelete} />)

      await user.click(screen.getByText('Test Card'))
      const textarea = screen.getByRole('textbox')
      await user.clear(textarea)
      await user.type(textarea, '{Enter}')

      expect(mockOnUpdateTitle).not.toHaveBeenCalled()
    })
  })

  describe('deleting', () => {
    it('renders dropdown menu with delete option', async () => {
      const user = userEvent.setup()
      render(<CardItem card={mockCard} onUpdateTitle={mockOnUpdateTitle} onDelete={mockOnDelete} />)

      await user.click(screen.getByRole('button', { name: 'Card options' }))

      expect(screen.getByText('Delete card')).toBeInTheDocument()
    })

    it('shows "Deleting..." when isDeleting is true', async () => {
      const user = userEvent.setup()
      render(
        <CardItem
          card={mockCard}
          onUpdateTitle={mockOnUpdateTitle}
          onDelete={mockOnDelete}
          isDeleting={true}
        />
      )

      await user.click(screen.getByRole('button', { name: 'Card options' }))

      expect(screen.getByText('Deleting...')).toBeInTheDocument()
    })

    it('calls onDelete when delete option is clicked', async () => {
      const user = userEvent.setup()
      render(<CardItem card={mockCard} onUpdateTitle={mockOnUpdateTitle} onDelete={mockOnDelete} />)

      await user.click(screen.getByRole('button', { name: 'Card options' }))
      await user.click(screen.getByText('Delete card'))

      expect(mockOnDelete).toHaveBeenCalled()
    })
  })

  describe('loading states', () => {
    it('disables textarea when isUpdating is true', async () => {
      const user = userEvent.setup()
      render(
        <CardItem
          card={mockCard}
          onUpdateTitle={mockOnUpdateTitle}
          onDelete={mockOnDelete}
          isUpdating={true}
        />
      )

      await user.click(screen.getByText('Test Card'))
      const textarea = screen.getByRole('textbox')

      expect(textarea).toBeDisabled()
    })
  })

  describe('syncing with prop changes', () => {
    it('updates title when card prop changes', () => {
      const { rerender } = render(
        <CardItem card={mockCard} onUpdateTitle={mockOnUpdateTitle} onDelete={mockOnDelete} />
      )

      expect(screen.getByText('Test Card')).toBeInTheDocument()

      const updatedCard = { ...mockCard, title: 'New Title' }
      rerender(
        <CardItem card={updatedCard} onUpdateTitle={mockOnUpdateTitle} onDelete={mockOnDelete} />
      )

      expect(screen.getByText('New Title')).toBeInTheDocument()
    })
  })
})
