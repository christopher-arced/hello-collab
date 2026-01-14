interface IconProps {
  size?: number
  className?: string
}

const CreateIcon = ({ size = 20, className }: IconProps) => (
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
    <path d="M12 5V19" />
    <path d="M5 12H19" />
  </svg>
)

export default CreateIcon
