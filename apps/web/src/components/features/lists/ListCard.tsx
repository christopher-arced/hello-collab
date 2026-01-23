import { useState, useRef, useEffect } from 'react'
import type { List } from '@hello/types'
import { CreateIcon } from '../../icons'
import { useCards } from '../../../hooks/useCards'
import { CardItem, AddCardForm } from '../cards'
import { Button, DropdownMenu } from '@/components/common'

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
  const [isAddCardOpen, setIsAddCardOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const addCardFormRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    setTimeout(() => {
      if (addCardFormRef.current) {
        addCardFormRef.current.scrollIntoView({ behavior: 'auto' })
      }
    }, 0)
  }

  const {
    cards,
    isLoading: isLoadingCards,
    createCardAsync,
    isCreating: isCreatingCard,
    updateCard,
    isUpdating: isUpdatingCard,
    deleteCard,
    isDeleting: isDeletingCard,
  } = useCards(list.id)

  useEffect(() => {
    setTitle(list.title)
  }, [list.title])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSubmit = () => {
    const trimmed = title.trim()
    setTitle(trimmed)
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
            maxLength={512}
            className="flex-1 px-2 py-1 text-sm rounded bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none text-gray-900 dark:text-gray-100"
            disabled={isUpdating}
          />
        ) : (
          <h3
            onClick={() => setIsEditing(true)}
            className="flex-1 min-w-0 px-1 py-0.5 text-sm cursor-pointer rounded hover:bg-black/5 dark:hover:bg-white/5 text-gray-800 dark:text-gray-100 font-medium break-words"
          >
            {title}
          </h3>
        )}

        <DropdownMenu
          items={[
            {
              label: isDeleting ? 'Deleting...' : 'Delete list',
              onClick: onDelete,
              disabled: isDeleting,
              variant: 'danger',
            },
          ]}
          menuWidth="w-48"
          ariaLabel="List options"
        />
      </div>

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-x-hidden overflow-y-auto px-3 pb-2 min-h-[80px] scrollbar-thin"
      >
        {isLoadingCards ? (
          <div className="text-center py-6 text-sm text-gray-400 dark:text-gray-500">
            Loading...
          </div>
        ) : cards.length === 0 && !isAddCardOpen ? (
          <div className="text-center py-6 text-sm text-gray-400 dark:text-gray-500">
            No cards yet
          </div>
        ) : (
          <div className="space-y-2">
            {cards.map((card) => (
              <CardItem
                key={card.id}
                card={card}
                onUpdateTitle={(newTitle) =>
                  updateCard({ cardId: card.id, data: { title: newTitle } })
                }
                onDelete={() => deleteCard(card.id)}
                isUpdating={isUpdatingCard}
                isDeleting={isDeletingCard}
              />
            ))}
            <div ref={addCardFormRef}>
              {isAddCardOpen && (
                <AddCardForm
                  onAdd={async (cardTitle) => {
                    await createCardAsync({ title: cardTitle })
                  }}
                  isOpen={isAddCardOpen}
                  onOpenChange={setIsAddCardOpen}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {!isAddCardOpen && !isCreatingCard && (
        <Button
          className=" text-sm font-normal flex items-center !px-0"
          variant="ghost"
          onClick={() => {
            setIsAddCardOpen(true)
            scrollToBottom()
          }}
        >
          <CreateIcon size={14} /> Add a card
        </Button>
      )}
    </div>
  )
}
