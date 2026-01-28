import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateCardSchema, UpdateCardInput } from '@hello/validation'
import type { Card } from '@hello/types'
import { Modal, Input, Button, ErrorAlert } from '../../common'
import { CalendarIcon, ImageIcon, TrashIcon } from '../../icons'

interface CardDetailModalProps {
  card: Card
  isOpen: boolean
  onClose: () => void
  onUpdate: (data: UpdateCardInput) => Promise<void>
  onDelete: () => void
  isUpdating?: boolean
  isDeleting?: boolean
  updateError?: { message: string } | null
  resetUpdateError?: () => void
}

function formatDateForInput(date: Date | string | null): string {
  if (!date) return ''
  const d = new Date(date)
  // Format as YYYY-MM-DDTHH:mm for datetime-local input
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export default function CardDetailModal({
  card,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
  updateError,
  resetUpdateError,
}: CardDetailModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<UpdateCardInput>({
    resolver: zodResolver(updateCardSchema),
    defaultValues: {
      title: card.title,
      description: card.description ?? '',
      dueDate: card.dueDate ? new Date(card.dueDate).toISOString() : null,
      coverUrl: card.coverUrl ?? '',
    },
  })

  // Reset form when card changes or modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        title: card.title,
        description: card.description ?? '',
        dueDate: card.dueDate ? new Date(card.dueDate).toISOString() : null,
        coverUrl: card.coverUrl ?? '',
      })
    }
  }, [isOpen, card, reset])

  const currentDueDate = watch('dueDate')
  const currentCoverUrl = watch('coverUrl')

  const onSubmit = async (data: UpdateCardInput) => {
    try {
      // Only send changed fields
      const updates: UpdateCardInput = {}
      if (data.title !== card.title) updates.title = data.title
      if ((data.description ?? null) !== card.description) {
        updates.description = data.description || null
      }
      if (data.dueDate !== (card.dueDate ? new Date(card.dueDate).toISOString() : null)) {
        updates.dueDate = data.dueDate
      }
      if ((data.coverUrl ?? null) !== card.coverUrl) {
        updates.coverUrl = data.coverUrl || null
      }

      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        await onUpdate(updates)
      }
      onClose()
    } catch {
      // Error handled by updateError state
    }
  }

  const handleClose = () => {
    reset()
    resetUpdateError?.()
    onClose()
  }

  const handleClearDueDate = () => {
    setValue('dueDate', null, { shouldDirty: true })
  }

  const handleClearCoverUrl = () => {
    setValue('coverUrl', null, { shouldDirty: true })
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Card details">
      {updateError && <ErrorAlert message={updateError.message} />}

      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        {/* Title */}
        <div className="mb-5">
          <Input
            label="Title"
            type="text"
            placeholder="Enter card title"
            errorMessage={errors.title?.message}
            {...register('title')}
          />
        </div>

        {/* Description */}
        <div className="mb-5">
          <label className="block text-[13px] font-medium text-theme-text-muted dark:text-theme-dark-text-muted mb-2">
            Description <span className="font-normal opacity-60">(optional)</span>
          </label>
          <textarea
            placeholder="Add a more detailed description..."
            className="w-full py-3 px-4 rounded-[10px] text-theme-text dark:text-white text-[15px] bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.08] dark:border-white/[0.08] placeholder:text-theme-text-muted dark:placeholder:text-theme-dark-text-muted focus:outline-none focus:bg-indigo-500/5 focus:border-indigo-500/50 transition-all duration-200 resize-none"
            rows={4}
            {...register('description')}
          />
          {errors.description && (
            <p role="alert" className="mt-1.5 text-xs text-red-500">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Due Date */}
        <div className="mb-5">
          <label className="block text-[13px] font-medium text-theme-text-muted dark:text-theme-dark-text-muted mb-2">
            <CalendarIcon size={14} className="inline mr-1.5 -mt-0.5" />
            Due date <span className="font-normal opacity-60">(optional)</span>
          </label>
          <div className="flex gap-2">
            <input
              type="datetime-local"
              value={formatDateForInput(currentDueDate ?? null)}
              onChange={(e) => {
                const value = e.target.value
                if (value) {
                  setValue('dueDate', new Date(value).toISOString(), { shouldDirty: true })
                } else {
                  setValue('dueDate', null, { shouldDirty: true })
                }
              }}
              className="flex-1 py-3 px-4 rounded-[10px] text-theme-text dark:text-white text-[15px] bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.08] dark:border-white/[0.08] focus:outline-none focus:bg-indigo-500/5 focus:border-indigo-500/50 transition-all duration-200"
            />
            {currentDueDate && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleClearDueDate}
                className="!px-3"
                aria-label="Clear due date"
              >
                Clear
              </Button>
            )}
          </div>
          {errors.dueDate && (
            <p role="alert" className="mt-1.5 text-xs text-red-500">
              {errors.dueDate.message}
            </p>
          )}
        </div>

        {/* Cover Image URL */}
        <div className="mb-6">
          <label className="block text-[13px] font-medium text-theme-text-muted dark:text-theme-dark-text-muted mb-2">
            <ImageIcon size={14} className="inline mr-1.5 -mt-0.5" />
            Cover image URL <span className="font-normal opacity-60">(optional)</span>
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              {...register('coverUrl')}
              className="flex-1 py-3 px-4 rounded-[10px] text-theme-text dark:text-white text-[15px] bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.08] dark:border-white/[0.08] placeholder:text-theme-text-muted dark:placeholder:text-theme-dark-text-muted focus:outline-none focus:bg-indigo-500/5 focus:border-indigo-500/50 transition-all duration-200"
            />
            {currentCoverUrl && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleClearCoverUrl}
                className="!px-3"
                aria-label="Clear cover image"
              >
                Clear
              </Button>
            )}
          </div>
          {errors.coverUrl && (
            <p role="alert" className="mt-1.5 text-xs text-red-500">
              {errors.coverUrl.message}
            </p>
          )}
          {/* Cover Image Preview */}
          {currentCoverUrl && !errors.coverUrl && (
            <div className="mt-3 rounded-lg overflow-hidden border border-black/[0.08] dark:border-white/[0.08]">
              <img
                src={currentCoverUrl}
                alt="Cover preview"
                className="w-full h-32 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="mb-6 p-3 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] text-xs text-theme-text-muted dark:text-theme-dark-text-muted">
          <p>Created: {new Date(card.createdAt).toLocaleString()}</p>
          <p>Updated: {new Date(card.updatedAt).toLocaleString()}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onDelete}
            disabled={isDeleting}
            className="!bg-red-500/10 !text-red-500 hover:!bg-red-500/20 !border-red-500/20"
          >
            <TrashIcon size={16} className="mr-1.5" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
          <div className="flex-1" />
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="gradient" loading={isUpdating} disabled={!isDirty}>
            {isUpdating ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
