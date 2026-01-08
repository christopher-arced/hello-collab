import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { registerSchema } from '@hello/validation'
import { Input, Button, Checkbox } from '../../common'
import { useAuth } from '../../../hooks/useAuth'

const registerFormSchema = registerSchema
  .extend({
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerFormSchema>

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const { register: registerUser, isRegistering, registerError } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    mode: 'onBlur',
  })

  const password = watch('password')
  const confirmPassword = watch('confirmPassword')
  const passwordsMatch = password && confirmPassword && password === confirmPassword

  const onSubmit = (data: RegisterFormData) => {
    if (!agreedToTerms) return

    registerUser({
      name: data.name,
      email: data.email,
      password: data.password,
    })
  }

  const getPasswordStrength = (pwd: string | undefined) => {
    if (!pwd) return { level: 0, text: '', color: 'bg-gray-700' }
    if (pwd.length < 6) return { level: 1, text: 'Weak', color: 'bg-red-500' }
    if (pwd.length < 10) return { level: 2, text: 'Fair', color: 'bg-amber-500' }
    if (pwd.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)) {
      return { level: 4, text: 'Strong', color: 'bg-green-500' }
    }
    return { level: 3, text: 'Good', color: 'bg-blue-500' }
  }

  const passwordStrength = getPasswordStrength(password)

  const getPasswordStrengthTextColor = () => {
    switch (passwordStrength.level) {
      case 1:
        return 'text-red-500'
      case 2:
        return 'text-amber-500'
      case 3:
        return 'text-blue-500'
      case 4:
        return 'text-green-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <>
      <h2 className="text-[28px] font-semibold text-white mb-2 tracking-tight">
        Create your account
      </h2>

      {registerError && (
        <div role="alert" className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{registerError.message}</p>
        </div>
      )}

      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-[18px]">
          <Input
            label="Full name"
            type="text"
            placeholder="John Doe"
            leftElement="👤"
            errorMessage={errors.name?.message}
            {...register('name')}
          />
        </div>

        <div className="mb-[18px]">
          <Input
            label="Work email"
            type="email"
            placeholder="you@company.com"
            leftElement="✉️"
            errorMessage={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div className="mb-[18px]">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
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

          {password && !errors.password && (
            <div className="mt-2.5">
              <div className="flex gap-1 mb-1.5">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`flex-1 h-[3px] rounded-sm transition-all duration-300 ${
                      level <= passwordStrength.level
                        ? passwordStrength.color
                        : 'bg-theme-dark-border'
                    }`}
                  />
                ))}
              </div>
              <span className={`text-xs font-medium ${getPasswordStrengthTextColor()}`}>
                {passwordStrength.text}
              </span>
            </div>
          )}
        </div>

        <div className="mb-6">
          <Input
            label="Confirm password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
            leftElement="🔐"
            errorMessage={errors.confirmPassword?.message}
            rightElement={
              passwordsMatch ? <span className="text-green-500 text-base">✓</span> : null
            }
            {...register('confirmPassword')}
          />
        </div>

        <div className="mb-6">
          <Checkbox
            checked={agreedToTerms}
            onChange={setAgreedToTerms}
            aria-label="Agree to Terms of Service and Privacy Policy"
            label={
              <>
                I agree to the{' '}
                <a href="#" className="text-indigo-500 no-underline hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-indigo-500 no-underline hover:underline">
                  Privacy Policy
                </a>
              </>
            }
          />
        </div>

        <Button
          variant="gradient"
          type="submit"
          fullWidth
          disabled={!agreedToTerms || isRegistering}
        >
          {isRegistering ? 'Creating account...' : 'Create account →'}
        </Button>
      </form>
    </>
  )
}

export default RegisterForm
