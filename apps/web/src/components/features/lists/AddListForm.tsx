import { useState, useRef, useEffect } from 'react'
import { Button } from '../../common'
import { CloseIcon } from '../../icons'

export interface AddListFormProps {
  onAdd: (title: string) => Promise<void>
  isAdding?: boolean
}

export default function AddListForm({ onAdd, isAdding }: AddListFormProps) {
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
