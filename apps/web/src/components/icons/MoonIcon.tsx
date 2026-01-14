interface IconProps {
  size?: number
  className?: string
}

const MoonIcon = ({ size = 20, className }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Crescent moon with small stars */}
    <path d="M18 12C18 15.866 14.866 19 11 19C7.13401 19 4 15.866 4 12C4 8.13401 7.13401 5 11 5C9.5 7 9.5 10 11 12C12.5 14 15.5 14.5 18 12Z" />
    <circle cx="18" cy="6" r="1" fill="currentColor" />
    <circle cx="20" cy="10" r="0.5" fill="currentColor" />
  </svg>
)

export default MoonIcon
