interface IconProps {
  size?: number
  className?: string
}

const LogoutIcon = ({ size = 20, className }: IconProps) => (
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
    {/* Door frame with exit arrow */}
    <path d="M14 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H14" />
    <path d="M10 12H3M3 12L6 9M3 12L6 15" />
  </svg>
)

export default LogoutIcon
