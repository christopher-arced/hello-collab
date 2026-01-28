import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { List } from '@hello/types'
import type { CreateListInput, UpdateListInput, ReorderListsInput } from '@hello/validation'
import { fetcher, ApiError } from '../lib/api'

export const LIST_KEYS = {
  byBoard: (boardId: string) => ['lists', boardId] as const,
}

export function useLists(boardId: string) {
  const queryClient = useQueryClient()

  const {
    data: lists,
    isLoading,
    error,
  } = useQuery({
    queryKey: LIST_KEYS.byBoard(boardId),
    queryFn: () => fetcher<List[]>(`/api/boards/${boardId}/lists`),
    enabled: !!boardId,
    // Data is pre-populated by useBoard, keep it fresh for 30 seconds
    staleTime: 30 * 1000,
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateListInput) =>
      fetcher<List>(`/api/boards/${boardId}/lists`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (newList) => {
      queryClient.setQueryData<List[]>(LIST_KEYS.byBoard(boardId), (old) => {
        if (!old) return [newList]
        // Avoid duplicates - socket event may have already added this list
        const exists = old.some((l) => l.id === newList.id)
        if (exists) return old
        return [...old, newList]
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ listId, data }: { listId: string; data: UpdateListInput }) =>
      fetcher<List>(`/api/lists/${listId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: (updatedList) => {
      queryClient.setQueryData<List[]>(LIST_KEYS.byBoard(boardId), (old) =>
        old ? old.map((l) => (l.id === updatedList.id ? updatedList : l)) : old
      )
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (listId: string) =>
      fetcher<null>(`/api/lists/${listId}`, {
        method: 'DELETE',
      }),
    onSuccess: (_, listId) => {
      queryClient.setQueryData<List[]>(LIST_KEYS.byBoard(boardId), (old) =>
        old ? old.filter((l) => l.id !== listId) : old
      )
    },
  })

  const reorderMutation = useMutation({
    mutationFn: (data: ReorderListsInput) =>
      fetcher<List[]>(`/api/boards/${boardId}/lists/reorder`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: LIST_KEYS.byBoard(boardId) })
      const previous = queryClient.getQueryData<List[]>(LIST_KEYS.byBoard(boardId))
      queryClient.setQueryData<List[]>(LIST_KEYS.byBoard(boardId), (old) => {
        if (!old) return old
        const orderMap = new Map(data.listIds.map((id, index) => [id, index]))
        return [...old].sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0))
      })
      return { previous }
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(LIST_KEYS.byBoard(boardId), context.previous)
      }
    },
    onSuccess: (reorderedLists) => {
      queryClient.setQueryData<List[]>(LIST_KEYS.byBoard(boardId), reorderedLists)
    },
  })

  return {
    lists: lists ?? [],
    isLoading,
    error: error as ApiError | null,

    createList: createMutation.mutate,
    createListAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error as ApiError | null,
    resetCreateError: createMutation.reset,

    updateList: updateMutation.mutate,
    updateListAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error as ApiError | null,
    resetUpdateError: updateMutation.reset,

    deleteList: deleteMutation.mutate,
    deleteListAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error as ApiError | null,

    reorderLists: reorderMutation.mutate,
    reorderListsAsync: reorderMutation.mutateAsync,
    isReordering: reorderMutation.isPending,
  }
}
