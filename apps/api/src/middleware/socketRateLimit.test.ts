import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { socketRateLimitMiddleware, clearConnectionAttempts } from './socketRateLimit'
import type { Socket } from 'socket.io'

const createMockSocket = (address: string): Socket =>
  ({
    handshake: { address },
  }) as unknown as Socket

describe('socketRateLimitMiddleware', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    clearConnectionAttempts()
  })

  afterEach(() => {
    clearConnectionAttempts()
    vi.useRealTimers()
  })

  it('allows connections under the limit', () => {
    const socket = createMockSocket('127.0.0.1')
    const next = vi.fn()

    socketRateLimitMiddleware(socket, next)

    expect(next).toHaveBeenCalledWith()
  })

  it('allows up to 10 connections from the same IP', () => {
    const next = vi.fn()

    for (let i = 0; i < 10; i++) {
      const socket = createMockSocket('127.0.0.1')
      socketRateLimitMiddleware(socket, next)
    }

    expect(next).toHaveBeenCalledTimes(10)
    expect(next).toHaveBeenLastCalledWith()
  })

  it('blocks the 11th connection from the same IP', () => {
    const next = vi.fn()

    for (let i = 0; i < 11; i++) {
      const socket = createMockSocket('127.0.0.1')
      socketRateLimitMiddleware(socket, next)
    }

    expect(next).toHaveBeenCalledTimes(11)
    expect(next).toHaveBeenLastCalledWith(expect.any(Error))
  })

  it('tracks different IPs independently', () => {
    const next = vi.fn()

    for (let i = 0; i < 10; i++) {
      socketRateLimitMiddleware(createMockSocket('10.0.0.1'), next)
    }

    socketRateLimitMiddleware(createMockSocket('10.0.0.2'), next)

    expect(next).toHaveBeenCalledTimes(11)
    expect(next).toHaveBeenLastCalledWith()
  })

  it('resets the counter after the window expires', () => {
    const next = vi.fn()

    for (let i = 0; i < 10; i++) {
      socketRateLimitMiddleware(createMockSocket('127.0.0.1'), next)
    }

    // Advance past the 1-minute window
    vi.advanceTimersByTime(61_000)

    socketRateLimitMiddleware(createMockSocket('127.0.0.1'), next)

    expect(next).toHaveBeenCalledTimes(11)
    expect(next).toHaveBeenLastCalledWith()
  })

  it('returns a descriptive error message when rate limited', () => {
    const next = vi.fn()

    for (let i = 0; i < 11; i++) {
      socketRateLimitMiddleware(createMockSocket('127.0.0.1'), next)
    }

    const lastCallArg = next.mock.calls[10][0] as Error
    expect(lastCallArg.message).toBe('Too many connection attempts, please try again later')
  })
})
