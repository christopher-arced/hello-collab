import type { Board, SocketUser } from '@hello/types'
import { Button } from '@/components/common'
import { MenuIcon } from '@/components/icons'
import { ActiveUsers } from './ActiveUsers'

interface BoardHeaderProps {
  board: Board
  isConnected: boolean
  activeUsers: SocketUser[]
  canEdit?: boolean
  isOwner?: boolean
  onEdit: () => void
  onDelete: () => void
  onShare: () => void
  onMenuToggle?: () => void
}

export function BoardHeader({
  board,
  isConnected,
  activeUsers,
  canEdit,
  isOwner,
  onEdit,
  onDelete,
  onShare,
  onMenuToggle,
}: BoardHeaderProps) {
  return (
    <div className="px-4 py-4 md:px-8 md:py-6" style={{ backgroundColor: board.bgColor }}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          {onMenuToggle && (
            <button
              aria-label="Open menu"
              onClick={onMenuToggle}
              className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center bg-white/20 border-none text-white cursor-pointer hover:bg-white/30 transition-colors"
            >
              <MenuIcon size={20} />
            </button>
          )}
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white mb-1">{board.title}</h1>
            {board.description && <p className="text-white/80 text-sm">{board.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
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
                className="w-4 h-4 md:mr-1.5 inline-block"
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
              <span className="hidden md:inline">Share</span>
            </Button>
            {canEdit && (
              <Button
                variant="outline"
                onClick={onEdit}
                className="!bg-white/20 !border-white/30 !text-white hover:!bg-white/30"
              >
                <svg
                  className="w-4 h-4 md:mr-1.5 inline-block md:hidden"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <span className="hidden md:inline">Edit Board</span>
                <span className="md:hidden">Edit</span>
              </Button>
            )}
            {isOwner && (
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
