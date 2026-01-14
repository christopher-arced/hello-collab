interface LogoProps {
  size?: 'sm' | 'lg'
  showText?: boolean
}

const LogoMark = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="50%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#d946ef" />
      </linearGradient>
    </defs>
    {/* Abstract H formed by three connected vertical bars with a horizontal bridge */}
    {/* Left column */}
    <rect x="6" y="8" width="10" height="32" rx="5" fill="url(#logoGradient)" />
    {/* Right column */}
    <rect x="32" y="8" width="10" height="32" rx="5" fill="url(#logoGradient)" />
    {/* Center connecting bridge - offset for visual interest */}
    <rect x="14" y="18" width="20" height="10" rx="5" fill="url(#logoGradient)" />
    {/* Collaboration dots - representing connected users/tasks */}
    <circle cx="11" cy="12" r="3" fill="white" fillOpacity="0.9" />
    <circle cx="37" cy="12" r="3" fill="white" fillOpacity="0.9" />
    <circle cx="24" cy="23" r="3" fill="white" fillOpacity="0.9" />
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
        <span className={`${config.text} font-semibold text-white tracking-tight`}>
          HelloCollab
        </span>
      )}
    </div>
  )
}

export default Logo
