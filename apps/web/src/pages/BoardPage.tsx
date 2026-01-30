import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateBoardSchema, UpdateBoardInput } from '@hello/validation'
import type { Card, SocketUser } from '@hello/types'
import Sidebar from '@/components/common/Sidebar'
import { Input, Button, Modal, ErrorAlert } from '@/components/common'
import { BoardCanvas } from '@/components/features/lists'
import { ActiveUsers } from '@/components/features/board/ActiveUsers'
import { BoardMembersPanel } from '@/components/features/board/BoardMembersPanel'
import { useAuthStore } from '@/stores/authStore'
import { useBoard } from '@/hooks/useBoards'
import { useLists } from '@/hooks/useLists'
import { CARD_KEYS } from '@/hooks/useCards'
import { useRealtimeSync } from '@/hooks/useRealtimeSync'
import { fetcher } from '@/lib/api'
import { BOARD_COLORS } from '@/constants/boardColors'

export default function BoardPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((s) => s.user)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isMembersPanelOpen, setIsMembersPanelOpen] = useState(false)
  const [activeUsers, setActiveUsers] = useState<SocketUser[]>([])

  // Handle being removed from board - navigate away
  const handleMemberRemoved = useCallback(
    (userId: string) => {
      if (currentUser && userId === currentUser.id) {
        navigate('/')
      }
    },
    [currentUser, navigate]
  )

  // Set up real-time sync for this board
  const { isConnected } = useRealtimeSync(id, {
    onBoardDeleted: () => navigate('/'),
    onActiveUsersChange: setActiveUsers,
    onMemberRemoved: handleMemberRemoved,
  })

  const {
    board,
    isLoading,
    error,
    updateBoardAsync,
    isUpdating,
    updateError,
    resetUpdateError,
    deleteBoardAsync,
    isDeleting,
  } = useBoard(id!)

  const {
    lists,
    isLoading: isLoadingLists,
    createListAsync,
    isCreating: isCreatingList,
    updateList,
    isUpdating: isUpdatingList,
    deleteListAsync,
    isDeleting: isDeletingList,
    reorderLists,
  } = useLists(id!)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UpdateBoardInput>({
    resolver: zodResolver(updateBoardSchema),
  })

  const selectedColor = watch('bgColor')

  const openEditModal = () => {
    if (board) {
      reset({
        title: board.title,
        description: board.description ?? '',
        bgColor: board.bgColor,
      })
    }
    setIsEditModalOpen(true)
  }

  const onSubmit = (data: UpdateBoardInput) => {
    updateBoardAsync(data).then(() => setIsEditModalOpen(false))
  }

  const handleDelete = () => {
    deleteBoardAsync().then(() => navigate('/'))
  }

  const handleCloseEditModal = () => {
    resetUpdateError()
    setIsEditModalOpen(false)
  }

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

  const handleCreateList = useCallback(
    async (title: string) => {
      await createListAsync({ title })
    },
    [createListAsync]
  )

  const handleUpdateList = useCallback(
    (listId: string, title: string) => {
      updateList({ listId, data: { title } })
    },
    [updateList]
  )

  const handleDeleteList = useCallback(
    async (listId: string) => {
      await deleteListAsync(listId)
    },
    [deleteListAsync]
  )

  const handleReorderLists = useCallback(
    (listIds: string[]) => {
      reorderLists({ listIds })
    },
    [reorderLists]
  )

  if (isLoading) {
    return (
      <div className="h-screen max-h-screen bg-theme-bg dark:bg-theme-dark-bg flex">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto animate-pulse">
            <div className="h-8 bg-black/10 dark:bg-white/10 rounded w-48 mb-4" />
            <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-96" />
          </div>
        </main>
      </div>
    )
  }

  if (error || !board) {
    return (
      <div className="h-screen max-h-screen bg-theme-bg dark:bg-theme-dark-bg flex">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto text-center py-20">
            <h1 className="text-2xl font-semibold text-theme-text dark:text-theme-dark-text mb-2">
              Board not found
            </h1>
            <p className="text-theme-text-secondary dark:text-theme-dark-text-secondary mb-4">
              {error?.message ?? 'The board you are looking for does not exist.'}
            </p>
            <Button variant="primary" onClick={() => navigate('/')}>
              Back to Dashboard
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="h-screen max-h-screen bg-theme-bg dark:bg-theme-dark-bg flex">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Board Header */}
        <div className="px-8 py-6" style={{ backgroundColor: board.bgColor }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{board.title}</h1>
              {board.description && <p className="text-white/80 text-sm">{board.description}</p>}
            </div>
            <div className="flex items-center gap-4">
              {/* Connection indicator */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-yellow-400'}`}
                  title={isConnected ? 'Real-time sync active' : 'Connecting...'}
                />
                <ActiveUsers users={activeUsers} />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsMembersPanelOpen(true)}
                  className="!bg-white/20 !border-white/30 !text-white hover:!bg-white/30"
                >
                  <svg
                    className="w-4 h-4 mr-1.5 inline-block"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  Share
                </Button>
                <Button
                  variant="outline"
                  onClick={openEditModal}
                  className="!bg-white/20 !border-white/30 !text-white hover:!bg-white/30"
                >
                  Edit Board
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="!bg-black/20 !border-black/20 !text-white hover:!bg-black/30"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Board Content - Lists */}
        <BoardCanvas
          lists={lists}
          boardColor={board.bgColor}
          isLoading={isLoadingLists}
          onCreateList={handleCreateList}
          onUpdateList={handleUpdateList}
          onDeleteList={handleDeleteList}
          onReorderLists={handleReorderLists}
          onReorderCards={handleReorderCards}
          onMoveCard={handleMoveCard}
          isCreating={isCreatingList}
          isUpdating={isUpdatingList}
          isDeleting={isDeletingList}
        />
      </main>

      {/* Edit Board Modal */}
      <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal} title="Edit board">
        {updateError && <ErrorAlert message={updateError.message} />}

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-5">
            <Input
              label="Board title"
              type="text"
              placeholder="Enter board title"
              errorMessage={errors.title?.message}
              {...register('title')}
            />
          </div>

          <div className="mb-5">
            <label className="block text-[13px] font-medium text-theme-text-muted dark:text-theme-dark-text-muted mb-2">
              Description (optional)
            </label>
            <textarea
              placeholder="What's this board about?"
              className="w-full py-3 px-4 rounded-[10px] text-theme-text dark:text-white text-[15px] bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.08] dark:border-white/[0.08] placeholder:text-theme-text-muted dark:placeholder:text-theme-dark-text-muted focus:outline-none focus:bg-indigo-500/5 focus:border-indigo-500/50 transition-all duration-200 resize-none"
              rows={3}
              {...register('description')}
            />
            {errors.description && (
              <p role="alert" className="mt-1.5 text-xs text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-[13px] font-medium text-theme-text-muted dark:text-theme-dark-text-muted mb-3">
              Board color
            </label>
            <div className="flex flex-wrap gap-2">
              {BOARD_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('bgColor', color)}
                  className={`w-8 h-8 rounded-lg cursor-pointer border-2 transition-all ${
                    selectedColor === color
                      ? 'border-white scale-110 shadow-lg'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                  aria-pressed={selectedColor === color}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseEditModal}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" variant="gradient" loading={isUpdating} className="flex-1">
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete board"
      >
        <p className="text-theme-text-secondary dark:text-theme-dark-text-secondary mb-6">
          Are you sure you want to delete{' '}
          <strong className="text-theme-text dark:text-theme-dark-text">{board.title}</strong>? This
          action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsDeleteModalOpen(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            loading={isDeleting}
            onClick={handleDelete}
            className="flex-1 !bg-red-500 hover:!bg-red-600"
          >
            {isDeleting ? 'Deleting...' : 'Delete Board'}
          </Button>
        </div>
      </Modal>

      {/* Board Members Panel */}
      <BoardMembersPanel
        boardId={id!}
        boardOwnerId={board.ownerId}
        isOpen={isMembersPanelOpen}
        onClose={() => setIsMembersPanelOpen(false)}
      />
    </div>
  )
}
