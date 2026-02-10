import { useState, useRef, useEffect } from 'react'
import { Button } from '../../common'
import { CloseIcon } from '../../icons'

export interface AddCardFormProps {
  onAdd: (title: string) => Promise<void>
  isAdding?: boolean
  isOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
}

export default function AddCardForm({
  onAdd,
  isOpen: controlledIsOpen,
  onOpenChange,
}: AddCardFormProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isOpen = controlledIsOpen ?? internalIsOpen
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleOpenChange = (open: boolean) => {
    setInternalIsOpen(open)
    onOpenChange?.(open)
  }

  const [title, setTitle] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmed = title.trim()
    if (!trimmed || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onAdd(trimmed)
      setTitle('')
      handleOpenChange(true)
      textareaRef?.current?.focus()
    } catch {
      // Keep the form open with the current title on error
      // so the user can retry
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    } else if (e.key === 'Escape') {
      handleClose()
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      handleOpenChange(false)
      setTitle('')
    }
  }

  const handleBlur = (e: React.FocusEvent) => {
    // Don't close if focus is moving to a button within the form
    const relatedTarget = e.relatedTarget as HTMLElement | null
    if (relatedTarget?.closest('form') === e.currentTarget.closest('form')) {
      return
    }
    handleClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        ref={textareaRef}
        value={title}
        onChange={(e) => {
          setTitle(e.target.value)
          autoResize()
        }}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        disabled={isSubmitting}
        placeholder="Enter a title for this card..."
        className="w-full px-2.5 py-2 text-sm rounded-lg border resize-none focus:outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 overflow-hidden"
        rows={1}
        maxLength={512}
      />
      <div className="flex items-center gap-2">
        <Button
          type="submit"
          variant="outline"
          className="!py-1.5 !px-3 !text-sm w-full"
          onMouseDown={(e) => {
            e.preventDefault()
          }}
        >
          Add card
        </Button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            handleOpenChange(false)
            setTitle('')
          }}
          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
          aria-label="Cancel"
        >
          <CloseIcon size={20} />
        </button>
      </div>
    </form>
  )
}
