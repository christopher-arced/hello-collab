import { forwardRef } from 'react'

interface AvatarProps {
  name: string
  avatarUrl?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showOnlineIndicator?: boolean
  className?: string
}

const AVATAR_COLORS = [
  'bg-indigo-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-rose-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-blue-500',
]

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
}

const INDICATOR_SIZES = {
  xs: 'w-1.5 h-1.5 border',
  sm: 'w-2.5 h-2.5 border-2',
  md: 'w-3 h-3 border-2',
  lg: 'w-3.5 h-3.5 border-2',
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getAvatarColor(name: string): string {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ name, avatarUrl, size = 'md', showOnlineIndicator = false, className = '' }, ref) => {
    const sizeClass = SIZE_CLASSES[size]
    const indicatorSize = INDICATOR_SIZES[size]

    return (
      <div ref={ref} className={`relative inline-block ${className}`}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className={`${sizeClass} rounded-full border-2 border-white/20 object-cover`}
          />
        ) : (
          <div
            className={`${sizeClass} rounded-full border-2 border-white/20 flex items-center justify-center font-semibold text-white ${getAvatarColor(name)}`}
          >
            {getInitials(name)}
          </div>
        )}
        {showOnlineIndicator && (
          <div
            className={`absolute bottom-0 right-0 ${indicatorSize} bg-green-500 rounded-full border-white/20`}
          />
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'

interface AvatarGroupProps {
  children: React.ReactNode
  max?: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

export function AvatarGroup({ children, max = 5, size = 'sm' }: AvatarGroupProps) {
  const childArray = Array.isArray(children) ? children : [children]
  const displayChildren = childArray.slice(0, max)
  const remainingCount = childArray.length - max

  return (
    <div className="flex -space-x-2">
      {displayChildren}
      {remainingCount > 0 && (
        <div
          className={`${SIZE_CLASSES[size]} rounded-full border-2 border-white/20 bg-white/10 flex items-center justify-center font-semibold text-white`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  )
}
