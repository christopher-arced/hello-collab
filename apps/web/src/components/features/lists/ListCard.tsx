import { useState, useRef, useEffect } from 'react'
import type { List } from '@hello/types'
import { useDroppable, useDndContext } from '@dnd-kit/core'
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CreateIcon, DragIcon } from '../../icons'
import { useCards } from '../../../hooks/useCards'
import { CardItem, AddCardForm } from '../cards'
import { Button, DropdownMenu } from '@/components/common'

export interface ListCardProps {
  list: List
  onUpdateTitle: (title: string) => void
  onDelete: () => void
  isUpdating?: boolean
  isDeleting?: boolean
  dropIndicatorCardId?: string | null
}

export default function ListCard({
  list,
  onUpdateTitle,
  onDelete,
  isUpdating,
  isDeleting,
  dropIndicatorCardId,
}: ListCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(list.title)
  const [isAddCardOpen, setIsAddCardOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const addCardFormRef = useRef<HTMLDivElement>(null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: list.id,
    data: { type: 'list', list },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

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

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `droppable-${list.id}`,
    data: { type: 'list', listId: list.id },
  })

  const { setNodeRef: setEndDroppableRef, isOver: isOverEnd } = useDroppable({
    id: `droppable-end-${list.id}`,
    data: { type: 'list-end', listId: list.id, position: cards.length },
  })

  const { active } = useDndContext()
  const activeData = active?.data.current as { type?: 'list' | 'card'; listId?: string } | undefined
  const isCardOver = isOver && activeData?.type === 'card'
  const isCardOverEnd = isOverEnd && activeData?.type === 'card' && activeData.listId !== list.id

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

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="w-72 flex-shrink-0 h-32 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-100/50 dark:bg-gray-800/50"
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-72 flex-shrink-0 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 flex flex-col max-h-full"
    >
      <div className="px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing p-1 -ml-1 mr-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 touch-none"
          {...attributes}
          {...listeners}
        >
          <DragIcon size={16} />
        </button>
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
          <div
            ref={setDroppableRef}
            className={`text-center py-6 text-sm rounded-lg transition-colors ${
              isCardOver
                ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-600 text-blue-500'
                : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            {isCardOver ? 'Drop card here' : 'No cards yet'}
          </div>
        ) : (
          <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {cards.map((card) => (
                <div key={card.id}>
                  {dropIndicatorCardId === card.id && (
                    <div className="h-1 bg-blue-500 rounded-full mb-2" />
                  )}
                  <CardItem
                    card={card}
                    listId={list.id}
                    onUpdateTitle={(newTitle) =>
                      updateCard({ cardId: card.id, data: { title: newTitle } })
                    }
                    onDelete={() => deleteCard(card.id)}
                    isUpdating={isUpdatingCard}
                    isDeleting={isDeletingCard}
                  />
                </div>
              ))}
              {/* End drop zone for dropping at the last position - only show when dragging a card from another list */}
              {activeData?.type === 'card' && activeData.listId !== list.id && (
                <div
                  ref={setEndDroppableRef}
                  className={`min-h-[8px] rounded transition-all ${
                    isCardOverEnd ? 'h-1 bg-blue-500 my-1' : ''
                  }`}
                />
              )}
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
          </SortableContext>
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
