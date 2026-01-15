interface LogoProps {
  size?: 'sm' | 'lg'
  showText?: boolean
}

const LogoMark = ({ size }: { size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#d946ef" />
      </linearGradient>
    </defs>
    <rect x="6" y="8" width="10" height="32" rx="3" fill="#6366f1" />
    <rect x="19" y="8" width="10" height="32" rx="3" fill="#8b5cf6" />
    <rect x="32" y="8" width="10" height="32" rx="3" fill="#d946ef" />
    <rect x="8" y="12" width="6" height="6" rx="1.5" fill="white" opacity="0.9" />
    <rect x="8" y="21" width="6" height="4" rx="1" fill="white" opacity="0.5" />
    <rect x="21" y="12" width="6" height="8" rx="1.5" fill="white" opacity="0.9" />
    <rect x="21" y="23" width="6" height="5" rx="1" fill="white" opacity="0.5" />
    <rect x="34" y="12" width="6" height="5" rx="1.5" fill="white" opacity="0.9" />
    <rect x="34" y="20" width="6" height="7" rx="1.5" fill="white" opacity="0.7" />
    <rect x="34" y="30" width="6" height="4" rx="1" fill="white" opacity="0.4" />
  </svg>
)

const Logo = ({ size = 'sm', showText = true }: LogoProps) => {
  const sizeConfig = {
    sm: { icon: 40, gap: 'gap-2.5', text: 'text-lg' },
    lg: { icon: 56, gap: 'gap-3.5', text: 'text-[28px]' },
  }

  const config = sizeConfig[size]

  return (
    <div className={`flex items-center ${config.gap}`}>
      <LogoMark size={config.icon} />
      {showText && (
        <span
          className={`${config.text} font-semibold text-theme-text dark:text-white tracking-tight`}
        >
          HelloCollab
        </span>
      )}
    </div>
  )
}

export default Logo
