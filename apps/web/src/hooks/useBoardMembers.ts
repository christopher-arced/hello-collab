import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { BoardMember, Role } from '@hello/types'
import type { AddBoardMemberInput, UpdateBoardMemberInput } from '@hello/validation'
import { fetcher, ApiError } from '../lib/api'

export const MEMBER_KEYS = {
  byBoard: (boardId: string) => ['board-members', boardId] as const,
}

export function useBoardMembers(boardId: string) {
  const queryClient = useQueryClient()

  const {
    data: members,
    isLoading,
    error,
  } = useQuery({
    queryKey: MEMBER_KEYS.byBoard(boardId),
    queryFn: () => fetcher<BoardMember[]>(`/api/boards/${boardId}/members`),
    enabled: !!boardId,
  })

  const addMutation = useMutation({
    mutationFn: (data: AddBoardMemberInput) =>
      fetcher<BoardMember>(`/api/boards/${boardId}/members`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (newMember) => {
      queryClient.setQueryData<BoardMember[]>(MEMBER_KEYS.byBoard(boardId), (old) => {
        if (!old) return [newMember]
        // Avoid duplicates - socket event may have already added this member
        const exists = old.some((m) => m.id === newMember.id)
        if (exists) return old
        return [...old, newMember]
      })
    },
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) =>
      fetcher<BoardMember>(`/api/boards/${boardId}/members/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role } as UpdateBoardMemberInput),
      }),
    onMutate: async ({ userId, role }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: MEMBER_KEYS.byBoard(boardId) })

      // Snapshot the previous value
      const previous = queryClient.getQueryData<BoardMember[]>(MEMBER_KEYS.byBoard(boardId))

      // Optimistically update
      queryClient.setQueryData<BoardMember[]>(MEMBER_KEYS.byBoard(boardId), (old) =>
        old ? old.map((m) => (m.userId === userId ? { ...m, role } : m)) : old
      )

      return { previous }
    },
    onError: (_, __, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(MEMBER_KEYS.byBoard(boardId), context.previous)
      }
    },
    onSuccess: (updatedMember) => {
      // Ensure we have the server's authoritative data
      queryClient.setQueryData<BoardMember[]>(MEMBER_KEYS.byBoard(boardId), (old) =>
        old ? old.map((m) => (m.userId === updatedMember.userId ? updatedMember : m)) : old
      )
    },
  })

  const removeMutation = useMutation({
    mutationFn: (userId: string) =>
      fetcher<null>(`/api/boards/${boardId}/members/${userId}`, {
        method: 'DELETE',
      }),
    onSuccess: (_, userId) => {
      queryClient.setQueryData<BoardMember[]>(MEMBER_KEYS.byBoard(boardId), (old) =>
        old ? old.filter((m) => m.userId !== userId) : old
      )
    },
  })

  return {
    members: members ?? [],
    isLoading,
    error: error as ApiError | null,

    addMember: addMutation.mutate,
    addMemberAsync: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    addError: addMutation.error as ApiError | null,
    resetAddError: addMutation.reset,

    updateRole: updateRoleMutation.mutate,
    updateRoleAsync: updateRoleMutation.mutateAsync,
    isUpdatingRole: updateRoleMutation.isPending,
    updateRoleError: updateRoleMutation.error as ApiError | null,
    resetUpdateRoleError: updateRoleMutation.reset,

    removeMember: removeMutation.mutate,
    removeMemberAsync: removeMutation.mutateAsync,
    isRemoving: removeMutation.isPending,
    removeError: removeMutation.error as ApiError | null,
    resetRemoveError: removeMutation.reset,
  }
}
