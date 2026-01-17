import type { List } from '@hello/types'
import ListCard from './ListCard'
import AddListForm from './AddListForm'

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
                onDelete={() => onDeleteList(list.id)}
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
