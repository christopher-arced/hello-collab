import { useState, useEffect } from 'react'
import type { List, Card } from '@hello/types'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensors,
  useSensor,
  rectIntersection,
  pointerWithin,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  type CollisionDetection,
} from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import ListCard from './ListCard'
import AddListForm from './AddListForm'

interface BoardCanvasProps {
  lists: List[]
  boardColor: string
  isLoading?: boolean
  onCreateList: (title: string) => Promise<void>
  onUpdateList: (listId: string, title: string) => void
  onDeleteList: (listId: string) => Promise<void>
  onReorderLists?: (listIds: string[]) => void
  onReorderCards?: (listId: string, cardIds: string[]) => void
  onMoveCard?: (
    cardId: string,
    sourceListId: string,
    targetListId: string,
    position: number
  ) => void
  isCreating?: boolean
  isUpdating?: boolean
  isDeleting?: boolean
}

export default function BoardCanvas({
  lists,
  boardColor,
  isLoading,
  onCreateList,
  onUpdateList,
  onDeleteList,
  onReorderLists,
  onReorderCards,
  onMoveCard,
  isCreating,
  isUpdating,
  isDeleting,
}: BoardCanvasProps) {
  // Local state for immediate optimistic updates during drag
  const [localLists, setLocalLists] = useState<List[]>(lists)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeType, setActiveType] = useState<'list' | 'card' | null>(null)
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const [activeListId, setActiveListId] = useState<string | null>(null)
  const [overCardId, setOverCardId] = useState<string | null>(null)
  const [overListId, setOverListId] = useState<string | null>(null)

  // Sync local state when prop changes (from query cache updates)
  useEffect(() => {
    setLocalLists(lists)
  }, [lists])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor)
  )

  // Custom collision detection:
  // - For lists: use horizontal position only (entire column is drop zone)
  // - For cards: use rectIntersection (better for vertical stacking)
  const collisionDetection: CollisionDetection = (args) => {
    if (activeType === 'list') {
      // Custom horizontal-only collision detection for lists
      const { droppableRects, droppableContainers, pointerCoordinates } = args
      if (!pointerCoordinates) return []

      type Collision = ReturnType<CollisionDetection>[number]
      const collisions: Collision[] = []

      droppableContainers.forEach((container) => {
        const rect = droppableRects.get(container.id)
        if (!rect) return

        // Check if pointer x is within the horizontal bounds of this container
        if (pointerCoordinates.x >= rect.left && pointerCoordinates.x <= rect.right) {
          collisions.push({
            id: container.id,
            data: { droppableContainer: container },
          })
        }
      })

      // If no direct hit, find the closest one horizontally
      if (collisions.length === 0) {
        let closestDistance = Infinity
        let closestCollision: Collision | null = null

        droppableContainers.forEach((container) => {
          const rect = droppableRects.get(container.id)
          if (!rect) return

          const centerX = rect.left + rect.width / 2
          const distance = Math.abs(pointerCoordinates.x - centerX)

          if (distance < closestDistance) {
            closestDistance = distance
            closestCollision = {
              id: container.id,
              data: { droppableContainer: container },
            }
          }
        })

        if (closestCollision) {
          collisions.push(closestCollision)
        }
      }

      return collisions
    }
    // For cards, try pointerWithin first, fallback to rectIntersection
    const pointerCollisions = pointerWithin(args)
    if (pointerCollisions.length > 0) return pointerCollisions
    return rectIntersection(args)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const data = active.data.current as {
      type: 'list' | 'card'
      list?: List
      card?: Card
      listId?: string
    }
    setActiveId(active.id as string)
    setActiveType(data?.type ?? null)
    if (data?.type === 'card') {
      setActiveCard(data.card ?? null)
      setActiveListId(data.listId ?? null)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    if (activeType === 'card' && over) {
      const overData = over.data.current as { type?: 'list' | 'card'; listId?: string } | undefined
      if (overData?.type === 'card') {
        setOverCardId(over.id as string)
        setOverListId(overData.listId ?? null)
      } else if (over.id.toString().startsWith('droppable-')) {
        // Hovering over empty list drop zone
        setOverCardId(null)
        setOverListId(overData?.listId ?? null)
      } else {
        setOverCardId(null)
        setOverListId(null)
      }
    } else {
      setOverCardId(null)
      setOverListId(null)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setActiveType(null)
    setActiveCard(null)
    setActiveListId(null)
    setOverCardId(null)
    setOverListId(null)

    if (!over || active.id === over.id) return

    const activeData = active.data.current as {
      type: 'list' | 'card'
      listId?: string
      card?: Card
    }
    const overData = over.data.current as
      | { type?: 'list' | 'card'; listId?: string; card?: Card }
      | undefined
    const overId = over.id as string

    if (activeData?.type === 'list') {
      const oldIndex = localLists.findIndex((l) => l.id === active.id)
      const newIndex = localLists.findIndex((l) => l.id === over.id)
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(localLists, oldIndex, newIndex)
        // Immediately update local state for instant visual feedback
        setLocalLists(newOrder)
        onReorderLists?.(newOrder.map((l) => l.id))
      }
    } else if (activeData?.type === 'card') {
      const sourceListId = activeData.listId
      const extendedOverData = overData as
        | { type?: string; listId?: string; card?: Card; position?: number }
        | undefined

      // Determine target list:
      // 1. If dropping on end zone (droppable-end-{listId}) - drop at end
      // 2. If dropping on empty list zone (droppable-{listId}) - drop at position 0
      // 3. If dropping on a card, use that card's position
      // 4. If dropping on a list sortable, use that list's id
      let targetListId: string | undefined
      let targetPosition = 0

      if (overId.startsWith('droppable-end-')) {
        // Dropping on end zone - place at end of list
        targetListId = extendedOverData?.listId
        targetPosition = extendedOverData?.position ?? 0
      } else if (overId.startsWith('droppable-')) {
        // Dropping on empty list zone
        targetListId = extendedOverData?.listId
        targetPosition = 0
      } else if (extendedOverData?.type === 'card' && extendedOverData.listId) {
        // Dropping on a card - use that card's position
        targetListId = extendedOverData.listId
        targetPosition = extendedOverData.card?.position ?? 0
      } else if (extendedOverData?.type === 'list') {
        targetListId = overId
        targetPosition = 0
      }

      if (!sourceListId || !targetListId) return

      if (sourceListId === targetListId && !overId.startsWith('droppable-')) {
        // Same list - reorder cards
        onReorderCards?.(sourceListId, [active.id as string, over.id as string])
      } else {
        // Different list or dropping on empty/end zone - move card to specific position
        onMoveCard?.(active.id as string, sourceListId, targetListId, targetPosition)
      }
    }
  }

  const activeList = activeType === 'list' ? localLists.find((l) => l.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
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
              <SortableContext
                items={localLists.map((l) => l.id)}
                strategy={horizontalListSortingStrategy}
              >
                {localLists.map((list) => (
                  <ListCard
                    key={list.id}
                    list={list}
                    onUpdateTitle={(title) => onUpdateList(list.id, title)}
                    onDelete={() => onDeleteList(list.id)}
                    isUpdating={isUpdating}
                    isDeleting={isDeleting}
                    dropIndicatorCardId={
                      overListId === list.id && overListId !== activeListId ? overCardId : null
                    }
                  />
                ))}
              </SortableContext>
              <AddListForm onAdd={onCreateList} isAdding={isCreating} />
            </>
          )}
        </div>
      </div>

      <DragOverlay>
        {activeList && (
          <div className="w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-600 p-4 rotate-3">
            <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100">
              {activeList.title}
            </h3>
          </div>
        )}
        {activeCard && (
          <div className="w-64 bg-white dark:bg-gray-700 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 p-2.5 rotate-2">
            <p className="text-sm text-gray-800 dark:text-gray-100">{activeCard.title}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
