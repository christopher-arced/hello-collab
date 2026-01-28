import type { SocketUser } from '@hello/types'
import { Avatar, AvatarGroup } from '@/components/common/Avatar'

interface ActiveUsersProps {
  users: SocketUser[]
  maxDisplay?: number
}

export function ActiveUsers({ users, maxDisplay = 5 }: ActiveUsersProps) {
  if (users.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-white/70 font-medium">Active:</span>
      <AvatarGroup max={maxDisplay} size="sm">
        {users.map((user) => (
          <div key={user.id} className="relative group">
            <Avatar name={user.name} avatarUrl={user.avatarUrl} size="sm" showOnlineIndicator />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              {user.name}
            </div>
          </div>
        ))}
      </AvatarGroup>
    </div>
  )
}
