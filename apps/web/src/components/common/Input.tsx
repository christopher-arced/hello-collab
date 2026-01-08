import { forwardRef, InputHTMLAttributes, useId, useState } from 'react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label?: string
  leftElement?: React.ReactNode
  rightElement?: React.ReactNode
  error?: boolean
  errorMessage?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, leftElement, rightElement, error, errorMessage, id, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const generatedId = useId()
    const inputId = id || generatedId
    const errorId = `${inputId}-error`

    const hasError = error || !!errorMessage

    const getInputClassName = () => {
      const baseClasses =
        'w-full py-3.5 rounded-[10px] text-white text-[15px] transition-all duration-200 placeholder:text-theme-dark-text-muted focus:outline-none'

      const paddingClasses = leftElement ? 'pl-11' : 'pl-4'
      const rightPaddingClasses = rightElement ? 'pr-11' : 'pr-4'

      if (hasError) {
        return `${baseClasses} ${paddingClasses} ${rightPaddingClasses} bg-white/[0.02] border border-red-500/50`
      }

      if (isFocused) {
        return `${baseClasses} ${paddingClasses} ${rightPaddingClasses} bg-indigo-500/5 border border-indigo-500/50`
      }

      return `${baseClasses} ${paddingClasses} ${rightPaddingClasses} bg-white/[0.02] border border-white/[0.08]`
    }

    return (
      <div>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[13px] font-medium text-theme-text-muted mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            aria-invalid={hasError}
            aria-describedby={errorMessage ? errorId : undefined}
            {...props}
            className={getInputClassName()}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
          />
          {leftElement && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base opacity-50">
              {leftElement}
            </span>
          )}
          {rightElement && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</span>
          )}
        </div>
        {errorMessage && (
          <p id={errorId} role="alert" className="mt-1.5 text-xs text-red-500">
            {errorMessage}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
