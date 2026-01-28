import { Component, ReactNode } from 'react'
import Button from './Button'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-theme-bg dark:bg-theme-dark-bg flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-theme-text dark:text-theme-dark-text mb-2">
                Something went wrong
              </h1>
              <p className="text-theme-text-secondary dark:text-theme-dark-text-secondary mb-4">
                An unexpected error occurred. Please try again.
              </p>
              {this.state.error && (
                <details className="text-left mb-4 p-3 rounded-lg bg-black/5 dark:bg-white/5">
                  <summary className="text-sm text-theme-text-muted dark:text-theme-dark-text-muted cursor-pointer">
                    Error details
                  </summary>
                  <pre className="mt-2 text-xs text-red-500 overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={() => window.location.reload()}>
                Reload page
              </Button>
              <Button variant="primary" onClick={this.handleReset}>
                Try again
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
