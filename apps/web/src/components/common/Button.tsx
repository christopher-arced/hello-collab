import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'gradient' | 'secondary' | 'ghost' | 'outline'
  fullWidth?: boolean
  loading?: boolean
}

const Spinner = () => (
  <div className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
)

const Button = ({
  variant = 'primary',
  fullWidth = false,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const isDisabled = disabled || loading

  const baseClasses = 'transition-all duration-300 flex items-center justify-center gap-2.5'

  const variantClasses = {
    primary:
      "py-2 px-4 bg-indigo-500 border-none rounded-lg text-white font-['DM_Sans','Segoe_UI',sans-serif] text-sm font-medium shadow-[0_4px_12px_rgba(99,102,241,0.3)] hover:bg-indigo-400",
    gradient:
      'py-4 px-4 border-none rounded-xl text-[15px] font-semibold bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 bg-[length:200%_200%] text-white shadow-[0_8px_32px_rgba(99,102,241,0.35)] hover:shadow-[0_12px_40px_rgba(99,102,241,0.45)]',
    secondary:
      'py-4 px-4 rounded-xl text-[15px] font-semibold bg-white/[0.03] border border-white/[0.08] text-white hover:bg-white/[0.06] hover:border-white/[0.15]',
    ghost:
      'py-4 px-4 border-none rounded-xl text-[15px] font-semibold bg-transparent text-white hover:bg-white/[0.05]',
    outline:
      'py-2 px-4 bg-transparent border border-white/10 rounded-lg text-white text-sm font-medium hover:bg-white/5 hover:border-white/20',
  }

  const widthClasses = fullWidth ? 'w-full' : ''

  const getDisabledClasses = () => {
    if (!isDisabled) return 'cursor-pointer'

    if (variant === 'gradient' && loading) {
      return 'cursor-not-allowed bg-indigo-500/50 shadow-none hover:transform-none hover:shadow-none'
    }

    return 'opacity-50 cursor-not-allowed hover:transform-none hover:shadow-none'
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${widthClasses} ${getDisabledClasses()} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <>
          <Spinner />
          {children}
        </>
      ) : (
        children
      )}
    </button>
  )
}

export default Button
