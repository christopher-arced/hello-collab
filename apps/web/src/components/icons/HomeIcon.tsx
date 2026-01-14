interface IconProps {
  size?: number
  className?: string
}

const HomeIcon = ({ size = 20, className }: IconProps) => (
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
    {/* Minimal geometric house - roof as chevron, base as rounded square */}
    <path d="M4 10L12 4L20 10" />
    <rect x="5" y="10" width="14" height="11" rx="2" />
    <path d="M10 21V15H14V21" />
  </svg>
)

export default HomeIcon
