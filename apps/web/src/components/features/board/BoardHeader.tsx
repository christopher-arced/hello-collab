import type { Board, SocketUser } from '@hello/types'
import { Button } from '@/components/common'
import { ActiveUsers } from './ActiveUsers'

interface BoardHeaderProps {
  board: Board
  isConnected: boolean
  activeUsers: SocketUser[]
  canEdit?: boolean
  onEdit: () => void
  onDelete: () => void
  onShare: () => void
}

export function BoardHeader({
  board,
  isConnected,
  activeUsers,
  canEdit,
  onEdit,
  onDelete,
  onShare,
}: BoardHeaderProps) {
  return (
    <div className="px-8 py-6" style={{ backgroundColor: board.bgColor }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">{board.title}</h1>
          {board.description && <p className="text-white/80 text-sm">{board.description}</p>}
        </div>
        <div className="flex items-center gap-4">
          {/* Connection indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-yellow-400'}`}
              title={isConnected ? 'Real-time sync active' : 'Connecting...'}
            />
            <ActiveUsers users={activeUsers} />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onShare}
              className="!bg-white/20 !border-white/30 !text-white hover:!bg-white/30"
            >
              <svg
                className="w-4 h-4 mr-1.5 inline-block"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              Share
            </Button>
            {canEdit && (
              <Button
                variant="outline"
                onClick={onEdit}
                className="!bg-white/20 !border-white/30 !text-white hover:!bg-white/30"
              >
                Edit Board
              </Button>
            )}
            {canEdit && (
              <Button
                variant="outline"
                onClick={onDelete}
                className="!bg-black/20 !border-black/20 !text-white hover:!bg-black/30"
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
