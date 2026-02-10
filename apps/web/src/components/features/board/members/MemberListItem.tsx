import type { BoardMember, Role } from '@hello/types'
import { Avatar } from '@/components/common/Avatar'
import { CloseIcon } from '@/components/icons'
import { RoleBadge } from './RoleBadge'
import { RoleSelector } from './RoleSelector'

interface MemberListItemProps {
  member: BoardMember
  isCurrentUser: boolean
  canEditRole: boolean
  canRemove: boolean
  isUpdating: boolean
  onRoleChange: (role: Role) => void
  onRemove: () => void
}

export function MemberListItem({
  member,
  isCurrentUser,
  canEditRole,
  canRemove,
  isUpdating,
  onRoleChange,
  onRemove,
}: MemberListItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-black/5 dark:bg-white/5">
      <Avatar name={member.user?.name ?? 'Unknown'} avatarUrl={member.user?.avatarUrl} size="md" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-theme-text dark:text-theme-dark-text truncate">
            {member.user?.name ?? 'Unknown'}
            {isCurrentUser && (
              <span className="text-xs text-theme-text-secondary dark:text-theme-dark-text-secondary ml-1">
                (you)
              </span>
            )}
          </p>
        </div>
        <p className="text-sm text-theme-text-secondary dark:text-theme-dark-text-secondary truncate">
          {member.user?.email}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {canEditRole ? (
          <RoleSelector
            currentRole={member.role}
            onRoleChange={onRoleChange}
            disabled={isUpdating}
          />
        ) : (
          <RoleBadge role={member.role} />
        )}

        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 text-theme-text-secondary dark:text-theme-dark-text-secondary hover:text-red-500 dark:hover:text-red-400 transition-colors"
            aria-label={`Remove ${member.user?.name}`}
          >
            <CloseIcon size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
