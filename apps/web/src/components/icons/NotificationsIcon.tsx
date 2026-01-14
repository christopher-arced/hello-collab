interface IconProps {
  size?: number
  className?: string
}

const NotificationsIcon = ({ size = 20, className }: IconProps) => (
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
    {/* Rounded bell with softer curves */}
    <path d="M12 3C8.5 3 6 5.5 6 9V14L4 17H20L18 14V9C18 5.5 15.5 3 12 3Z" />
    <circle cx="12" cy="20" r="2" />
  </svg>
)

export default NotificationsIcon
