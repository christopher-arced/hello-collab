import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Card } from '@hello/types'
import type {
  CreateCardInput,
  UpdateCardInput,
  MoveCardInput,
  ReorderCardsInput,
} from '@hello/validation'
import { fetcher, ApiError } from '../lib/api'

export const CARD_KEYS = {
  byList: (listId: string) => ['cards', listId] as const,
}

export function useCards(listId: string) {
  const queryClient = useQueryClient()

  const {
    data: cards,
    isLoading,
    error,
  } = useQuery({
    queryKey: CARD_KEYS.byList(listId),
    queryFn: () => fetcher<Card[]>(`/api/lists/${listId}/cards`),
    enabled: !!listId,
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateCardInput) =>
      fetcher<Card>(`/api/lists/${listId}/cards`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: CARD_KEYS.byList(listId) })
      const previous = queryClient.getQueryData<Card[]>(CARD_KEYS.byList(listId))
      const tempCard: Card = {
        id: `temp-${Date.now()}`,
        title: data.title.trim(),
        description: data.description?.trim() ?? null,
        listId,
        position: previous?.length ?? 0,
        dueDate: null,
        coverUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      queryClient.setQueryData<Card[]>(CARD_KEYS.byList(listId), (old) =>
        old ? [...old, tempCard] : [tempCard]
      )
      return { previous, tempId: tempCard.id }
    },
    onSuccess: (newCard, _, context) => {
      queryClient.setQueryData<Card[]>(CARD_KEYS.byList(listId), (old) =>
        old ? old.map((c) => (c.id === context?.tempId ? newCard : c)) : [newCard]
      )
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(CARD_KEYS.byList(listId), context.previous)
      }
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ cardId, data }: { cardId: string; data: UpdateCardInput }) =>
      fetcher<Card>(`/api/cards/${cardId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: (updatedCard) => {
      queryClient.setQueryData<Card[]>(CARD_KEYS.byList(listId), (old) =>
        old ? old.map((c) => (c.id === updatedCard.id ? updatedCard : c)) : old
      )
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (cardId: string) =>
      fetcher<null>(`/api/cards/${cardId}`, {
        method: 'DELETE',
      }),
    onMutate: async (cardId) => {
      await queryClient.cancelQueries({ queryKey: CARD_KEYS.byList(listId) })
      const previous = queryClient.getQueryData<Card[]>(CARD_KEYS.byList(listId))
      queryClient.setQueryData<Card[]>(CARD_KEYS.byList(listId), (old) =>
        old ? old.filter((c) => c.id !== cardId) : old
      )
      return { previous }
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(CARD_KEYS.byList(listId), context.previous)
      }
    },
  })

  const moveMutation = useMutation({
    mutationFn: ({ cardId, data }: { cardId: string; data: MoveCardInput }) =>
      fetcher<Card>(`/api/cards/${cardId}/move`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onMutate: async ({ cardId, data }) => {
      await queryClient.cancelQueries({ queryKey: CARD_KEYS.byList(listId) })
      await queryClient.cancelQueries({ queryKey: CARD_KEYS.byList(data.toListId) })

      const previousSource = queryClient.getQueryData<Card[]>(CARD_KEYS.byList(listId))
      const previousTarget = queryClient.getQueryData<Card[]>(CARD_KEYS.byList(data.toListId))

      const movingCard = previousSource?.find((c) => c.id === cardId)
      if (movingCard) {
        // Remove from source list
        queryClient.setQueryData<Card[]>(CARD_KEYS.byList(listId), (old) =>
          old ? old.filter((c) => c.id !== cardId) : old
        )
        // Add to target list at position
        queryClient.setQueryData<Card[]>(CARD_KEYS.byList(data.toListId), (old) => {
          const updated = { ...movingCard, listId: data.toListId, position: data.position }
          if (!old) return [updated]
          const newCards = [...old]
          newCards.splice(data.position, 0, updated)
          return newCards.map((c, i) => ({ ...c, position: i }))
        })
      }

      return { previousSource, previousTarget, toListId: data.toListId }
    },
    onError: (_, __, context) => {
      if (context?.previousSource) {
        queryClient.setQueryData(CARD_KEYS.byList(listId), context.previousSource)
      }
      if (context?.previousTarget && context?.toListId) {
        queryClient.setQueryData(CARD_KEYS.byList(context.toListId), context.previousTarget)
      }
    },
    onSuccess: (movedCard, { data }) => {
      // Ensure final state matches server response
      queryClient.setQueryData<Card[]>(CARD_KEYS.byList(listId), (old) =>
        old ? old.filter((c) => c.id !== movedCard.id) : old
      )
      queryClient.setQueryData<Card[]>(CARD_KEYS.byList(data.toListId), (old) => {
        if (!old) return [movedCard]
        const filtered = old.filter((c) => c.id !== movedCard.id)
        const newCards = [...filtered, movedCard]
        return newCards.sort((a, b) => a.position - b.position)
      })
    },
  })

  const reorderMutation = useMutation({
    mutationFn: (data: ReorderCardsInput) =>
      fetcher<Card[]>(`/api/lists/${listId}/cards/reorder`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: CARD_KEYS.byList(listId) })
      const previous = queryClient.getQueryData<Card[]>(CARD_KEYS.byList(listId))
      queryClient.setQueryData<Card[]>(CARD_KEYS.byList(listId), (old) => {
        if (!old) return old
        const orderMap = new Map(data.cardIds.map((id, index) => [id, index]))
        return [...old].sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0))
      })
      return { previous }
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(CARD_KEYS.byList(listId), context.previous)
      }
    },
    onSuccess: (reorderedCards) => {
      queryClient.setQueryData<Card[]>(CARD_KEYS.byList(listId), reorderedCards)
    },
  })

  return {
    cards: cards ?? [],
    isLoading,
    error: error as ApiError | null,

    createCard: createMutation.mutate,
    createCardAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error as ApiError | null,
    resetCreateError: createMutation.reset,

    updateCard: updateMutation.mutate,
    updateCardAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error as ApiError | null,
    resetUpdateError: updateMutation.reset,

    deleteCard: deleteMutation.mutate,
    deleteCardAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error as ApiError | null,

    moveCard: moveMutation.mutate,
    moveCardAsync: moveMutation.mutateAsync,
    isMoving: moveMutation.isPending,
    moveError: moveMutation.error as ApiError | null,

    reorderCards: reorderMutation.mutate,
    reorderCardsAsync: reorderMutation.mutateAsync,
    isReordering: reorderMutation.isPending,
  }
}
