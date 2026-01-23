import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { useCards } from './useCards'
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

const mockCard = {
  id: 'card-123',
  title: 'Test Card',
  description: null,
  listId: 'list-123',
  position: 0,
  dueDate: null,
  coverUrl: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const mockCard2 = {
  id: 'card-456',
  title: 'Second Card',
  description: 'Description',
  listId: 'list-123',
  position: 1,
  dueDate: null,
  coverUrl: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

describe('useCards', () => {
  describe('fetching cards', () => {
    it('should fetch cards successfully', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/lists/list-123/cards`, () => {
          return HttpResponse.json({
            success: true,
            data: [mockCard, mockCard2],
          })
        })
      )

      const { result } = renderHook(() => useCards('list-123'), {
        wrapper: createWrapper(),
      })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.cards).toHaveLength(2)
      expect(result.current.cards[0].title).toBe('Test Card')
      expect(result.current.cards[1].title).toBe('Second Card')
    })

    it('should return empty array when no cards exist', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/lists/list-123/cards`, () => {
          return HttpResponse.json({
            success: true,
            data: [],
          })
        })
      )

      const { result } = renderHook(() => useCards('list-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.cards).toHaveLength(0)
    })

    it('should handle fetch error', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/lists/list-123/cards`, () => {
          return HttpResponse.json({ success: false, error: 'List not found' }, { status: 404 })
        })
      )

      const { result } = renderHook(() => useCards('list-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
      })

      expect(result.current.error?.message).toBe('List not found')
    })

    it('should not fetch when listId is empty', async () => {
      const { result } = renderHook(() => useCards(''), {
        wrapper: createWrapper(),
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.cards).toHaveLength(0)
    })
  })

  describe('creating cards', () => {
    it('should create a card successfully', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/lists/list-123/cards`, () => {
          return HttpResponse.json({ success: true, data: [] })
        }),
        http.post(`${API_BASE_URL}/api/lists/list-123/cards`, () => {
          return HttpResponse.json({
            success: true,
            data: mockCard,
          })
        })
      )

      const { result } = renderHook(() => useCards('list-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.createCard({ title: 'Test Card' })
      })

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false)
      })

      expect(result.current.cards).toContainEqual(expect.objectContaining({ id: 'card-123' }))
    })

    it('should apply optimistic update when creating', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/lists/list-123/cards`, () => {
          return HttpResponse.json({ success: true, data: [] })
        }),
        http.post(`${API_BASE_URL}/api/lists/list-123/cards`, async () => {
          await new Promise((resolve) => setTimeout(resolve, 100))
          return HttpResponse.json({
            success: true,
            data: mockCard,
          })
        })
      )

      const { result } = renderHook(() => useCards('list-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.createCard({ title: 'Test Card' })
      })

      // Check optimistic update was applied
      await waitFor(() => {
        expect(result.current.cards).toHaveLength(1)
        expect(result.current.cards[0].id).toMatch(/^temp-/)
      })

      // Wait for actual response
      await waitFor(() => {
        expect(result.current.cards[0].id).toBe('card-123')
      })
    })

    it('should rollback on create error', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/lists/list-123/cards`, () => {
          return HttpResponse.json({ success: true, data: [] })
        }),
        http.post(`${API_BASE_URL}/api/lists/list-123/cards`, () => {
          return HttpResponse.json(
            { success: false, error: 'Failed to create card' },
            { status: 400 }
          )
        })
      )

      const { result } = renderHook(() => useCards('list-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.createCard({ title: 'Test Card' })
      })

      await waitFor(() => {
        expect(result.current.createError).toBeTruthy()
      })

      expect(result.current.cards).toHaveLength(0)
    })

    it('should reset create error', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/lists/list-123/cards`, () => {
          return HttpResponse.json({ success: true, data: [] })
        }),
        http.post(`${API_BASE_URL}/api/lists/list-123/cards`, () => {
          return HttpResponse.json({ success: false, error: 'Failed' }, { status: 400 })
        })
      )

      const { result } = renderHook(() => useCards('list-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.createCard({ title: 'Test' })
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

  describe('updating cards', () => {
    it('should update a card successfully', async () => {
      const updatedCard = { ...mockCard, title: 'Updated Title' }

      server.use(
        http.get(`${API_BASE_URL}/api/lists/list-123/cards`, () => {
          return HttpResponse.json({ success: true, data: [mockCard] })
        }),
        http.patch(`${API_BASE_URL}/api/cards/card-123`, () => {
          return HttpResponse.json({
            success: true,
            data: updatedCard,
          })
        })
      )

      const { result } = renderHook(() => useCards('list-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.updateCard({ cardId: 'card-123', data: { title: 'Updated Title' } })
      })

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false)
      })

      expect(result.current.cards[0].title).toBe('Updated Title')
    })

    it('should handle update error', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/lists/list-123/cards`, () => {
          return HttpResponse.json({ success: true, data: [mockCard] })
        }),
        http.patch(`${API_BASE_URL}/api/cards/card-123`, () => {
          return HttpResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
        })
      )

      const { result } = renderHook(() => useCards('list-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.updateCard({ cardId: 'card-123', data: { title: 'Updated' } })
      })

      await waitFor(() => {
        expect(result.current.updateError).toBeTruthy()
      })

      expect(result.current.updateError?.message).toBe('Access denied')
    })
  })

  describe('deleting cards', () => {
    it('should delete a card successfully', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/lists/list-123/cards`, () => {
          return HttpResponse.json({ success: true, data: [mockCard, mockCard2] })
        }),
        http.delete(`${API_BASE_URL}/api/cards/card-123`, () => {
          return HttpResponse.json({ success: true, data: null })
        })
      )

      const { result } = renderHook(() => useCards('list-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.cards).toHaveLength(2)

      act(() => {
        result.current.deleteCard('card-123')
      })

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false)
      })

      expect(result.current.cards).toHaveLength(1)
      expect(result.current.cards[0].id).toBe('card-456')
    })

    it('should apply optimistic delete', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/lists/list-123/cards`, () => {
          return HttpResponse.json({ success: true, data: [mockCard] })
        }),
        http.delete(`${API_BASE_URL}/api/cards/card-123`, async () => {
          await new Promise((resolve) => setTimeout(resolve, 100))
          return HttpResponse.json({ success: true, data: null })
        })
      )

      const { result } = renderHook(() => useCards('list-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.deleteCard('card-123')
      })

      // Optimistic update should remove immediately
      await waitFor(() => {
        expect(result.current.cards).toHaveLength(0)
      })
    })

    it('should rollback on delete error', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/lists/list-123/cards`, () => {
          return HttpResponse.json({ success: true, data: [mockCard] })
        }),
        http.delete(`${API_BASE_URL}/api/cards/card-123`, () => {
          return HttpResponse.json({ success: false, error: 'Cannot delete' }, { status: 403 })
        })
      )

      const { result } = renderHook(() => useCards('list-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.deleteCard('card-123')
      })

      await waitFor(() => {
        expect(result.current.deleteError).toBeTruthy()
      })

      // Card should be restored after error
      expect(result.current.cards).toHaveLength(1)
    })
  })

  describe('moving cards', () => {
    it('should move a card successfully', async () => {
      const movedCard = { ...mockCard, listId: 'list-456', position: 0 }

      server.use(
        http.get(`${API_BASE_URL}/api/lists/list-123/cards`, () => {
          return HttpResponse.json({ success: true, data: [mockCard] })
        }),
        http.patch(`${API_BASE_URL}/api/cards/card-123/move`, () => {
          return HttpResponse.json({
            success: true,
            data: movedCard,
          })
        })
      )

      const { result } = renderHook(() => useCards('list-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.moveCard({ cardId: 'card-123', data: { toListId: 'list-456', position: 0 } })
      })

      await waitFor(() => {
        expect(result.current.isMoving).toBe(false)
      })

      // Card should be removed from current list
      expect(result.current.cards).toHaveLength(0)
    })

    it('should handle move error', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/lists/list-123/cards`, () => {
          return HttpResponse.json({ success: true, data: [mockCard] })
        }),
        http.patch(`${API_BASE_URL}/api/cards/card-123/move`, () => {
          return HttpResponse.json(
            { success: false, error: 'Cannot move to different board' },
            { status: 400 }
          )
        })
      )

      const { result } = renderHook(() => useCards('list-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.moveCard({ cardId: 'card-123', data: { toListId: 'list-999', position: 0 } })
      })

      await waitFor(() => {
        expect(result.current.moveError).toBeTruthy()
      })

      expect(result.current.moveError?.message).toBe('Cannot move to different board')
    })
  })

  describe('reordering cards', () => {
    it('should reorder cards successfully', async () => {
      const reorderedCards = [
        { ...mockCard2, position: 0 },
        { ...mockCard, position: 1 },
      ]

      server.use(
        http.get(`${API_BASE_URL}/api/lists/list-123/cards`, () => {
          return HttpResponse.json({ success: true, data: [mockCard, mockCard2] })
        }),
        http.patch(`${API_BASE_URL}/api/lists/list-123/cards/reorder`, () => {
          return HttpResponse.json({
            success: true,
            data: reorderedCards,
          })
        })
      )

      const { result } = renderHook(() => useCards('list-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.reorderCards({ cardIds: ['card-456', 'card-123'] })
      })

      await waitFor(() => {
        expect(result.current.isReordering).toBe(false)
      })

      expect(result.current.cards[0].id).toBe('card-456')
      expect(result.current.cards[1].id).toBe('card-123')
    })
  })
})
