import { Button } from '@/components/common'
import { MoonIcon, SunIcon } from '@/components/icons'
import { useThemeStore } from '@/stores'
import AvatarStack from '../components/features/auth/AvatarStack'
import FloatingCard from '../components/features/auth/FloatingCard'
import GradientOrb from '../components/features/auth/GradientOrb'
import GridPattern from '../components/features/auth/GridPattern'
import Logo from '../components/features/auth/Logo'
import RegisterForm from '../components/features/auth/RegisterForm'
import { Link } from 'react-router-dom'

const RegisterPage = () => {
  const { resolvedTheme, toggleTheme } = useThemeStore()

  return (
    <div className="min-h-screen flex bg-theme-bg-base dark:bg-theme-dark-bg-base font-sans relative overflow-hidden">
      {/* Left Panel - Branding & Graphics */}
      <div className="flex-1 bg-gradient-to-br from-theme-bg-elevated dark:from-theme-dark-bg-elevated via-theme-bg-surface dark:via-theme-dark-bg-surface to-theme-bg-deep dark:to-theme-dark-bg-deep flex flex-col justify-center items-center p-[60px] relative">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gradient Orbs */}
          <GradientOrb
            position="top-[10%] left-[20%]"
            size="w-[400px] h-[400px]"
            blur="blur-[60px]"
            color="bg-indigo-500/15"
          />
          <GradientOrb
            position="bottom-[20%] right-[10%]"
            size="w-[300px] h-[300px]"
            blur="blur-[50px]"
            color="bg-fuchsia-500/10"
            delay="[animation-delay:2s]"
          />
          <GradientOrb
            position="top-[60%] left-[10%]"
            size="w-[250px] h-[250px]"
            blur="blur-[40px]"
            color="bg-green-500/10"
            delay="[animation-delay:4s]"
          />

          {/* Floating Cards */}
          <FloatingCard position="top-[15%] left-[15%]" rotation="-rotate-12" />
          <FloatingCard
            position="top-[25%] right-[20%]"
            rotation="rotate-[8deg]"
            delay="[animation-delay:2s]"
          />
          <FloatingCard
            position="bottom-[30%] left-[25%]"
            rotation="-rotate-[5deg]"
            delay="[animation-delay:4s]"
          />
          <FloatingCard
            position="bottom-[15%] right-[15%]"
            rotation="rotate-[15deg]"
            delay="[animation-delay:1s]"
          />

          {/* Grid Pattern */}
          <GridPattern size={60} opacity={0.02} maskRadius={20} />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-[500px]">
          {/* Logo */}
          <div className="flex justify-center mb-12">
            <Logo size="lg" />
          </div>

          <h1 className="text-[44px] font-bold text-theme-text dark:text-white leading-tight mb-5 tracking-tight">
            Where teams
            <br />
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              collaborate in flow
            </span>
          </h1>

          <p className="text-[17px] text-theme-text-secondary dark:text-theme-dark-text-secondary leading-relaxed mb-10">
            Join thousands of teams managing projects with real-time collaboration, intuitive
            boards, and seamless workflows.
          </p>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-4">
            <AvatarStack
              size="md"
              borderColor="border-theme-bg-elevated dark:border-theme-dark-bg-elevated"
              avatars={[
                { color: 'bg-indigo-500', initials: 'SC' },
                { color: 'bg-green-500', initials: 'AR' },
                { color: 'bg-amber-500', initials: 'JP' },
                { color: 'bg-pink-500', initials: 'MK' },
                { color: 'bg-blue-500', initials: 'TL' },
              ]}
            />
            <div className="text-left">
              <p className="text-sm font-semibold text-theme-text dark:text-white m-0">
                10,000+ teams
              </p>
              <p className="text-[13px] text-theme-text-secondary m-0">already collaborating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="w-[520px] bg-theme-bg-panel dark:bg-theme-dark-bg-panel border-l border-black/[0.06] dark:border-white/[0.06] flex flex-col justify-center px-14 py-12 relative">
        <div className="absolute top-8 right-14 flex items-center gap-4">
          <button
            aria-label="Toggle theme"
            title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-theme-text-secondary dark:text-theme-dark-text-secondary hover:bg-theme-bg-hover dark:hover:bg-theme-dark-bg-hover transition-colors border-none bg-transparent cursor-pointer"
          >
            {resolvedTheme === 'dark' ? <MoonIcon size={18} /> : <SunIcon size={18} />}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-theme-text-secondary dark:text-theme-dark-text-secondary">
              Already have an account?
            </span>
            <Link to="/login">
              <Button variant="outline">Sign in</Button>
            </Link>
          </div>
        </div>
        <div className="max-w-[400px] mx-auto w-full">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
