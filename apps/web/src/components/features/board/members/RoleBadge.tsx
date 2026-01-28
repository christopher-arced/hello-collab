import type { Role } from '@hello/types'
import { ROLE_CONFIG } from '@/constants/roles'

interface RoleBadgeProps {
  role: Role
  className?: string
}

export function RoleBadge({ role, className = '' }: RoleBadgeProps) {
  const config = ROLE_CONFIG[role]

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${config.colorClass} ${className}`}>
      {config.label}
    </span>
  )
}
