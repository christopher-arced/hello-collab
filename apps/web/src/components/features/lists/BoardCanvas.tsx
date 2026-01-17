import { useState, useRef, useEffect } from 'react'
import type { List } from '@hello/types'
import { Button } from '../../common'
import { MoreHorizontalIcon, CloseIcon } from '../../icons'

interface BoardCanvasProps {
  lists: List[]
  boardColor: string
  isLoading?: boolean
  onCreateList: (title: string) => Promise<void>
  onUpdateList: (listId: string, title: string) => void
  onDeleteList: (listId: string) => Promise<void>
  isCreating?: boolean
  isUpdating?: boolean
  isDeleting?: boolean
}

interface ListCardProps {
  list: List
  onUpdateTitle: (title: string) => void
  onDelete: () => void
  isUpdating?: boolean
  isDeleting?: boolean
}

function ListCard({ list, onUpdateTitle, onDelete, isUpdating, isDeleting }: ListCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(list.title)
  const [showMenu, setShowMenu] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = () => {
    const trimmed = title.trim()
    if (trimmed && trimmed !== list.title) {
      onUpdateTitle(trimmed)
    } else {
      setTitle(list.title)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
    else if (e.key === 'Escape') {
      setTitle(list.title)
      setIsEditing(false)
    }
  }

  return (
    <div className="w-72 flex-shrink-0 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 flex flex-col max-h-full">
      <div className="px-4 py-3 flex items-center justify-between">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSubmit}
            onKeyDown={handleKeyDown}
            className="flex-1 px-2 py-1 text-sm rounded bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none"
            disabled={isUpdating}
          />
        ) : (
          <h3
            onClick={() => setIsEditing(true)}
            className="flex-1 px-1 py-0.5 text-sm cursor-pointer rounded hover:bg-black/5 dark:hover:bg-white/5 text-gray-800 dark:text-gray-100 font-medium"
          >
            {list.title}
          </h3>
        )}

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="List options"
          >
            <MoreHorizontalIcon size={16} />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-lg z-10 overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg">
              <button
                onClick={() => {
                  setShowMenu(false)
                  onDelete()
                }}
                disabled={isDeleting}
                className="w-full px-3 py-2 text-left text-sm transition-colors disabled:opacity-50 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                {isDeleting ? 'Deleting...' : 'Delete list'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-2 min-h-[80px]">
        <div className="text-center py-6 text-sm text-gray-400 dark:text-gray-500">
          Cards coming soon...
        </div>
      </div>

      <div className="px-2 pb-2">
        <button className="w-full py-2 text-sm rounded-lg transition-colors flex items-center justify-center gap-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">
          <span className="text-lg leading-none">+</span>
          <span>Add a card</span>
        </button>
      </div>
    </div>
  )
}

interface AddListFormProps {
  onAdd: (title: string) => Promise<void>
  isAdding?: boolean
}

function AddListForm({ onAdd, isAdding }: AddListFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (trimmed) {
      await onAdd(trimmed)
      setTitle('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      setTitle('')
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-72 flex-shrink-0 py-3 px-4 text-sm font-medium transition-all flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-2xl"
      >
        <span className="text-lg leading-none">+</span>
        <span>Add another list</span>
      </button>
    )
  }

  return (
    <div className="w-72 flex-shrink-0 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-3">
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter list title..."
          className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500"
          disabled={isAdding}
        />
        <div className="flex items-center gap-2 mt-2">
          <Button
            type="submit"
            variant="primary"
            loading={isAdding}
            className="!py-1.5 !px-3 !text-sm"
          >
            Add list
          </Button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false)
              setTitle('')
            }}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
            aria-label="Cancel"
          >
            <CloseIcon size={20} />
          </button>
        </div>
      </form>
    </div>
  )
}

export default function BoardCanvas({
  lists,
  boardColor,
  isLoading,
  onCreateList,
  onUpdateList,
  onDeleteList,
  isCreating,
  isUpdating,
  isDeleting,
}: BoardCanvasProps) {
  return (
    <div
      className="flex-1 p-6 overflow-x-auto bg-gray-50 dark:bg-gray-900/50"
      style={{ backgroundColor: `${boardColor}10` }}
    >
      <div className="flex gap-4 items-start h-full">
        {isLoading ? (
          <div className="flex gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-72 h-32 bg-white/50 dark:bg-white/5 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <>
            {lists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                onUpdateTitle={(title) => onUpdateList(list.id, title)}
                onDelete={async () => {
                  try {
                    await onDeleteList(list.id)
                  } catch {
                    // Error handled
                  }
                }}
                isUpdating={isUpdating}
                isDeleting={isDeleting}
              />
            ))}
            <AddListForm onAdd={onCreateList} isAdding={isCreating} />
          </>
        )}
      </div>
    </div>
  )
}
