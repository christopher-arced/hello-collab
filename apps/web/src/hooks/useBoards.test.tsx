import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { useBoards, useBoard } from './useBoards'
import { API_BASE_URL } from '../lib/api'

const server = setupServer()

beforeEach(() => {
  server.listen({ onUnhandledRequest: 'warn' })
  vi.clearAllMocks()
})

afterEach(() => {
  server.resetHandlers()
})

afterEach(() => {
  server.close()
})

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  )
}

const mockBoard = {
  id: 'board-123',
  title: 'Test Board',
  description: 'A test board',
  bgColor: '#0079BF',
  ownerId: 'user-123',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const mockBoard2 = {
  id: 'board-456',
  title: 'Another Board',
  description: null,
  bgColor: '#6366f1',
  ownerId: 'user-123',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

describe('useBoards', () => {
  describe('fetching boards', () => {
    it('should fetch boards successfully', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/boards`, () => {
          return HttpResponse.json({
            success: true,
            data: [mockBoard, mockBoard2],
          })
        })
      )

      const { result } = renderHook(() => useBoards(), {
        wrapper: createWrapper(),
      })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.boards).toHaveLength(2)
      expect(result.current.boards[0].title).toBe('Test Board')
    })

    it('should return empty array when no boards exist', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/boards`, () => {
          return HttpResponse.json({
            success: true,
            data: [],
          })
        })
      )

      const { result } = renderHook(() => useBoards(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.boards).toHaveLength(0)
    })

    it('should handle fetch error', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/boards`, () => {
          return HttpResponse.json(
            { success: false, error: 'Failed to fetch boards' },
            { status: 500 }
          )
        })
      )

      const { result } = renderHook(() => useBoards(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
      })

      expect(result.current.error?.message).toBe('Failed to fetch boards')
    })
  })

  describe('creating boards', () => {
    it('should create a board successfully', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/boards`, () => {
          return HttpResponse.json({ success: true, data: [] })
        }),
        http.post(`${API_BASE_URL}/api/boards`, () => {
          return HttpResponse.json({
            success: true,
            data: mockBoard,
          })
        })
      )

      const { result } = renderHook(() => useBoards(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.createBoard({
          title: 'Test Board',
          description: 'A test board',
          bgColor: '#0079BF',
        })
      })

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false)
      })

      // Board should be added to the list
      expect(result.current.boards).toContainEqual(expect.objectContaining({ id: 'board-123' }))
    })

    it('should handle create error', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/boards`, () => {
          return HttpResponse.json({ success: true, data: [] })
        }),
        http.post(`${API_BASE_URL}/api/boards`, () => {
          return HttpResponse.json(
            {
              success: false,
              error: 'Validation failed',
              details: { title: ['Title is required'] },
            },
            { status: 400 }
          )
        })
      )

      const { result } = renderHook(() => useBoards(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.createBoard({ title: '' })
      })

      await waitFor(() => {
        expect(result.current.createError).toBeTruthy()
      })

      expect(result.current.createError?.message).toBe('Validation failed')
    })

    it('should reset create error', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/boards`, () => {
          return HttpResponse.json({ success: true, data: [] })
        }),
        http.post(`${API_BASE_URL}/api/boards`, () => {
          return HttpResponse.json({ success: false, error: 'Failed' }, { status: 400 })
        })
      )

      const { result } = renderHook(() => useBoards(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.createBoard({ title: '' })
      })

      await waitFor(() => {
        expect(result.current.createError).toBeTruthy()
      })

      act(() => {
        result.current.resetCreateError()
      })

      await waitFor(() => {
        expect(result.current.createError).toBeNull()
      })
    })
  })
})

describe('useBoard', () => {
  describe('fetching single board', () => {
    it('should fetch board by id', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/boards/board-123`, () => {
          return HttpResponse.json({
            success: true,
            data: mockBoard,
          })
        })
      )

      const { result } = renderHook(() => useBoard('board-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.board?.title).toBe('Test Board')
    })

    it('should handle board not found', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/boards/nonexistent`, () => {
          return HttpResponse.json({ success: false, error: 'Board not found' }, { status: 404 })
        })
      )

      const { result } = renderHook(() => useBoard('nonexistent'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
      })

      expect(result.current.error?.message).toBe('Board not found')
    })
  })

  describe('updating board', () => {
    it('should update board successfully', async () => {
      const updatedBoard = { ...mockBoard, title: 'Updated Title' }

      server.use(
        http.get(`${API_BASE_URL}/api/boards/board-123`, () => {
          return HttpResponse.json({ success: true, data: mockBoard })
        }),
        http.patch(`${API_BASE_URL}/api/boards/board-123`, () => {
          return HttpResponse.json({
            success: true,
            data: updatedBoard,
          })
        })
      )

      const { result } = renderHook(() => useBoard('board-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.updateBoard({ title: 'Updated Title' })
      })

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false)
      })

      expect(result.current.board?.title).toBe('Updated Title')
    })

    it('should handle update error', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/boards/board-123`, () => {
          return HttpResponse.json({ success: true, data: mockBoard })
        }),
        http.patch(`${API_BASE_URL}/api/boards/board-123`, () => {
          return HttpResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
        })
      )

      const { result } = renderHook(() => useBoard('board-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.updateBoard({ title: 'Updated' })
      })

      await waitFor(() => {
        expect(result.current.updateError).toBeTruthy()
      })

      expect(result.current.updateError?.message).toBe('Access denied')
    })
  })

  describe('deleting board', () => {
    it('should delete board successfully', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/boards/board-123`, () => {
          return HttpResponse.json({ success: true, data: mockBoard })
        }),
        http.delete(`${API_BASE_URL}/api/boards/board-123`, () => {
          return HttpResponse.json({ success: true, data: null })
        })
      )

      const { result } = renderHook(() => useBoard('board-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.deleteBoard()
      })

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false)
      })
    })

    it('should handle delete error', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/boards/board-123`, () => {
          return HttpResponse.json({ success: true, data: mockBoard })
        }),
        http.delete(`${API_BASE_URL}/api/boards/board-123`, () => {
          return HttpResponse.json(
            { success: false, error: 'Cannot delete board' },
            { status: 403 }
          )
        })
      )

      const { result } = renderHook(() => useBoard('board-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.deleteBoard()
      })

      await waitFor(() => {
        expect(result.current.deleteError).toBeTruthy()
      })

      expect(result.current.deleteError?.message).toBe('Cannot delete board')
    })
  })
})
