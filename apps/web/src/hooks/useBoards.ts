import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Board, List, Card } from '@hello/types'
import type { CreateBoardInput, UpdateBoardInput } from '@hello/validation'
import { fetcher, ApiError } from '../lib/api'
import { LIST_KEYS } from './useLists'
import { CARD_KEYS } from './useCards'

const BOARD_KEYS = {
  all: ['boards'] as const,
  detail: (id: string) => ['boards', id] as const,
}

export function useBoards() {
  const queryClient = useQueryClient()

  const {
    data: boards,
    isLoading,
    error,
  } = useQuery({
    queryKey: BOARD_KEYS.all,
    queryFn: () => fetcher<Board[]>('/api/boards'),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateBoardInput) =>
      fetcher<Board>('/api/boards', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (newBoard) => {
      queryClient.setQueryData<Board[]>(BOARD_KEYS.all, (old) =>
        old ? [newBoard, ...old] : [newBoard]
      )
    },
  })

  return {
    boards: boards ?? [],
    isLoading,
    error: error as ApiError | null,

    createBoard: createMutation.mutate,
    createBoardAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error as ApiError | null,
    resetCreateError: createMutation.reset,
  }
}

export function useBoard(boardId: string) {
  const queryClient = useQueryClient()

  const {
    data: board,
    isLoading,
    error,
  } = useQuery({
    queryKey: BOARD_KEYS.detail(boardId),
    queryFn: async () => {
      const boardData = await fetcher<Board>(`/api/boards/${boardId}`)

      // Pre-populate lists and cards caches from nested data
      if (boardData.lists) {
        // Set lists cache (without cards to match expected type)
        const listsWithoutCards: List[] = boardData.lists.map(({ cards: _cards, ...list }) => list)
        queryClient.setQueryData(LIST_KEYS.byBoard(boardId), listsWithoutCards)

        // Set cards cache for each list
        boardData.lists.forEach((list) => {
          if (list.cards) {
            queryClient.setQueryData<Card[]>(CARD_KEYS.byList(list.id), list.cards)
          }
        })
      }

      return boardData
    },
    enabled: !!boardId,
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateBoardInput) =>
      fetcher<Board>(`/api/boards/${boardId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: (updatedBoard) => {
      queryClient.setQueryData<Board>(BOARD_KEYS.detail(boardId), updatedBoard)
      queryClient.setQueryData<Board[]>(BOARD_KEYS.all, (old) =>
        old ? old.map((b) => (b.id === boardId ? updatedBoard : b)) : old
      )
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () =>
      fetcher<null>(`/api/boards/${boardId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: BOARD_KEYS.detail(boardId) })
      queryClient.setQueryData<Board[]>(BOARD_KEYS.all, (old) =>
        old ? old.filter((b) => b.id !== boardId) : old
      )
    },
  })

  return {
    board,
    isLoading,
    error: error as ApiError | null,

    updateBoard: updateMutation.mutate,
    updateBoardAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error as ApiError | null,
    resetUpdateError: updateMutation.reset,

    deleteBoard: deleteMutation.mutate,
    deleteBoardAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error as ApiError | null,
  }
}
