import { describe, it, expect, vi, beforeEach } from 'vitest'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { hashPassword, verifyPassword, generateTokens, verifyToken } from './auth.service'

vi.mock('bcrypt')
vi.mock('jsonwebtoken')

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('hashPassword', () => {
    it('should hash password with bcrypt using 10 salt rounds', async () => {
      const password = 'testPassword123'
      const hashedPassword = '$2b$10$hashedPassword'

      vi.mocked(bcrypt.hash).mockImplementation(() => Promise.resolve(hashedPassword))

      const result = await hashPassword(password)

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10)
      expect(result).toBe(hashedPassword)
    })

    it('should return different hashes for different passwords', async () => {
      vi.mocked(bcrypt.hash).mockImplementation((password) => Promise.resolve(`hashed_${password}`))

      const hash1 = await hashPassword('password1')
      const hash2 = await hashPassword('password2')

      expect(hash1).not.toBe(hash2)
    })
  })

  describe('verifyPassword', () => {
    it('should return true when password matches hash', async () => {
      vi.mocked(bcrypt.compare).mockImplementation(() => Promise.resolve(true))

      const result = await verifyPassword('password123', '$2b$10$hashedPassword')

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', '$2b$10$hashedPassword')
      expect(result).toBe(true)
    })

    it('should return false when password does not match hash', async () => {
      vi.mocked(bcrypt.compare).mockImplementation(() => Promise.resolve(false))

      const result = await verifyPassword('wrongpassword', '$2b$10$hashedPassword')

      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', '$2b$10$hashedPassword')
      expect(result).toBe(false)
    })
  })

  describe('generateTokens', () => {
    const originalEnv = process.env

    beforeEach(() => {
      process.env = { ...originalEnv }
      process.env.JWT_SECRET = 'test-secret'
    })

    it('should generate access token with userId', () => {
      const userId = 'user-123'
      const mockToken = 'mock.jwt.token'

      vi.mocked(jwt.sign).mockReturnValue(mockToken as never)

      const result = generateTokens(userId)

      expect(jwt.sign).toHaveBeenCalledWith({ userId }, 'test-secret', { expiresIn: '7d' })
      expect(result).toEqual({ accessToken: mockToken })
    })

    it('should use custom JWT_EXPIRES_IN if set', () => {
      process.env.JWT_EXPIRES_IN = '1h'
      const userId = 'user-123'

      vi.mocked(jwt.sign).mockReturnValue('token' as never)

      generateTokens(userId)

      expect(jwt.sign).toHaveBeenCalledWith({ userId }, 'test-secret', { expiresIn: '1h' })
    })

    it('should throw error if JWT_SECRET is not set', () => {
      delete process.env.JWT_SECRET

      expect(() => generateTokens('user-123')).toThrow('JWT_SECRET environment variable is not set')
    })
  })

  describe('verifyToken', () => {
    const originalEnv = process.env

    beforeEach(() => {
      process.env = { ...originalEnv }
      process.env.JWT_SECRET = 'test-secret'
    })

    it('should return valid result with userId for valid token', () => {
      const mockPayload = { userId: 'user-123' }

      vi.mocked(jwt.verify).mockReturnValue(mockPayload as never)

      const result = verifyToken('valid.jwt.token')

      expect(jwt.verify).toHaveBeenCalledWith('valid.jwt.token', 'test-secret')
      expect(result).toEqual({ valid: true, userId: 'user-123' })
    })

    it('should return invalid result with expired false for invalid token', () => {
      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new Error('invalid token')
      })

      const result = verifyToken('invalid.token')

      expect(result).toEqual({ valid: false, expired: false })
    })

    it('should return invalid result with expired true for expired token', () => {
      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new jwt.TokenExpiredError('jwt expired', new Date())
      })

      const result = verifyToken('expired.token')

      expect(result).toEqual({ valid: false, expired: true })
    })

    it('should throw error if JWT_SECRET is not set', () => {
      delete process.env.JWT_SECRET

      expect(() => verifyToken('some.token')).toThrow('JWT_SECRET environment variable is not set')
    })
  })
})
