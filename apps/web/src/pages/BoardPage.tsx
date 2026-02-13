import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { SocketUser } from '@hello/types'
import Sidebar from '@/components/common/Sidebar'
import { Button, ConfirmModal } from '@/components/common'
import { BoardCanvas } from '@/components/features/lists'
import { BoardHeader } from '@/components/features/board/BoardHeader'
import { EditBoardModal } from '@/components/features/board/EditBoardModal'
import { BoardMembersPanel } from '@/components/features/board/BoardMembersPanel'
import { useAuthStore } from '@/stores/authStore'
import { useBoard } from '@/hooks/useBoards'
import { useLists } from '@/hooks/useLists'
import { useBoardMembers } from '@/hooks/useBoardMembers'
import { useRealtimeSync } from '@/hooks/useRealtimeSync'
import { useCardOperations } from '@/hooks/useCardOperations'

export default function BoardPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
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

  const { handleReorderCards, handleMoveCard } = useCardOperations()

  const { members } = useBoardMembers(id!)
  const canEdit = members.some(
    (m) => m.userId === currentUser?.id && (m.role === 'OWNER' || m.role === 'EDITOR')
  )

  const handleDelete = () => {
    deleteBoardAsync().then(() => navigate('/'))
  }

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
        <BoardHeader
          board={board}
          isConnected={isConnected}
          activeUsers={activeUsers}
          canEdit={canEdit}
          onEdit={() => setIsEditModalOpen(true)}
          onDelete={() => setIsDeleteModalOpen(true)}
          onShare={() => setIsMembersPanelOpen(true)}
        />

        {/* Board Content - Lists */}
        <BoardCanvas
          lists={lists}
          boardColor={board.bgColor}
          isLoading={isLoadingLists}
          canEdit={canEdit}
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

      {canEdit && (
        <EditBoardModal
          board={board}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={(data) => updateBoardAsync(data)}
          isSaving={isUpdating}
          saveError={updateError}
          onResetError={resetUpdateError}
        />
      )}

      {canEdit && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Delete board"
          confirmLabel="Delete Board"
          loadingLabel="Deleting..."
          isLoading={isDeleting}
          variant="danger"
        >
          Are you sure you want to delete{' '}
          <strong className="text-theme-text dark:text-theme-dark-text">{board.title}</strong>? This
          action cannot be undone.
        </ConfirmModal>
      )}

      <BoardMembersPanel
        boardId={id!}
        boardOwnerId={board.ownerId}
        isOpen={isMembersPanelOpen}
        onClose={() => setIsMembersPanelOpen(false)}
      />
    </div>
  )
}
