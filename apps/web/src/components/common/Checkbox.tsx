interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: React.ReactNode
  'aria-label'?: string
}

const Checkbox = ({ checked, onChange, label, 'aria-label': ariaLabel }: CheckboxProps) => {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <div
        role="checkbox"
        aria-checked={checked}
        aria-label={ariaLabel}
        tabIndex={0}
        onClick={() => onChange(!checked)}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            onChange(!checked)
          }
        }}
        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200 ${
          checked
            ? 'border border-indigo-500 bg-indigo-500'
            : 'border border-white/[0.15] bg-transparent'
        }`}
      >
        {checked && (
          <span aria-hidden="true" className="text-white text-xs">
            ✓
          </span>
        )}
      </div>
      {label && <span className="text-[13px] text-[#8b8b9e] leading-relaxed">{label}</span>}
    </label>
  )
}

export default Checkbox
