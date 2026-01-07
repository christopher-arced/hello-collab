import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
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
  const baseClasses =
    'py-4 rounded-[10px] text-[15px] font-semibold border-none transition-all duration-300'

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 text-white shadow-lg shadow-indigo-500/35 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/45',
    secondary:
      'bg-white/[0.03] border border-white/[0.08] text-white hover:bg-white/[0.06] hover:border-white/[0.15]',
    ghost: 'bg-transparent text-white hover:bg-white/[0.05]',
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
