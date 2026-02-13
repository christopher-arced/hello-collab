import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../../test/test-utils'
import userEvent from '@testing-library/user-event'
import ConfirmModal from './ConfirmModal'

describe('ConfirmModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Confirm action',
    children: 'Are you sure?',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when closed', () => {
    render(<ConfirmModal {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('Confirm action')).not.toBeInTheDocument()
  })

  it('renders title and content when open', () => {
    render(<ConfirmModal {...defaultProps} />)

    expect(screen.getByText('Confirm action')).toBeInTheDocument()
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
  })

  it('renders Cancel and Confirm buttons by default', () => {
    render(<ConfirmModal {...defaultProps} />)

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument()
  })

  it('uses custom confirmLabel', () => {
    render(<ConfirmModal {...defaultProps} confirmLabel="Delete Board" />)

    expect(screen.getByRole('button', { name: /delete board/i })).toBeInTheDocument()
  })

  it('calls onConfirm when confirm button clicked', async () => {
    const user = userEvent.setup()
    render(<ConfirmModal {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /confirm/i }))

    expect(defaultProps.onConfirm).toHaveBeenCalledOnce()
  })

  it('calls onClose when cancel button clicked', async () => {
    const user = userEvent.setup()
    render(<ConfirmModal {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(defaultProps.onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when close button (X) clicked', async () => {
    const user = userEvent.setup()
    render(<ConfirmModal {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /close modal/i }))

    expect(defaultProps.onClose).toHaveBeenCalledOnce()
  })

  it('shows loadingLabel when isLoading is true', () => {
    render(
      <ConfirmModal
        {...defaultProps}
        isLoading={true}
        confirmLabel="Delete"
        loadingLabel="Deleting..."
      />
    )

    expect(screen.getByRole('button', { name: /deleting\.\.\./i })).toBeInTheDocument()
  })

  it('falls back to confirmLabel when isLoading but no loadingLabel', () => {
    render(<ConfirmModal {...defaultProps} isLoading={true} confirmLabel="Delete" />)

    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('disables confirm button when isLoading', () => {
    render(<ConfirmModal {...defaultProps} isLoading={true} confirmLabel="Delete" />)

    expect(screen.getByRole('button', { name: /delete/i })).toBeDisabled()
  })

  it('applies danger variant classes to confirm button', () => {
    render(<ConfirmModal {...defaultProps} variant="danger" confirmLabel="Delete" />)

    const confirmButton = screen.getByRole('button', { name: /delete/i })
    expect(confirmButton.className).toContain('!bg-red-500')
  })

  it('does not apply danger classes for primary variant', () => {
    render(<ConfirmModal {...defaultProps} variant="primary" confirmLabel="OK" />)

    const confirmButton = screen.getByRole('button', { name: /ok/i })
    expect(confirmButton.className).not.toContain('!bg-red-500')
  })

  it('renders rich content as children', () => {
    render(
      <ConfirmModal {...defaultProps}>
        Delete <strong>My Board</strong> permanently?
      </ConfirmModal>
    )

    expect(screen.getByText('My Board')).toBeInTheDocument()
  })
})
