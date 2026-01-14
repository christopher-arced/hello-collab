const avatarColors = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#f43f5e', // rose
  '#22c55e', // green
  '#14b8a6', // teal
  '#0ea5e9', // sky
]

function getAvatarColor(name: string): string {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return avatarColors[hash % avatarColors.length]
}

interface UserAvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
}

export default function UserAvatar({ name, size = 'md' }: UserAvatarProps) {
  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white`}
      style={{ backgroundColor: getAvatarColor(name) }}
    >
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  )
}
