interface Avatar {
  color: string
  initials?: string
  showOnlineIndicator?: boolean
}

interface AvatarStackProps {
  avatars: Avatar[]
  size?: 'sm' | 'md'
  borderColor?: string
}

const AvatarStack = ({
  avatars,
  size = 'md',
  borderColor = 'border-theme-bg-surface dark:border-theme-dark-bg-surface',
}: AvatarStackProps) => {
  const sizeClasses = {
    sm: {
      avatar: 'w-7 h-7',
      indicator: 'w-2.5 h-2.5',
      overlap: '-ml-2',
      border: 'border-2',
      text: 'text-xs',
    },
    md: {
      avatar: 'w-9 h-9',
      indicator: 'w-3 h-3',
      overlap: '-ml-2.5',
      border: 'border-[3px]',
      text: 'text-xs',
    },
  }

  const classes = sizeClasses[size]

  return (
    <div className="flex">
      {avatars.map((avatar, i) => (
        <div
          key={i}
          className={`${classes.avatar} rounded-full ${avatar.color} ${classes.border} ${borderColor} flex items-center justify-center font-semibold text-white relative ${i > 0 ? classes.overlap : ''}`}
        >
          {avatar.initials && <span className={classes.text}>{avatar.initials}</span>}
          {avatar.showOnlineIndicator && (
            <span
              className={`absolute -bottom-0.5 -right-0.5 ${classes.indicator} bg-green-500 rounded-full ${classes.border} ${borderColor}`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default AvatarStack
