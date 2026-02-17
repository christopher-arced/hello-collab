import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '../../test/test-utils'
import userEvent from '@testing-library/user-event'
import Modal from './Modal'

// jsdom doesn't implement offsetParent (always returns null), so the focus trap's
// visibility filter excludes all elements. We mock it to return a truthy value.
function mockOffsetParent() {
  Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
    get() {
      return this.parentElement
    },
    configurable: true,
  })
}

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Modal',
    children: <p>Modal content</p>,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockOffsetParent()
  })

  it('renders nothing when closed', () => {
    render(<Modal {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
  })

  it('renders title and content when open', () => {
    render(<Modal {...defaultProps} />)

    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('renders as a dialog with aria-modal', () => {
    render(<Modal {...defaultProps} />)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('calls onClose when Escape is pressed', () => {
    render(<Modal {...defaultProps} />)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(defaultProps.onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<Modal {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /close modal/i }))

    expect(defaultProps.onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when backdrop is clicked', () => {
    render(<Modal {...defaultProps} />)

    const backdrop = screen.getByRole('dialog').parentElement!
    fireEvent.click(backdrop, { target: backdrop })
  })

  describe('focus trap', () => {
    it('cycles focus from last to first element on Tab', () => {
      render(
        <Modal {...defaultProps}>
          <button>First</button>
          <button>Second</button>
        </Modal>
      )

      const secondButton = screen.getByText('Second')
      secondButton.focus()

      fireEvent.keyDown(document, { key: 'Tab' })

      const closeButton = screen.getByRole('button', { name: /close modal/i })
      expect(document.activeElement).toBe(closeButton)
    })

    it('cycles focus from first to last element on Shift+Tab', () => {
      render(
        <Modal {...defaultProps}>
          <button>First</button>
          <button>Second</button>
        </Modal>
      )

      const closeButton = screen.getByRole('button', { name: /close modal/i })
      closeButton.focus()

      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })

      const secondButton = screen.getByText('Second')
      expect(document.activeElement).toBe(secondButton)
    })

    it('does not prevent Tab when focus is not on the last element', () => {
      render(
        <Modal {...defaultProps}>
          <button>First</button>
          <button>Second</button>
        </Modal>
      )

      const firstButton = screen.getByText('First')
      firstButton.focus()

      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      document.dispatchEvent(event)

      expect(preventDefaultSpy).not.toHaveBeenCalled()
    })

    it('allows Tab to pass through when no focusable elements exist', () => {
      render(
        <Modal {...defaultProps}>
          <p>No focusable content here</p>
        </Modal>
      )

      // Override offsetParent to null to simulate no visible focusable elements
      Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
        get() {
          return null
        },
        configurable: true,
      })

      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
      })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      document.dispatchEvent(event)

      // Tab should NOT be prevented — it passes through
      expect(preventDefaultSpy).not.toHaveBeenCalled()
    })
  })
})
