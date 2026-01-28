import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type {
  Board,
  List,
  Card,
  BoardMember,
  SocketUser,
  ListCreatedEvent,
  ListUpdatedEvent,
  ListDeletedEvent,
  ListReorderedEvent,
  CardCreatedEvent,
  CardUpdatedEvent,
  CardDeletedEvent,
  CardMovedEvent,
  CardReorderedEvent,
  BoardUpdatedEvent,
  BoardDeletedEvent,
  MemberAddedEvent,
  MemberUpdatedEvent,
  MemberRemovedEvent,
  ActiveUsersChangedEvent,
} from '@hello/types'
import { SOCKET_EVENTS } from '@hello/types'
import { useBoardRoom } from './useSocket'
import { LIST_KEYS } from './useLists'
import { CARD_KEYS } from './useCards'
import { MEMBER_KEYS } from './useBoardMembers'

interface UseRealtimeSyncOptions {
  onBoardDeleted?: () => void
  onActiveUsersChange?: (users: SocketUser[]) => void
  onMemberRemoved?: (userId: string) => void
}

export function useRealtimeSync(boardId: string | undefined, options: UseRealtimeSyncOptions = {}) {
  const queryClient = useQueryClient()
  const { socket, isConnected, on } = useBoardRoom(boardId)

  // Use refs to avoid re-running effect when callbacks change
  const onBoardDeletedRef = useRef(options.onBoardDeleted)
  const onActiveUsersChangeRef = useRef(options.onActiveUsersChange)
  const onMemberRemovedRef = useRef(options.onMemberRemoved)

  // Keep refs updated
  useEffect(() => {
    onBoardDeletedRef.current = options.onBoardDeleted
    onActiveUsersChangeRef.current = options.onActiveUsersChange
    onMemberRemovedRef.current = options.onMemberRemoved
  })

  useEffect(() => {
    if (!socket || !isConnected || !boardId) return

    // List events
    const unsubListCreated = on<ListCreatedEvent>(SOCKET_EVENTS.LIST_CREATED, (data) => {
      queryClient.setQueryData<List[]>(LIST_KEYS.byBoard(boardId), (old) => {
        if (!old) return [data.list]
        // Avoid duplicates - mutation onSuccess may have already added this list
        const exists = old.some((l) => l.id === data.list.id)
        if (exists) return old
        return [...old, data.list].sort((a, b) => a.position - b.position)
      })
    })

    const unsubListUpdated = on<ListUpdatedEvent>(SOCKET_EVENTS.LIST_UPDATED, (data) => {
      queryClient.setQueryData<List[]>(LIST_KEYS.byBoard(boardId), (old) =>
        old ? old.map((l) => (l.id === data.list.id ? data.list : l)) : old
      )
    })

    const unsubListDeleted = on<ListDeletedEvent>(SOCKET_EVENTS.LIST_DELETED, (data) => {
      queryClient.setQueryData<List[]>(LIST_KEYS.byBoard(boardId), (old) =>
        old ? old.filter((l) => l.id !== data.listId) : old
      )
      // Also remove the cards cache for this list
      queryClient.removeQueries({ queryKey: CARD_KEYS.byList(data.listId) })
    })

    const unsubListReordered = on<ListReorderedEvent>(SOCKET_EVENTS.LIST_REORDERED, (data) => {
      queryClient.setQueryData<List[]>(LIST_KEYS.byBoard(boardId), data.lists)
    })

    // Card events
    const unsubCardCreated = on<CardCreatedEvent>(SOCKET_EVENTS.CARD_CREATED, (data) => {
      queryClient.setQueryData<Card[]>(CARD_KEYS.byList(data.card.listId), (old) => {
        if (!old) return [data.card]
        // Avoid duplicates - mutation onSuccess may have already added this card
        // Also filter out any temp cards that match by checking for temp- prefix
        const filtered = old.filter((c) => !c.id.startsWith('temp-'))
        const exists = filtered.some((c) => c.id === data.card.id)
        if (exists) return filtered
        return [...filtered, data.card].sort((a, b) => a.position - b.position)
      })
    })

    const unsubCardUpdated = on<CardUpdatedEvent>(SOCKET_EVENTS.CARD_UPDATED, (data) => {
      queryClient.setQueryData<Card[]>(CARD_KEYS.byList(data.card.listId), (old) =>
        old ? old.map((c) => (c.id === data.card.id ? data.card : c)) : old
      )
    })

    const unsubCardDeleted = on<CardDeletedEvent>(SOCKET_EVENTS.CARD_DELETED, (data) => {
      queryClient.setQueryData<Card[]>(CARD_KEYS.byList(data.listId), (old) =>
        old ? old.filter((c) => c.id !== data.cardId) : old
      )
    })

    const unsubCardMoved = on<CardMovedEvent>(SOCKET_EVENTS.CARD_MOVED, (data) => {
      // Remove from source list
      queryClient.setQueryData<Card[]>(CARD_KEYS.byList(data.fromListId), (old) =>
        old ? old.filter((c) => c.id !== data.card.id) : old
      )

      // Add to target list
      queryClient.setQueryData<Card[]>(CARD_KEYS.byList(data.card.listId), (old) => {
        if (!old) return [data.card]
        const filtered = old.filter((c) => c.id !== data.card.id)
        return [...filtered, data.card].sort((a, b) => a.position - b.position)
      })
    })

    const unsubCardReordered = on<CardReorderedEvent>(SOCKET_EVENTS.CARD_REORDERED, (data) => {
      queryClient.setQueryData<Card[]>(CARD_KEYS.byList(data.listId), data.cards)
    })

    // Board events
    const unsubBoardUpdated = on<BoardUpdatedEvent>(SOCKET_EVENTS.BOARD_UPDATED, (data) => {
      queryClient.setQueryData<Board>(['board', boardId], data.board)
    })

    const unsubBoardDeleted = on<BoardDeletedEvent>(SOCKET_EVENTS.BOARD_DELETED, () => {
      onBoardDeletedRef.current?.()
    })

    // Member events
    const unsubMemberAdded = on<MemberAddedEvent>(SOCKET_EVENTS.MEMBER_ADDED, (data) => {
      queryClient.setQueryData<BoardMember[]>(MEMBER_KEYS.byBoard(boardId), (old) => {
        if (!old) return [data.member]
        // Avoid duplicates - check if member already exists (from optimistic update)
        const exists = old.some((m) => m.id === data.member.id)
        if (exists) return old
        return [...old, data.member]
      })
    })

    const unsubMemberUpdated = on<MemberUpdatedEvent>(SOCKET_EVENTS.MEMBER_UPDATED, (data) => {
      queryClient.setQueryData<BoardMember[]>(MEMBER_KEYS.byBoard(boardId), (old) =>
        old ? old.map((m) => (m.userId === data.member.userId ? data.member : m)) : old
      )
    })

    const unsubMemberRemoved = on<MemberRemovedEvent>(SOCKET_EVENTS.MEMBER_REMOVED, (data) => {
      queryClient.setQueryData<BoardMember[]>(MEMBER_KEYS.byBoard(boardId), (old) =>
        old ? old.filter((m) => m.userId !== data.memberId) : old
      )
      onMemberRemovedRef.current?.(data.memberId)
    })

    // Active users event
    const unsubActiveUsers = on<ActiveUsersChangedEvent>(SOCKET_EVENTS.USERS_ACTIVE, (data) => {
      onActiveUsersChangeRef.current?.(data.users)
    })

    return () => {
      unsubListCreated()
      unsubListUpdated()
      unsubListDeleted()
      unsubListReordered()
      unsubCardCreated()
      unsubCardUpdated()
      unsubCardDeleted()
      unsubCardMoved()
      unsubCardReordered()
      unsubBoardUpdated()
      unsubBoardDeleted()
      unsubMemberAdded()
      unsubMemberUpdated()
      unsubMemberRemoved()
      unsubActiveUsers()
    }
  }, [socket, isConnected, boardId, queryClient, on])

  return { isConnected }
}
