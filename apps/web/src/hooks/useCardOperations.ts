import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Card } from '@hello/types'
import { CARD_KEYS } from './useCards'
import { fetcher } from '@/lib/api'

export function useCardOperations() {
  const queryClient = useQueryClient()

  const handleReorderCards = useCallback(
    (listId: string, cardIds: string[]) => {
      const cards = queryClient.getQueryData<Card[]>(CARD_KEYS.byList(listId))
      if (!cards || cardIds.length < 2) return

      const [activeId, overId] = cardIds
      const oldIndex = cards.findIndex((c) => c.id === activeId)
      const newIndex = cards.findIndex((c) => c.id === overId)

      if (oldIndex === -1 || newIndex === -1) return

      // Optimistic update
      const newCards = [...cards]
      const [removed] = newCards.splice(oldIndex, 1)
      newCards.splice(newIndex, 0, removed)
      const reorderedIds = newCards.map((c) => c.id)

      queryClient.setQueryData<Card[]>(CARD_KEYS.byList(listId), newCards)

      // API call
      fetcher<Card[]>(`/api/lists/${listId}/cards/reorder`, {
        method: 'PATCH',
        body: JSON.stringify({ cardIds: reorderedIds }),
      })
        .then((serverCards) => {
          queryClient.setQueryData<Card[]>(CARD_KEYS.byList(listId), serverCards)
        })
        .catch(() => {
          queryClient.setQueryData<Card[]>(CARD_KEYS.byList(listId), cards)
        })
    },
    [queryClient]
  )

  const handleMoveCard = useCallback(
    (cardId: string, sourceListId: string, targetListId: string, position: number) => {
      const sourceCards = queryClient.getQueryData<Card[]>(CARD_KEYS.byList(sourceListId))
      const targetCards = queryClient.getQueryData<Card[]>(CARD_KEYS.byList(targetListId)) ?? []

      if (!sourceCards) return

      const cardToMove = sourceCards.find((c) => c.id === cardId)
      if (!cardToMove) return

      // Optimistic update - remove from source
      const newSourceCards = sourceCards.filter((c) => c.id !== cardId)
      queryClient.setQueryData<Card[]>(CARD_KEYS.byList(sourceListId), newSourceCards)

      // Optimistic update - add to target at position
      const newTargetCards = [...targetCards]
      const updatedCard = { ...cardToMove, listId: targetListId, position }
      newTargetCards.splice(position, 0, updatedCard)
      queryClient.setQueryData<Card[]>(
        CARD_KEYS.byList(targetListId),
        newTargetCards.map((c, i) => ({ ...c, position: i }))
      )

      // API call
      fetcher<Card>(`/api/cards/${cardId}/move`, {
        method: 'PATCH',
        body: JSON.stringify({ toListId: targetListId, position }),
      })
        .then((movedCard) => {
          // Ensure final state matches server
          queryClient.setQueryData<Card[]>(CARD_KEYS.byList(sourceListId), (old) =>
            old ? old.filter((c) => c.id !== movedCard.id) : old
          )
          queryClient.setQueryData<Card[]>(CARD_KEYS.byList(targetListId), (old) => {
            if (!old) return [movedCard]
            const filtered = old.filter((c) => c.id !== movedCard.id)
            return [...filtered, movedCard].sort((a, b) => a.position - b.position)
          })
        })
        .catch(() => {
          // Rollback on error
          queryClient.setQueryData<Card[]>(CARD_KEYS.byList(sourceListId), sourceCards)
          queryClient.setQueryData<Card[]>(CARD_KEYS.byList(targetListId), targetCards)
        })
    },
    [queryClient]
  )

  return { handleReorderCards, handleMoveCard }
}
