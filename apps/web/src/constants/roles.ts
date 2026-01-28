import { Role } from '@hello/types'

export const ROLE_CONFIG: Record<Role, { label: string; colorClass: string }> = {
  [Role.OWNER]: {
    label: 'Owner',
    colorClass: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  },
  [Role.EDITOR]: {
    label: 'Editor',
    colorClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  [Role.VIEWER]: {
    label: 'Viewer',
    colorClass: 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-300',
  },
}

export const ASSIGNABLE_ROLES: Role[] = [Role.EDITOR, Role.VIEWER]
export const ALL_ROLES: Role[] = [Role.OWNER, Role.EDITOR, Role.VIEWER]
