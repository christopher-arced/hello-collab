interface IconProps {
  size?: number
  className?: string
}

const UserIcon = ({ size = 20, className }: IconProps) => (
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
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21v-1a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v1" />
  </svg>
)

export default UserIcon
