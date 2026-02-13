import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../../../test/test-utils'
import userEvent from '@testing-library/user-event'
import { EditBoardModal } from './EditBoardModal'
import type { Board } from '@hello/types'
import type { ApiError } from '@/lib/api'

const mockBoard: Board = {
  id: 'board-1',
  title: 'Test Board',
  description: 'A test description',
  bgColor: '#0079BF',
  ownerId: 'user-1',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
}

describe('EditBoardModal', () => {
  const defaultProps = {
    board: mockBoard,
    isOpen: true,
    onClose: vi.fn(),
    onSave: vi.fn().mockResolvedValue(undefined),
    isSaving: false,
    saveError: null as ApiError | null,
    onResetError: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    defaultProps.onSave.mockResolvedValue(undefined)
  })

  it('renders nothing when closed', () => {
    render(<EditBoardModal {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('Edit board')).not.toBeInTheDocument()
  })

  it('renders modal with form fields when open', () => {
    render(<EditBoardModal {...defaultProps} />)

    expect(screen.getByText('Edit board')).toBeInTheDocument()
    expect(screen.getByLabelText(/board title/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/what's this board about/i)).toBeInTheDocument()
    expect(screen.getByText(/board color/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })

  it('pre-populates form with board data', () => {
    render(<EditBoardModal {...defaultProps} />)

    expect(screen.getByLabelText(/board title/i)).toHaveValue('Test Board')
    expect(screen.getByPlaceholderText(/what's this board about/i)).toHaveValue(
      'A test description'
    )
  })

  it('pre-populates with empty description when board has null description', () => {
    const boardNoDesc = { ...mockBoard, description: null }
    render(<EditBoardModal {...defaultProps} board={boardNoDesc} />)

    expect(screen.getByPlaceholderText(/what's this board about/i)).toHaveValue('')
  })

  it('shows validation error for empty title', async () => {
    const user = userEvent.setup()
    render(<EditBoardModal {...defaultProps} />)

    const titleInput = screen.getByLabelText(/board title/i)
    await user.clear(titleInput)
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(screen.getByText(/at least 1 character/i)).toBeInTheDocument()
    })
    expect(defaultProps.onSave).not.toHaveBeenCalled()
  })

  it('calls onSave with form data on valid submission', async () => {
    const user = userEvent.setup()
    render(<EditBoardModal {...defaultProps} />)

    const titleInput = screen.getByLabelText(/board title/i)
    await user.clear(titleInput)
    await user.type(titleInput, 'Updated Board')
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Updated Board',
          description: 'A test description',
          bgColor: '#0079BF',
        })
      )
    })
  })

  it('calls onClose after successful save', async () => {
    const user = userEvent.setup()
    render(<EditBoardModal {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  it('calls onClose and onResetError when cancel clicked', async () => {
    const user = userEvent.setup()
    render(<EditBoardModal {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(defaultProps.onClose).toHaveBeenCalled()
    expect(defaultProps.onResetError).toHaveBeenCalled()
  })

  it('calls onClose and onResetError when close button (X) clicked', async () => {
    const user = userEvent.setup()
    render(<EditBoardModal {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /close modal/i }))

    expect(defaultProps.onClose).toHaveBeenCalled()
    expect(defaultProps.onResetError).toHaveBeenCalled()
  })

  it('displays API error message', () => {
    const error = { message: 'Board update failed', status: 500, name: 'ApiError' } as ApiError
    render(<EditBoardModal {...defaultProps} saveError={error} />)

    expect(screen.getByText('Board update failed')).toBeInTheDocument()
  })

  it('shows saving state on submit button', () => {
    render(<EditBoardModal {...defaultProps} isSaving={true} />)

    expect(screen.getByRole('button', { name: /saving\.\.\./i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /saving\.\.\./i })).toBeDisabled()
  })

  it('renders 12 color picker buttons', () => {
    render(<EditBoardModal {...defaultProps} />)

    const colorButtons = screen.getAllByRole('button', { name: /select color/i })
    expect(colorButtons).toHaveLength(12)
  })

  it('allows selecting a different color', async () => {
    const user = userEvent.setup()
    render(<EditBoardModal {...defaultProps} />)

    // Select indigo (#6366f1) - first color
    const colorButtons = screen.getAllByRole('button', { name: /select color/i })
    await user.click(colorButtons[0])

    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          bgColor: '#6366f1',
        })
      )
    })
  })

  it('does not submit when title exceeds max length', async () => {
    const user = userEvent.setup()
    render(<EditBoardModal {...defaultProps} />)

    const titleInput = screen.getByLabelText(/board title/i)
    await user.clear(titleInput)
    await user.type(titleInput, 'a'.repeat(101))
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(screen.getByText(/at most 100 character/i)).toBeInTheDocument()
    })
    expect(defaultProps.onSave).not.toHaveBeenCalled()
  })
})
