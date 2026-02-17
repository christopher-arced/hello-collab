interface IconProps {
  size?: number
  className?: string
}

const MenuIcon = ({ size = 20, className }: IconProps) => (
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
    <path d="M4 6H20" />
    <path d="M4 12H20" />
    <path d="M4 18H20" />
  </svg>
)

export default MenuIcon
