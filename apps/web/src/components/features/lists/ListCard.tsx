import { useState, useRef, useEffect } from 'react'
import type { List } from '@hello/types'
import { MoreHorizontalIcon } from '../../icons'

export interface ListCardProps {
  list: List
  onUpdateTitle: (title: string) => void
  onDelete: () => void
  isUpdating?: boolean
  isDeleting?: boolean
}

export default function ListCard({
  list,
  onUpdateTitle,
  onDelete,
  isUpdating,
  isDeleting,
}: ListCardProps) {
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
