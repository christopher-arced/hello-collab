import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginInput } from '@hello/validation'
import { Input, Button } from '../../common'
import { useAuth } from '../../../hooks/useAuth'

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoggingIn, loginError } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  })

  const onSubmit = (data: LoginInput) => {
    login(data)
  }

  return (
    <>
      <div className="mb-2">
        <span className="text-[32px]">👋</span>
      </div>
      <h2 className="text-[32px] font-bold text-white mb-2 tracking-tight">Welcome back</h2>
      <p className="text-[15px] text-theme-dark-text-secondary mb-9">
        Sign in to continue to your workspace
      </p>

      {loginError && (
        <div role="alert" className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{loginError.message}</p>
        </div>
      )}

      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-5">
          <Input
            label="Email address"
            type="email"
            placeholder="you@company.com"
            leftElement="✉️"
            errorMessage={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[13px] font-medium text-theme-text-muted">Password</label>
            <a
              href="#"
              className="text-[13px] font-medium text-indigo-500 hover:text-indigo-400 transition-colors duration-200"
            >
              Forgot password?
            </a>
          </div>
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            leftElement="🔒"
            errorMessage={errors.password?.message}
            rightElement={
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(!showPassword)}
                className="bg-transparent border-none text-theme-text-secondary cursor-pointer p-1 text-sm"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            }
            {...register('password')}
          />
        </div>

        <Button variant="gradient" type="submit" fullWidth loading={isLoggingIn}>
          {isLoggingIn ? 'Signing in...' : 'Sign in →'}
        </Button>
      </form>

      <p className="text-center text-sm text-theme-dark-text-secondary mt-7">
        Don't have an account?{' '}
        <a
          href="/register"
          className="text-indigo-500 font-semibold no-underline hover:text-indigo-400 transition-colors duration-200"
        >
          Create one free →
        </a>
      </p>
    </>
  )
}

export default LoginForm
