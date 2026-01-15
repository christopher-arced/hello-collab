interface IconProps {
  size?: number
  className?: string
}

const KeyIcon = ({ size = 20, className }: IconProps) => (
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
    <circle cx="8" cy="15" r="4" />
    <path d="M11.3 11.7L15 8l2 2" />
    <path d="M15 8l4-4" />
  </svg>
)

export default KeyIcon
