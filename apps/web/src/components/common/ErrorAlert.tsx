interface ErrorAlertProps {
  message: string
  className?: string
}

export default function ErrorAlert({ message, className = '' }: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className={`mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 ${className}`.trim()}
    >
      <p className="text-sm text-red-400">{message}</p>
    </div>
  )
}
