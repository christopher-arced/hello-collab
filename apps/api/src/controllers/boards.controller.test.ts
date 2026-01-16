import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../app'
import * as boardsService from '../services/boards.service'
import * as authService from '../services/auth.service'

vi.mock('../services/boards.service')
vi.mock('../services/auth.service')
vi.mock('@hello/database', () => ({
  prisma: {
    board: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  avatarUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockBoard = {
  id: 'board-123',
  title: 'Test Board',
  description: 'A test board',
  bgColor: '#0079BF',
  ownerId: 'user-123',
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('GET /api/boards', () => {
  const app = createApp()

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret'
    vi.mocked(authService.verifyToken).mockReturnValue({ valid: true, userId: 'user-123' })
    vi.mocked(authService.findUserById).mockResolvedValue(mockUser)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return 200 with list of boards', async () => {
    vi.mocked(boardsService.findBoards).mockResolvedValue([mockBoard])

    const response = await request(app)
      .get('/api/boards')
      .set('Cookie', 'accessToken=valid.jwt.token')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      success: true,
      data: expect.arrayContaining([
        expect.objectContaining({
          id: 'board-123',
          title: 'Test Board',
        }),
      ]),
    })
  })

  it('should return empty array when user has no boards', async () => {
    vi.mocked(boardsService.findBoards).mockResolvedValue([])

    const response = await request(app)
      .get('/api/boards')
      .set('Cookie', 'accessToken=valid.jwt.token')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      success: true,
      data: [],
    })
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app).get('/api/boards')

    expect(response.status).toBe(401)
  })
})

describe('POST /api/boards', () => {
  const app = createApp()

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret'
    vi.mocked(authService.verifyToken).mockReturnValue({ valid: true, userId: 'user-123' })
    vi.mocked(authService.findUserById).mockResolvedValue(mockUser)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('with valid data', () => {
    it('should create a board and return 201', async () => {
      vi.mocked(boardsService.createBoard).mockResolvedValue(mockBoard)

      const response = await request(app)
        .post('/api/boards')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({
          title: 'Test Board',
          description: 'A test board',
          bgColor: '#0079BF',
        })

      expect(response.status).toBe(201)
      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          id: 'board-123',
          title: 'Test Board',
        }),
      })
    })

    it('should create a board with only title', async () => {
      vi.mocked(boardsService.createBoard).mockResolvedValue({
        ...mockBoard,
        description: null,
      })

      const response = await request(app)
        .post('/api/boards')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ title: 'Test Board' })

      expect(response.status).toBe(201)
      expect(boardsService.createBoard).toHaveBeenCalledWith({ title: 'Test Board' }, 'user-123')
    })
  })

  describe('with invalid data', () => {
    it('should return 400 for missing title', async () => {
      const response = await request(app)
        .post('/api/boards')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ description: 'A board without title' })

      expect(response.status).toBe(400)
      expect(response.body).toMatchObject({
        success: false,
        error: 'Validation failed',
      })
      expect(response.body.details).toHaveProperty('title')
    })

    it('should return 400 for empty title', async () => {
      const response = await request(app)
        .post('/api/boards')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ title: '' })

      expect(response.status).toBe(400)
      expect(response.body.details).toHaveProperty('title')
    })

    it('should return 400 for title exceeding max length', async () => {
      const response = await request(app)
        .post('/api/boards')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ title: 'a'.repeat(101) })

      expect(response.status).toBe(400)
      expect(response.body.details).toHaveProperty('title')
    })

    it('should return 400 for invalid bgColor format', async () => {
      const response = await request(app)
        .post('/api/boards')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ title: 'Test Board', bgColor: 'invalid' })

      expect(response.status).toBe(400)
      expect(response.body.details).toHaveProperty('bgColor')
    })
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app).post('/api/boards').send({ title: 'Test Board' })

    expect(response.status).toBe(401)
  })
})

describe('GET /api/boards/:id', () => {
  const app = createApp()

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret'
    vi.mocked(authService.verifyToken).mockReturnValue({ valid: true, userId: 'user-123' })
    vi.mocked(authService.findUserById).mockResolvedValue(mockUser)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return 200 with board details', async () => {
    vi.mocked(boardsService.findBoardById).mockResolvedValue(mockBoard)

    const response = await request(app)
      .get('/api/boards/board-123')
      .set('Cookie', 'accessToken=valid.jwt.token')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      success: true,
      data: expect.objectContaining({
        id: 'board-123',
        title: 'Test Board',
      }),
    })
  })

  it('should return 404 when board not found', async () => {
    vi.mocked(boardsService.findBoardById).mockResolvedValue(null)

    const response = await request(app)
      .get('/api/boards/nonexistent')
      .set('Cookie', 'accessToken=valid.jwt.token')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      success: false,
      error: 'Board not found',
    })
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app).get('/api/boards/board-123')

    expect(response.status).toBe(401)
  })
})

describe('PATCH /api/boards/:id', () => {
  const app = createApp()

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret'
    vi.mocked(authService.verifyToken).mockReturnValue({ valid: true, userId: 'user-123' })
    vi.mocked(authService.findUserById).mockResolvedValue(mockUser)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('with valid data', () => {
    it('should update board title and return 200', async () => {
      const updatedBoard = { ...mockBoard, title: 'Updated Title' }
      vi.mocked(boardsService.updateBoard).mockResolvedValue(updatedBoard)

      const response = await request(app)
        .patch('/api/boards/board-123')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ title: 'Updated Title' })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          title: 'Updated Title',
        }),
      })
    })

    it('should update board description', async () => {
      const updatedBoard = { ...mockBoard, description: 'New description' }
      vi.mocked(boardsService.updateBoard).mockResolvedValue(updatedBoard)

      const response = await request(app)
        .patch('/api/boards/board-123')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ description: 'New description' })

      expect(response.status).toBe(200)
      expect(response.body.data.description).toBe('New description')
    })

    it('should update board bgColor', async () => {
      const updatedBoard = { ...mockBoard, bgColor: '#FF5733' }
      vi.mocked(boardsService.updateBoard).mockResolvedValue(updatedBoard)

      const response = await request(app)
        .patch('/api/boards/board-123')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ bgColor: '#FF5733' })

      expect(response.status).toBe(200)
      expect(response.body.data.bgColor).toBe('#FF5733')
    })
  })

  describe('with invalid data', () => {
    it('should return 400 for invalid bgColor format', async () => {
      const response = await request(app)
        .patch('/api/boards/board-123')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ bgColor: 'not-a-color' })

      expect(response.status).toBe(400)
      expect(response.body.details).toHaveProperty('bgColor')
    })

    it('should return 400 for title exceeding max length', async () => {
      const response = await request(app)
        .patch('/api/boards/board-123')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ title: 'a'.repeat(101) })

      expect(response.status).toBe(400)
      expect(response.body.details).toHaveProperty('title')
    })
  })

  it('should return 404 when board not found or access denied', async () => {
    vi.mocked(boardsService.updateBoard).mockResolvedValue(null)

    const response = await request(app)
      .patch('/api/boards/nonexistent')
      .set('Cookie', 'accessToken=valid.jwt.token')
      .send({ title: 'Updated' })

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      success: false,
      error: 'Board not found or access denied',
    })
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app).patch('/api/boards/board-123').send({ title: 'Updated' })

    expect(response.status).toBe(401)
  })
})

describe('DELETE /api/boards/:id', () => {
  const app = createApp()

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret'
    vi.mocked(authService.verifyToken).mockReturnValue({ valid: true, userId: 'user-123' })
    vi.mocked(authService.findUserById).mockResolvedValue(mockUser)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should delete board and return 200', async () => {
    vi.mocked(boardsService.deleteBoard).mockResolvedValue(true)

    const response = await request(app)
      .delete('/api/boards/board-123')
      .set('Cookie', 'accessToken=valid.jwt.token')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      success: true,
      data: null,
    })
  })

  it('should return 404 when board not found or access denied', async () => {
    vi.mocked(boardsService.deleteBoard).mockResolvedValue(false)

    const response = await request(app)
      .delete('/api/boards/nonexistent')
      .set('Cookie', 'accessToken=valid.jwt.token')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      success: false,
      error: 'Board not found or access denied',
    })
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app).delete('/api/boards/board-123')

    expect(response.status).toBe(401)
  })
})
