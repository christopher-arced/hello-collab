import { describe, it, expect } from 'vitest'
import { getInitials } from './string'

describe('getInitials', () => {
  it('returns first and last initials for two-word names', () => {
    expect(getInitials('John Doe')).toBe('JD')
    expect(getInitials('Alice Smith')).toBe('AS')
  })

  it('returns first and last initials for multi-word names', () => {
    expect(getInitials('John Michael Smith')).toBe('JS')
    expect(getInitials('Mary Jane Watson Parker')).toBe('MP')
  })

  it('returns first two characters for single-word names', () => {
    expect(getInitials('Alice')).toBe('AL')
    expect(getInitials('Bob')).toBe('BO')
  })

  it('handles single character names', () => {
    expect(getInitials('A')).toBe('A')
  })

  it('returns uppercase initials', () => {
    expect(getInitials('john doe')).toBe('JD')
    expect(getInitials('alice')).toBe('AL')
  })

  it('handles extra whitespace', () => {
    expect(getInitials('  John   Doe  ')).toBe('JD')
    expect(getInitials('  Alice  ')).toBe('AL')
  })

  it('handles names with multiple spaces between words', () => {
    expect(getInitials('John    Smith')).toBe('JS')
  })

  it('returns fallback for empty string', () => {
    expect(getInitials('')).toBe('??')
    expect(getInitials('   ')).toBe('??')
  })
})
