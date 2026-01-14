import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test/test-utils'
import UserAvatar from './UserAvatar'

describe('UserAvatar', () => {
  it('renders the first letter of the name capitalized', () => {
    render(<UserAvatar name="john" />)
    expect(screen.getByText('J')).toBeInTheDocument()
  })

  it('renders with default medium size', () => {
    render(<UserAvatar name="Alice" />)
    const avatar = screen.getByText('A')
    expect(avatar).toHaveClass('w-8', 'h-8')
  })

  it('renders small size correctly', () => {
    render(<UserAvatar name="Bob" />)
    render(<UserAvatar name="Carol" size="sm" />)
    const smallAvatar = screen.getByText('C')
    expect(smallAvatar).toHaveClass('w-6', 'h-6')
  })

  it('renders large size correctly', () => {
    render(<UserAvatar name="Dave" size="lg" />)
    const largeAvatar = screen.getByText('D')
    expect(largeAvatar).toHaveClass('w-10', 'h-10')
  })

  it('generates consistent color for the same name', () => {
    const { container: container1 } = render(<UserAvatar name="TestUser" />)
    const { container: container2 } = render(<UserAvatar name="TestUser" />)

    const avatar1 = container1.querySelector('div')
    const avatar2 = container2.querySelector('div')

    expect(avatar1?.style.backgroundColor).toBe(avatar2?.style.backgroundColor)
  })

  it('generates different colors for different names', () => {
    const { container: container1 } = render(<UserAvatar name="Alice" />)
    const { container: container2 } = render(<UserAvatar name="Bob" />)

    const avatar1 = container1.querySelector('div')
    const avatar2 = container2.querySelector('div')

    expect(avatar1?.style.backgroundColor).not.toBe(avatar2?.style.backgroundColor)
  })

  it('applies rounded-full class for circular shape', () => {
    render(<UserAvatar name="Test" />)
    const avatar = screen.getByText('T')
    expect(avatar).toHaveClass('rounded-full')
  })
})
