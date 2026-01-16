import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createBoardSchema, CreateBoardInput } from '@hello/validation'
import { Modal, Input, Button } from '../../common'
import { useBoards } from '../../../hooks/useBoards'

interface CreateBoardModalProps {
  isOpen: boolean
  onClose: () => void
}

const BOARD_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#d946ef', // Fuchsia
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#14b8a6', // Teal
  '#0ea5e9', // Sky
  '#0079BF', // Trello Blue (default)
]

const CreateBoardModal = ({ isOpen, onClose }: CreateBoardModalProps) => {
  const { createBoardAsync, isCreating, createError, resetCreateError } = useBoards()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateBoardInput>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: {
      title: '',
      description: '',
      bgColor: '#0079BF',
    },
  })

  const selectedColor = watch('bgColor')

  const onSubmit = async (data: CreateBoardInput) => {
    try {
      await createBoardAsync(data)
      reset()
      onClose()
    } catch {
      // Error handled by createError state
    }
  }

  const handleClose = () => {
    reset()
    resetCreateError()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create new board">
      {createError && (
        <div role="alert" className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{createError.message}</p>
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
          <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="gradient" loading={isCreating} className="flex-1">
            {isCreating ? 'Creating...' : 'Create Board'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default CreateBoardModal
