import { useState, useRef, useEffect } from 'react'
import type { Card } from '@hello/types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DropdownMenu } from '../../common'
import { DragIcon } from '../../icons'

export interface CardItemProps {
  card: Card
  listId: string
  onUpdateTitle: (title: string) => void
  onDelete: () => void
  isUpdating?: boolean
  isDeleting?: boolean
}

function formatDueDate(date: Date): string {
  const now = new Date()
  const dueDate = new Date(date)
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'Overdue'
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  return dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function getDueDateColor(date: Date): string {
  const now = new Date()
  const dueDate = new Date(date)
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  if (diffDays <= 1)
    return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
  return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
}

export default function CardItem({
  card,
  listId,
  onUpdateTitle,
  onDelete,
  isUpdating,
  isDeleting,
}: CardItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(card.title)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'card', card, listId },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  useEffect(() => {
    setTitle(card.title)
  }, [card.title])

  const autoResize = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`
    }
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
      autoResize()
    }
  }, [isEditing])

  const handleSubmit = () => {
    const trimmed = title.trim()
    setTitle(trimmed)
    if (trimmed && trimmed !== card.title) {
      onUpdateTitle(trimmed)
    } else {
      setTitle(card.title)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'Escape') {
      setTitle(card.title)
      setIsEditing(false)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white dark:bg-gray-700 rounded-lg shadow-sm border transition-colors ${isEditing ? 'border-gray-400 dark:border-gray-500' : 'border-gray-100 dark:border-gray-700/50 hover:border-gray-200 dark:hover:border-gray-600'}`}
    >
      {card.coverUrl && (
        <div className="h-32 rounded-t-lg overflow-hidden">
          <img src={card.coverUrl} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-2.5">
        <div className="flex items-start gap-1">
          <button
            type="button"
            className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-0.5 -ml-0.5 mr-0.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 touch-none transition-opacity"
            {...attributes}
            {...listeners}
          >
            <DragIcon size={14} />
          </button>
          {isEditing ? (
            <textarea
              ref={inputRef}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                autoResize()
              }}
              onBlur={() => {
                setTitle(card.title)
                setIsEditing(false)
              }}
              onKeyDown={handleKeyDown}
              className="flex-1 px-0.5 py-0.5 text-sm rounded resize-none bg-transparent border-none focus:outline-none text-gray-900 dark:text-gray-100 overflow-hidden"
              rows={1}
              maxLength={512}
              disabled={isUpdating}
            />
          ) : (
            <p
              onClick={() => setIsEditing(true)}
              className="flex-1 px-0.5 py-0.5 text-sm cursor-pointer rounded hover:bg-black/5 dark:hover:bg-white/5 text-gray-800 dark:text-gray-100 leading-snug break-words select-none"
            >
              {title}
            </p>
          )}

          <DropdownMenu
            items={[
              {
                label: isDeleting ? 'Deleting...' : 'Delete card',
                onClick: onDelete,
                disabled: isDeleting,
                variant: 'danger',
              },
            ]}
            triggerSize={14}
            triggerClassName="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            ariaLabel="Card options"
            onMenuOpen={() => setIsEditing(true)}
          />
        </div>

        {(card.description || card.dueDate) && (
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {card.dueDate && (
              <span className={`text-xs px-1.5 py-0.5 rounded ${getDueDateColor(card.dueDate)}`}>
                {formatDueDate(card.dueDate)}
              </span>
            )}
            {card.description && (
              <span className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[150px]">
                {card.description}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
