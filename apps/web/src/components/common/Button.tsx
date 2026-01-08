import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'gradient' | 'secondary' | 'ghost' | 'outline'
  fullWidth?: boolean
}

const Button = ({
  variant = 'primary',
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const baseClasses = 'transition-all duration-200'

  const variantClasses = {
    primary:
      "py-2 px-4 bg-indigo-500 border-none rounded-lg text-white flex items-center justify-center gap-1.5 font-['DM_Sans','Segoe_UI',sans-serif] text-sm font-medium shadow-[0_4px_12px_rgba(99,102,241,0.3)] hover:bg-indigo-400",
    gradient:
      'py-4 border-none rounded-[10px] text-[15px] font-semibold bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 text-white shadow-lg shadow-indigo-500/35 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/45',
    secondary:
      'py-4 rounded-[10px] text-[15px] font-semibold bg-white/[0.03] border border-white/[0.08] text-white hover:bg-white/[0.06] hover:border-white/[0.15]',
    ghost:
      'py-4 border-none rounded-[10px] text-[15px] font-semibold bg-transparent text-white hover:bg-white/[0.05]',
    outline:
      'py-2 px-4 bg-transparent border border-white/10 rounded-lg text-white text-sm font-medium hover:bg-white/5 hover:border-white/20',
  }

  const widthClasses = fullWidth ? 'w-full' : ''
  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed hover:transform-none hover:shadow-lg'
    : 'cursor-pointer'

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${widthClasses} ${disabledClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
