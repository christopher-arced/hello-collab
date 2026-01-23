import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../test/test-utils'
import userEvent from '@testing-library/user-event'
import DropdownMenu from './DropdownMenu'
import type { DropdownMenuItem } from './DropdownMenu'

describe('DropdownMenu', () => {
  const mockItems: DropdownMenuItem[] = [
    { label: 'Edit', onClick: vi.fn() },
    { label: 'Delete', onClick: vi.fn(), variant: 'danger' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders trigger button with aria label', () => {
    render(<DropdownMenu items={mockItems} ariaLabel="Options menu" />)

    expect(screen.getByRole('button', { name: 'Options menu' })).toBeInTheDocument()
  })

  it('uses default aria label when not provided', () => {
    render(<DropdownMenu items={mockItems} />)

    expect(screen.getByRole('button', { name: 'Options' })).toBeInTheDocument()
  })

  it('menu is closed by default', () => {
    render(<DropdownMenu items={mockItems} />)

    expect(screen.queryByText('Edit')).not.toBeInTheDocument()
    expect(screen.queryByText('Delete')).not.toBeInTheDocument()
  })

  describe('opening and closing', () => {
    it('opens menu when trigger is clicked', async () => {
      const user = userEvent.setup()
      render(<DropdownMenu items={mockItems} />)

      await user.click(screen.getByRole('button', { name: 'Options' }))

      expect(screen.getByText('Edit')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    it('closes menu when trigger is clicked again', async () => {
      const user = userEvent.setup()
      render(<DropdownMenu items={mockItems} />)

      await user.click(screen.getByRole('button', { name: 'Options' }))
      expect(screen.getByText('Edit')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Options' }))

      await waitFor(() => {
        expect(screen.queryByText('Edit')).not.toBeInTheDocument()
      })
    })

    it('closes menu when clicking outside', async () => {
      render(
        <div>
          <DropdownMenu items={mockItems} />
          <button>Outside button</button>
        </div>
      )

      fireEvent.click(screen.getByRole('button', { name: 'Options' }))
      expect(screen.getByText('Edit')).toBeInTheDocument()

      fireEvent.mouseDown(screen.getByText('Outside button'))

      await waitFor(() => {
        expect(screen.queryByText('Edit')).not.toBeInTheDocument()
      })
    })

    it('closes menu on scroll', async () => {
      const user = userEvent.setup()
      render(<DropdownMenu items={mockItems} />)

      await user.click(screen.getByRole('button', { name: 'Options' }))
      expect(screen.getByText('Edit')).toBeInTheDocument()

      fireEvent.scroll(window)

      await waitFor(() => {
        expect(screen.queryByText('Edit')).not.toBeInTheDocument()
      })
    })

    it('calls onMenuOpen when opening', async () => {
      const user = userEvent.setup()
      const onMenuOpen = vi.fn()
      render(<DropdownMenu items={mockItems} onMenuOpen={onMenuOpen} />)

      await user.click(screen.getByRole('button', { name: 'Options' }))

      expect(onMenuOpen).toHaveBeenCalled()
    })
  })

  describe('menu items', () => {
    it('renders all menu items', async () => {
      const user = userEvent.setup()
      render(<DropdownMenu items={mockItems} />)

      await user.click(screen.getByRole('button', { name: 'Options' }))

      expect(screen.getByText('Edit')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    it('calls onClick when item is clicked', async () => {
      const user = userEvent.setup()
      render(<DropdownMenu items={mockItems} />)

      await user.click(screen.getByRole('button', { name: 'Options' }))
      await user.click(screen.getByText('Edit'))

      expect(mockItems[0].onClick).toHaveBeenCalled()
    })

    it('closes menu after item is clicked', async () => {
      const user = userEvent.setup()
      render(<DropdownMenu items={mockItems} />)

      await user.click(screen.getByRole('button', { name: 'Options' }))
      await user.click(screen.getByText('Edit'))

      await waitFor(() => {
        expect(screen.queryByText('Edit')).not.toBeInTheDocument()
      })
    })

    it('renders danger variant with red color', async () => {
      const user = userEvent.setup()
      render(<DropdownMenu items={mockItems} />)

      await user.click(screen.getByRole('button', { name: 'Options' }))

      const deleteButton = screen.getByText('Delete')
      expect(deleteButton).toHaveClass('text-red-500')
    })

    it('renders default variant without red color', async () => {
      const user = userEvent.setup()
      render(<DropdownMenu items={mockItems} />)

      await user.click(screen.getByRole('button', { name: 'Options' }))

      const editButton = screen.getByText('Edit')
      expect(editButton).not.toHaveClass('text-red-500')
    })

    it('disables item when disabled is true', async () => {
      const user = userEvent.setup()
      const itemsWithDisabled: DropdownMenuItem[] = [
        { label: 'Disabled Item', onClick: vi.fn(), disabled: true },
      ]
      render(<DropdownMenu items={itemsWithDisabled} />)

      await user.click(screen.getByRole('button', { name: 'Options' }))

      const disabledButton = screen.getByText('Disabled Item')
      expect(disabledButton).toBeDisabled()
    })

    it('does not call onClick when disabled item is clicked', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      const itemsWithDisabled: DropdownMenuItem[] = [
        { label: 'Disabled Item', onClick, disabled: true },
      ]
      render(<DropdownMenu items={itemsWithDisabled} />)

      await user.click(screen.getByRole('button', { name: 'Options' }))
      await user.click(screen.getByText('Disabled Item'))

      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('positioning', () => {
    it('positions menu based on trigger location', async () => {
      const user = userEvent.setup()
      render(<DropdownMenu items={mockItems} />)

      // Mock getBoundingClientRect
      const trigger = screen.getByRole('button', { name: 'Options' })
      vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
        top: 100,
        right: 200,
        bottom: 124,
        left: 150,
        width: 50,
        height: 24,
        x: 150,
        y: 100,
        toJSON: () => {},
      })

      await user.click(trigger)

      const menu = screen.getByText('Edit').parentElement
      expect(menu).toHaveStyle({ top: '89px', left: '200px' })
    })
  })

  describe('customization', () => {
    it('applies custom trigger className', () => {
      render(<DropdownMenu items={mockItems} triggerClassName="custom-class" />)

      expect(screen.getByRole('button', { name: 'Options' })).toHaveClass('custom-class')
    })

    it('applies custom menu width', async () => {
      const user = userEvent.setup()
      render(<DropdownMenu items={mockItems} menuWidth="w-64" />)

      await user.click(screen.getByRole('button', { name: 'Options' }))

      const menu = screen.getByText('Edit').parentElement
      expect(menu).toHaveClass('w-64')
    })

    it('uses default menu width when not specified', async () => {
      const user = userEvent.setup()
      render(<DropdownMenu items={mockItems} />)

      await user.click(screen.getByRole('button', { name: 'Options' }))

      const menu = screen.getByText('Edit').parentElement
      expect(menu).toHaveClass('w-40')
    })
  })
})
