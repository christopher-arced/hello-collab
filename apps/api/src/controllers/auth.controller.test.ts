import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../app'
import * as authService from '../services/auth.service'

vi.mock('../services/auth.service')
vi.mock('@hello/database', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

describe('POST /api/auth/register', () => {
  const app = createApp()

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('with valid data', () => {
    it('should register a new user and return 201', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(authService.findUserByEmail).mockResolvedValue(null)
      vi.mocked(authService.createUser).mockResolvedValue(mockUser)
      vi.mocked(authService.generateTokens).mockReturnValue({ accessToken: 'mock.jwt.token' })

      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      })

      expect(response.status).toBe(201)
      expect(response.body).toEqual({
        success: true,
        data: {
          user: expect.objectContaining({
            id: 'user-123',
            email: 'test@example.com',
            name: 'Test User',
          }),
        },
      })
      expect(response.body.data).not.toHaveProperty('tokens')
    })

    it('should set accessToken cookie on successful registration', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(authService.findUserByEmail).mockResolvedValue(null)
      vi.mocked(authService.createUser).mockResolvedValue(mockUser)
      vi.mocked(authService.generateTokens).mockReturnValue({ accessToken: 'mock.jwt.token' })

      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      })

      expect(response.headers['set-cookie']).toBeDefined()
      expect(response.headers['set-cookie'][0]).toContain('accessToken=')
    })
  })

  describe('with invalid data (validation failures)', () => {
    it('should return 400 for missing email', async () => {
      const response = await request(app).post('/api/auth/register').send({
        password: 'Password123!',
        name: 'Test User',
      })

      expect(response.status).toBe(400)
      expect(response.body).toMatchObject({
        success: false,
        error: 'Validation failed',
      })
      expect(response.body.details).toHaveProperty('email')
    })

    it('should return 400 for invalid email format', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'invalid-email',
        password: 'Password123!',
        name: 'Test User',
      })

      expect(response.status).toBe(400)
      expect(response.body).toMatchObject({
        success: false,
        error: 'Validation failed',
      })
      expect(response.body.details).toHaveProperty('email')
    })

    it('should return 400 for missing password', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        name: 'Test User',
      })

      expect(response.status).toBe(400)
      expect(response.body).toMatchObject({
        success: false,
        error: 'Validation failed',
      })
      expect(response.body.details).toHaveProperty('password')
    })

    it('should return 400 for short password', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: '123',
        name: 'Test User',
      })

      expect(response.status).toBe(400)
      expect(response.body).toMatchObject({
        success: false,
        error: 'Validation failed',
      })
      expect(response.body.details).toHaveProperty('password')
    })

    it('should return 400 for missing name', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'Password123!',
      })

      expect(response.status).toBe(400)
      expect(response.body).toMatchObject({
        success: false,
        error: 'Validation failed',
      })
      expect(response.body.details).toHaveProperty('name')
    })
  })

  describe('with duplicate email', () => {
    it('should return 409 when email already exists', async () => {
      const existingUser = {
        id: 'existing-user',
        email: 'test@example.com',
        name: 'Existing User',
        passwordHash: 'hashed',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(authService.findUserByEmail).mockResolvedValue(existingUser)

      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      })

      expect(response.status).toBe(409)
      expect(response.body).toEqual({
        success: false,
        error: 'Email already registered',
      })
    })

    it('should return 409 on race condition (database unique constraint)', async () => {
      const { Prisma } = await import('@prisma/client')

      vi.mocked(authService.findUserByEmail).mockResolvedValue(null)
      vi.mocked(authService.createUser).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '5.0.0',
        })
      )

      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      })

      expect(response.status).toBe(409)
      expect(response.body).toEqual({
        success: false,
        error: 'Email already registered',
      })
    })
  })
})

describe('POST /api/auth/login', () => {
  const app = createApp()

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('with valid credentials', () => {
    it('should login and return 200 with user (no tokens in body)', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed-password',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(authService.findUserByEmail).mockResolvedValue(mockUser)
      vi.mocked(authService.verifyPassword).mockResolvedValue(true)
      vi.mocked(authService.generateTokens).mockReturnValue({ accessToken: 'mock.jwt.token' })

      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'Password123!',
      })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        success: true,
        data: {
          user: expect.objectContaining({
            id: 'user-123',
            email: 'test@example.com',
            name: 'Test User',
          }),
        },
      })
      expect(response.body.data.user).not.toHaveProperty('passwordHash')
      expect(response.body.data).not.toHaveProperty('tokens')
    })

    it('should set accessToken cookie on successful login', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed-password',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(authService.findUserByEmail).mockResolvedValue(mockUser)
      vi.mocked(authService.verifyPassword).mockResolvedValue(true)
      vi.mocked(authService.generateTokens).mockReturnValue({ accessToken: 'mock.jwt.token' })

      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'Password123!',
      })

      expect(response.headers['set-cookie']).toBeDefined()
      expect(response.headers['set-cookie'][0]).toContain('accessToken=')
    })
  })

  describe('with invalid credentials', () => {
    it('should return 401 when email does not exist', async () => {
      vi.mocked(authService.findUserByEmail).mockResolvedValue(null)
      vi.mocked(authService.verifyPassword).mockResolvedValue(false)

      const response = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'Password123!',
      })

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        success: false,
        error: 'Invalid email or password',
      })
      // Verify password check is still called to prevent timing attacks
      expect(authService.verifyPassword).toHaveBeenCalled()
    })

    it('should return 401 when password is incorrect', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed-password',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(authService.findUserByEmail).mockResolvedValue(mockUser)
      vi.mocked(authService.verifyPassword).mockResolvedValue(false)

      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'WrongPassword123!',
      })

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        success: false,
        error: 'Invalid email or password',
      })
    })
  })

  describe('with invalid data (validation failures)', () => {
    it('should return 400 for missing email', async () => {
      const response = await request(app).post('/api/auth/login').send({
        password: 'Password123!',
      })

      expect(response.status).toBe(400)
      expect(response.body).toMatchObject({
        success: false,
        error: 'Validation failed',
      })
      expect(response.body.details).toHaveProperty('email')
    })

    it('should return 400 for invalid email format', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'invalid-email',
        password: 'Password123!',
      })

      expect(response.status).toBe(400)
      expect(response.body).toMatchObject({
        success: false,
        error: 'Validation failed',
      })
      expect(response.body.details).toHaveProperty('email')
    })

    it('should return 400 for missing password', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
      })

      expect(response.status).toBe(400)
      expect(response.body).toMatchObject({
        success: false,
        error: 'Validation failed',
      })
      expect(response.body.details).toHaveProperty('password')
    })
  })
})

describe('POST /api/auth/logout', () => {
  const app = createApp()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return 200 with success message', async () => {
    const response = await request(app).post('/api/auth/logout').send()

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      success: true,
      message: 'Logged out successfully',
    })
  })

  it('should clear the accessToken cookie', async () => {
    const response = await request(app).post('/api/auth/logout').send()

    expect(response.headers['set-cookie']).toBeDefined()
    expect(response.headers['set-cookie'][0]).toContain('accessToken=;')
  })
})

describe('GET /api/auth/me', () => {
  const app = createApp()

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('with valid session', () => {
    it('should return 200 with user data when authenticated', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(authService.verifyToken).mockReturnValue({ valid: true, userId: 'user-123' })
      vi.mocked(authService.findUserById).mockResolvedValue(mockUser)

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', 'accessToken=valid.jwt.token')

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
        }),
      })
    })
  })

  describe('without authentication', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app).get('/api/auth/me')

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        success: false,
        error: 'Not authenticated',
      })
    })
  })

  describe('with invalid token', () => {
    it('should return 401 and clear cookie when token is invalid', async () => {
      vi.mocked(authService.verifyToken).mockReturnValue({ valid: false, expired: false })

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', 'accessToken=invalid.token')

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        success: false,
        error: 'Invalid token',
      })
      expect(response.headers['set-cookie']).toBeDefined()
      expect(response.headers['set-cookie'][0]).toContain('accessToken=;')
    })

    it('should return 403 and clear cookie when token is expired', async () => {
      vi.mocked(authService.verifyToken).mockReturnValue({ valid: false, expired: true })

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', 'accessToken=expired.token')

      expect(response.status).toBe(403)
      expect(response.body).toEqual({
        success: false,
        error: 'Token expired',
      })
      expect(response.headers['set-cookie']).toBeDefined()
      expect(response.headers['set-cookie'][0]).toContain('accessToken=;')
    })
  })

  describe('with valid token but user not found', () => {
    it('should return 401 and clear cookie when user does not exist', async () => {
      vi.mocked(authService.verifyToken).mockReturnValue({ valid: true, userId: 'deleted-user' })
      vi.mocked(authService.findUserById).mockResolvedValue(null)

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', 'accessToken=valid.token.deleted.user')

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        success: false,
        error: 'User not found',
      })
      expect(response.headers['set-cookie']).toBeDefined()
      expect(response.headers['set-cookie'][0]).toContain('accessToken=;')
    })
  })
})
