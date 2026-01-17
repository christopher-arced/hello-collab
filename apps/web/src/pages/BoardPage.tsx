import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateBoardSchema, UpdateBoardInput } from '@hello/validation'
import Sidebar from '@/components/common/Sidebar'
import { Input, Button, Modal } from '@/components/common'
import { BoardCanvas } from '@/components/features/lists'
import { useBoard } from '@/hooks/useBoards'
import { useLists } from '@/hooks/useLists'

const BOARD_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#d946ef',
  '#ec4899',
  '#f43f5e',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#0ea5e9',
  '#0079BF',
]

export default function BoardPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

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

  const onSubmit = async (data: UpdateBoardInput) => {
    try {
      await updateBoardAsync(data)
      setIsEditModalOpen(false)
    } catch {
      // Error handled by updateError state
    }
  }

  const handleDelete = async () => {
    try {
      await deleteBoardAsync()
      navigate('/')
    } catch {
      // Error handled
    }
  }

  const handleCloseEditModal = () => {
    resetUpdateError()
    setIsEditModalOpen(false)
  }

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
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={openEditModal}
                className="!border-white/30 !text-white hover:!bg-white/10"
              >
                Edit Board
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(true)}
                className="!border-red-400/50 !text-red-300 hover:!bg-red-500/10"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Board Content - Lists */}
        <BoardCanvas
          lists={lists}
          boardColor={board.bgColor}
          isLoading={isLoadingLists}
          onCreateList={async (title) => {
            try {
              await createListAsync({ title })
            } catch {
              // Error handled by hook
            }
          }}
          onUpdateList={(listId, title) => updateList({ listId, data: { title } })}
          onDeleteList={async (listId) => {
            await deleteListAsync(listId)
          }}
          isCreating={isCreatingList}
          isUpdating={isUpdatingList}
          isDeleting={isDeletingList}
        />
      </main>

      {/* Edit Board Modal */}
      <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal} title="Edit board">
        {updateError && (
          <div role="alert" className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{updateError.message}</p>
          </div>
        )}

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
    </div>
  )
}
