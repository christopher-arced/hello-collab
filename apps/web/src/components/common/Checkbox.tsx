interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: React.ReactNode
}

const Checkbox = ({ checked, onChange, label }: CheckboxProps) => {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200 ${
          checked
            ? 'border border-indigo-500 bg-indigo-500'
            : 'border border-white/[0.15] bg-transparent'
        }`}
      >
        {checked && <span className="text-white text-xs">✓</span>}
      </div>
      {label && <span className="text-[13px] text-[#8b8b9e] leading-relaxed">{label}</span>}
    </label>
  )
}

export default Checkbox
