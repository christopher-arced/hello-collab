import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../app'
import * as listsService from '../services/lists.service'
import * as authService from '../services/auth.service'

vi.mock('../services/lists.service')
vi.mock('../services/auth.service')
vi.mock('@hello/database', () => ({
  prisma: {
    list: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      aggregate: vi.fn(),
    },
    board: {
      findFirst: vi.fn(),
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

const mockList = {
  id: 'list-123',
  title: 'To Do',
  boardId: 'board-123',
  position: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockList2 = {
  id: 'list-456',
  title: 'In Progress',
  boardId: 'board-123',
  position: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('GET /api/boards/:boardId/lists', () => {
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

  it('should return 200 with list of lists', async () => {
    vi.mocked(listsService.getListsByBoard).mockResolvedValue([mockList, mockList2])

    const response = await request(app)
      .get('/api/boards/board-123/lists')
      .set('Cookie', 'accessToken=valid.jwt.token')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      success: true,
      data: expect.arrayContaining([
        expect.objectContaining({ id: 'list-123', title: 'To Do' }),
        expect.objectContaining({ id: 'list-456', title: 'In Progress' }),
      ]),
    })
  })

  it('should return empty array when board has no lists', async () => {
    vi.mocked(listsService.getListsByBoard).mockResolvedValue([])

    const response = await request(app)
      .get('/api/boards/board-123/lists')
      .set('Cookie', 'accessToken=valid.jwt.token')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      success: true,
      data: [],
    })
  })

  it('should return 404 when board not found or access denied', async () => {
    vi.mocked(listsService.getListsByBoard).mockResolvedValue(null)

    const response = await request(app)
      .get('/api/boards/nonexistent/lists')
      .set('Cookie', 'accessToken=valid.jwt.token')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      success: false,
      error: 'Board not found or access denied',
    })
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app).get('/api/boards/board-123/lists')

    expect(response.status).toBe(401)
  })
})

describe('POST /api/boards/:boardId/lists', () => {
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
    it('should create a list and return 201', async () => {
      vi.mocked(listsService.createList).mockResolvedValue(mockList)

      const response = await request(app)
        .post('/api/boards/board-123/lists')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ title: 'To Do' })

      expect(response.status).toBe(201)
      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          id: 'list-123',
          title: 'To Do',
        }),
      })
    })

    it('should create a list with position', async () => {
      vi.mocked(listsService.createList).mockResolvedValue({ ...mockList, position: 5 })

      const response = await request(app)
        .post('/api/boards/board-123/lists')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ title: 'To Do', position: 5 })

      expect(response.status).toBe(201)
      expect(listsService.createList).toHaveBeenCalledWith('board-123', 'user-123', {
        title: 'To Do',
        position: 5,
      })
    })
  })

  describe('with invalid data', () => {
    it('should return 400 for missing title', async () => {
      const response = await request(app)
        .post('/api/boards/board-123/lists')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({})

      expect(response.status).toBe(400)
      expect(response.body).toMatchObject({
        success: false,
        error: 'Validation failed',
      })
      expect(response.body.details).toHaveProperty('title')
    })

    it('should return 400 for empty title', async () => {
      const response = await request(app)
        .post('/api/boards/board-123/lists')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ title: '' })

      expect(response.status).toBe(400)
      expect(response.body.details).toHaveProperty('title')
    })

    it('should return 400 for title exceeding max length', async () => {
      const response = await request(app)
        .post('/api/boards/board-123/lists')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ title: 'a'.repeat(513) })

      expect(response.status).toBe(400)
      expect(response.body.details).toHaveProperty('title')
    })

    it('should return 400 for negative position', async () => {
      const response = await request(app)
        .post('/api/boards/board-123/lists')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ title: 'To Do', position: -1 })

      expect(response.status).toBe(400)
      expect(response.body.details).toHaveProperty('position')
    })
  })

  it('should return 404 when board not found or access denied', async () => {
    vi.mocked(listsService.createList).mockResolvedValue(null)

    const response = await request(app)
      .post('/api/boards/nonexistent/lists')
      .set('Cookie', 'accessToken=valid.jwt.token')
      .send({ title: 'To Do' })

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      success: false,
      error: 'Board not found or access denied',
    })
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app).post('/api/boards/board-123/lists').send({ title: 'To Do' })

    expect(response.status).toBe(401)
  })
})

describe('PATCH /api/lists/:id', () => {
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
    it('should update list title and return 200', async () => {
      const updatedList = { ...mockList, title: 'Done' }
      vi.mocked(listsService.updateList).mockResolvedValue(updatedList)

      const response = await request(app)
        .patch('/api/lists/list-123')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ title: 'Done' })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({ title: 'Done' }),
      })
    })

    it('should update list position', async () => {
      const updatedList = { ...mockList, position: 3 }
      vi.mocked(listsService.updateList).mockResolvedValue(updatedList)

      const response = await request(app)
        .patch('/api/lists/list-123')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ position: 3 })

      expect(response.status).toBe(200)
      expect(response.body.data.position).toBe(3)
    })
  })

  describe('with invalid data', () => {
    it('should return 400 for empty title', async () => {
      const response = await request(app)
        .patch('/api/lists/list-123')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ title: '' })

      expect(response.status).toBe(400)
      expect(response.body.details).toHaveProperty('title')
    })

    it('should return 400 for title exceeding max length', async () => {
      const response = await request(app)
        .patch('/api/lists/list-123')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ title: 'a'.repeat(513) })

      expect(response.status).toBe(400)
      expect(response.body.details).toHaveProperty('title')
    })

    it('should return 400 for negative position', async () => {
      const response = await request(app)
        .patch('/api/lists/list-123')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ position: -1 })

      expect(response.status).toBe(400)
      expect(response.body.details).toHaveProperty('position')
    })
  })

  it('should return 404 when list not found or access denied', async () => {
    vi.mocked(listsService.updateList).mockResolvedValue(null)

    const response = await request(app)
      .patch('/api/lists/nonexistent')
      .set('Cookie', 'accessToken=valid.jwt.token')
      .send({ title: 'Updated' })

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      success: false,
      error: 'List not found or access denied',
    })
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app).patch('/api/lists/list-123').send({ title: 'Updated' })

    expect(response.status).toBe(401)
  })
})

describe('DELETE /api/lists/:id', () => {
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

  it('should delete list and return 200', async () => {
    vi.mocked(listsService.deleteList).mockResolvedValue(true)

    const response = await request(app)
      .delete('/api/lists/list-123')
      .set('Cookie', 'accessToken=valid.jwt.token')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      success: true,
      data: null,
    })
  })

  it('should return 404 when list not found or access denied', async () => {
    vi.mocked(listsService.deleteList).mockResolvedValue(false)

    const response = await request(app)
      .delete('/api/lists/nonexistent')
      .set('Cookie', 'accessToken=valid.jwt.token')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      success: false,
      error: 'List not found or access denied',
    })
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app).delete('/api/lists/list-123')

    expect(response.status).toBe(401)
  })
})

describe('PATCH /api/boards/:boardId/lists/reorder', () => {
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

  it('should reorder lists and return 200', async () => {
    const reorderedLists = [
      { ...mockList2, position: 0 },
      { ...mockList, position: 1 },
    ]
    vi.mocked(listsService.reorderLists).mockResolvedValue(reorderedLists)

    const response = await request(app)
      .patch('/api/boards/board-123/lists/reorder')
      .set('Cookie', 'accessToken=valid.jwt.token')
      .send({ listIds: ['list-456', 'list-123'] })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      success: true,
      data: expect.arrayContaining([
        expect.objectContaining({ id: 'list-456', position: 0 }),
        expect.objectContaining({ id: 'list-123', position: 1 }),
      ]),
    })
  })

  it('should return 400 for invalid listIds format', async () => {
    const response = await request(app)
      .patch('/api/boards/board-123/lists/reorder')
      .set('Cookie', 'accessToken=valid.jwt.token')
      .send({ listIds: 'not-an-array' })

    expect(response.status).toBe(400)
    expect(response.body).toMatchObject({
      success: false,
      error: 'Validation failed',
    })
  })

  it('should return 400 for missing listIds', async () => {
    const response = await request(app)
      .patch('/api/boards/board-123/lists/reorder')
      .set('Cookie', 'accessToken=valid.jwt.token')
      .send({})

    expect(response.status).toBe(400)
    expect(response.body.details).toHaveProperty('listIds')
  })

  it('should return 404 when board not found or invalid list IDs', async () => {
    vi.mocked(listsService.reorderLists).mockResolvedValue(null)

    const response = await request(app)
      .patch('/api/boards/board-123/lists/reorder')
      .set('Cookie', 'accessToken=valid.jwt.token')
      .send({ listIds: ['invalid-id'] })

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      success: false,
      error: 'Board not found, access denied, or invalid list IDs',
    })
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app)
      .patch('/api/boards/board-123/lists/reorder')
      .send({ listIds: ['list-123'] })

    expect(response.status).toBe(401)
  })
})
