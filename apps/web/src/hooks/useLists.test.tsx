import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { useLists } from './useLists'
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

const mockList = {
  id: 'list-123',
  title: 'To Do',
  boardId: 'board-123',
  position: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const mockList2 = {
  id: 'list-456',
  title: 'In Progress',
  boardId: 'board-123',
  position: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

describe('useLists', () => {
  describe('fetching lists', () => {
    it('should fetch lists successfully', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/boards/board-123/lists`, () => {
          return HttpResponse.json({
            success: true,
            data: [mockList, mockList2],
          })
        })
      )

      const { result } = renderHook(() => useLists('board-123'), {
        wrapper: createWrapper(),
      })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.lists).toHaveLength(2)
      expect(result.current.lists[0].title).toBe('To Do')
      expect(result.current.lists[1].title).toBe('In Progress')
    })

    it('should return empty array when no lists exist', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/boards/board-123/lists`, () => {
          return HttpResponse.json({
            success: true,
            data: [],
          })
        })
      )

      const { result } = renderHook(() => useLists('board-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.lists).toHaveLength(0)
    })

    it('should handle fetch error', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/boards/board-123/lists`, () => {
          return HttpResponse.json({ success: false, error: 'Board not found' }, { status: 404 })
        })
      )

      const { result } = renderHook(() => useLists('board-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
      })

      expect(result.current.error?.message).toBe('Board not found')
    })
  })

  describe('creating lists', () => {
    it('should create a list successfully', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/boards/board-123/lists`, () => {
          return HttpResponse.json({ success: true, data: [] })
        }),
        http.post(`${API_BASE_URL}/api/boards/board-123/lists`, () => {
          return HttpResponse.json({
            success: true,
            data: mockList,
          })
        })
      )

      const { result } = renderHook(() => useLists('board-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.createList({ title: 'To Do' })
      })

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false)
      })

      expect(result.current.lists).toContainEqual(expect.objectContaining({ id: 'list-123' }))
    })

    it('should handle create error', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/boards/board-123/lists`, () => {
          return HttpResponse.json({ success: true, data: [] })
        }),
        http.post(`${API_BASE_URL}/api/boards/board-123/lists`, () => {
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

      const { result } = renderHook(() => useLists('board-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.createList({ title: '' })
      })

      await waitFor(() => {
        expect(result.current.createError).toBeTruthy()
      })

      expect(result.current.createError?.message).toBe('Validation failed')
    })

    it('should reset create error', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/boards/board-123/lists`, () => {
          return HttpResponse.json({ success: true, data: [] })
        }),
        http.post(`${API_BASE_URL}/api/boards/board-123/lists`, () => {
          return HttpResponse.json({ success: false, error: 'Failed' }, { status: 400 })
        })
      )

      const { result } = renderHook(() => useLists('board-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.createList({ title: '' })
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

  describe('updating lists', () => {
    it('should update a list successfully', async () => {
      const updatedList = { ...mockList, title: 'Done' }

      server.use(
        http.get(`${API_BASE_URL}/api/boards/board-123/lists`, () => {
          return HttpResponse.json({ success: true, data: [mockList] })
        }),
        http.patch(`${API_BASE_URL}/api/lists/list-123`, () => {
          return HttpResponse.json({
            success: true,
            data: updatedList,
          })
        })
      )

      const { result } = renderHook(() => useLists('board-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.updateList({ listId: 'list-123', data: { title: 'Done' } })
      })

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false)
      })

      expect(result.current.lists[0].title).toBe('Done')
    })

    it('should handle update error', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/boards/board-123/lists`, () => {
          return HttpResponse.json({ success: true, data: [mockList] })
        }),
        http.patch(`${API_BASE_URL}/api/lists/list-123`, () => {
          return HttpResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
        })
      )

      const { result } = renderHook(() => useLists('board-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.updateList({ listId: 'list-123', data: { title: 'Done' } })
      })

      await waitFor(() => {
        expect(result.current.updateError).toBeTruthy()
      })

      expect(result.current.updateError?.message).toBe('Access denied')
    })
  })

  describe('deleting lists', () => {
    it('should delete a list successfully', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/boards/board-123/lists`, () => {
          return HttpResponse.json({ success: true, data: [mockList, mockList2] })
        }),
        http.delete(`${API_BASE_URL}/api/lists/list-123`, () => {
          return HttpResponse.json({ success: true, data: null })
        })
      )

      const { result } = renderHook(() => useLists('board-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.lists).toHaveLength(2)

      act(() => {
        result.current.deleteList('list-123')
      })

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false)
      })

      expect(result.current.lists).toHaveLength(1)
      expect(result.current.lists[0].id).toBe('list-456')
    })

    it('should handle delete error', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/boards/board-123/lists`, () => {
          return HttpResponse.json({ success: true, data: [mockList] })
        }),
        http.delete(`${API_BASE_URL}/api/lists/list-123`, () => {
          return HttpResponse.json({ success: false, error: 'Cannot delete list' }, { status: 403 })
        })
      )

      const { result } = renderHook(() => useLists('board-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.deleteList('list-123')
      })

      await waitFor(() => {
        expect(result.current.deleteError).toBeTruthy()
      })

      expect(result.current.deleteError?.message).toBe('Cannot delete list')
    })
  })

  describe('reordering lists', () => {
    it('should reorder lists successfully', async () => {
      const reorderedLists = [
        { ...mockList2, position: 0 },
        { ...mockList, position: 1 },
      ]

      server.use(
        http.get(`${API_BASE_URL}/api/boards/board-123/lists`, () => {
          return HttpResponse.json({ success: true, data: [mockList, mockList2] })
        }),
        http.patch(`${API_BASE_URL}/api/boards/board-123/lists/reorder`, () => {
          return HttpResponse.json({
            success: true,
            data: reorderedLists,
          })
        })
      )

      const { result } = renderHook(() => useLists('board-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.reorderLists({ listIds: ['list-456', 'list-123'] })
      })

      await waitFor(() => {
        expect(result.current.isReordering).toBe(false)
      })

      expect(result.current.lists[0].id).toBe('list-456')
      expect(result.current.lists[1].id).toBe('list-123')
    })
  })
})
