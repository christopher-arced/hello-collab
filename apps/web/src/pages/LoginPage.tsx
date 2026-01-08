import { Button } from '@/components/common'
import AvatarStack from '../components/features/auth/AvatarStack'
import FeaturePill from '../components/features/auth/FeaturePill'
import GradientOrb from '../components/features/auth/GradientOrb'
import GridPattern from '../components/features/auth/GridPattern'
import Logo from '../components/features/auth/Logo'
import LoginForm from '../components/features/auth/LoginForm'
import WindowControls from '../components/features/auth/WindowControls'
import { Link } from 'react-router-dom'

const LoginPage = () => {
  return (
    <div className="min-h-screen flex bg-theme-dark-bg-base font-sans relative overflow-hidden">
      {/* Left Panel - Login Form */}
      <div className="w-[520px] bg-theme-dark-bg-panel border-r border-white/[0.06] flex flex-col justify-center px-14 py-12 relative">
        {/* Logo */}
        <div className="absolute top-8 left-14">
          <Logo size="sm" />
        </div>

        {/* Sign Up Link - Top Right */}
        <div className="absolute top-8 right-14 flex items-center gap-2">
          <span className="text-sm text-theme-dark-text-secondary">Need an account?</span>
          <Link to="/register">
            <Button variant="outline">Sign up</Button>
          </Link>
        </div>

        <div className="max-w-[400px] mx-auto w-full">
          <LoginForm />
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 left-14 right-14 flex justify-between items-center">
          <span className="text-xs text-theme-dark-text-muted">© 2026 HelloCollab</span>
          <div className="flex gap-5">
            <a
              href="#"
              className="text-xs text-theme-dark-text-muted no-underline hover:text-theme-dark-text-secondary"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-xs text-theme-dark-text-muted no-underline hover:text-theme-dark-text-secondary"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-xs text-theme-dark-text-muted no-underline hover:text-theme-dark-text-secondary"
            >
              Help
            </a>
          </div>
        </div>
      </div>

      {/* Right Panel - Feature Showcase */}
      <div className="flex-1 bg-gradient-to-br from-theme-dark-bg-elevated via-theme-dark-bg-surface to-theme-dark-bg-deep flex flex-col justify-center items-center p-[60px] relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gradient Orbs */}
          <GradientOrb
            position="top-[20%] right-[20%]"
            size="w-[500px] h-[500px]"
            blur="blur-[80px]"
            color="bg-indigo-500/[0.12]"
          />
          <GradientOrb
            position="bottom-[10%] left-[20%]"
            size="w-[400px] h-[400px]"
            blur="blur-[60px]"
            color="bg-violet-500/10"
            delay="[animation-delay:3s]"
          />

          {/* Grid Pattern */}
          <GridPattern size={80} opacity={0.015} maskRadius={30} />
        </div>

        {/* App Preview Card */}
        <div className="relative w-full max-w-[600px] z-10">
          {/* Decorative Badge */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 py-2 px-4 bg-indigo-500/15 border border-indigo-500/30 rounded-[20px] flex items-center gap-2 z-20">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-glow" />
            <span className="text-xs font-medium text-indigo-300 tracking-wide">
              LIVE COLLABORATION
            </span>
          </div>

          {/* Mock App Window */}
          <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] rounded-[20px] border border-white/[0.08] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
            {/* Window Header */}
            <div className="py-3.5 px-5 border-b border-white/[0.06] flex items-center gap-3">
              <WindowControls />
              <div className="flex-1 flex justify-center">
                <div className="py-1.5 px-6 bg-white/[0.03] rounded-lg text-xs text-theme-dark-text-secondary">
                  app.hellocollab.io
                </div>
              </div>
            </div>

            {/* App Content */}
            <div className="p-6 flex gap-4">
              {/* Kanban Columns */}
              {[
                { title: 'To Do', color: 'bg-indigo-500', textColor: 'text-indigo-500', cards: 3 },
                {
                  title: 'In Progress',
                  color: 'bg-amber-500',
                  textColor: 'text-amber-500',
                  cards: 2,
                },
                { title: 'Done', color: 'bg-green-500', textColor: 'text-green-500', cards: 4 },
              ].map((column, i) => (
                <div key={i} className="flex-1 bg-white/[0.02] rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2 h-2 rounded-full ${column.color}`} />
                    <span className="text-xs font-semibold text-white">{column.title}</span>
                    <span className="text-[11px] text-theme-dark-text-muted ml-auto">
                      {column.cards}
                    </span>
                  </div>

                  {/* Cards */}
                  {[...Array(Math.min(column.cards, 2))].map((_, j) => (
                    <div
                      key={j}
                      className="bg-white/[0.03] rounded-lg p-2.5 mb-2 border border-white/[0.04] animate-float"
                      style={{ animationDelay: `${i * 0.5 + j * 0.3}s` }}
                    >
                      <div className="w-4/5 h-2 bg-white/[0.08] rounded mb-2" />
                      <div className="flex justify-between items-center">
                        <div
                          className={`w-[18px] h-[18px] rounded-full ${column.color} opacity-60`}
                        />
                        <div
                          className={`py-0.5 px-1.5 ${column.color}/20 rounded text-[9px] ${column.textColor}`}
                        >
                          Tag
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Active Users Bar */}
            <div className="py-3 px-6 border-t border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AvatarStack
                  size="sm"
                  avatars={[
                    { color: 'bg-indigo-500', showOnlineIndicator: true },
                    { color: 'bg-green-500' },
                    { color: 'bg-amber-500' },
                  ]}
                />
                <span className="text-xs text-theme-dark-text-secondary">
                  3 team members online
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-theme-dark-text-muted">Synced</span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              </div>
            </div>
          </div>

          {/* Feature Pills */}
          <div className="flex justify-center gap-3 mt-8 flex-wrap">
            <FeaturePill icon="⚡" text="Real-time sync" delay={0.3} />
            <FeaturePill icon="🔒" text="Enterprise security" delay={0.4} />
            <FeaturePill icon="📱" text="Mobile ready" delay={0.5} />
          </div>
        </div>

        {/* Testimonial */}
        <div className="absolute bottom-[60px] left-[60px] right-[60px] flex items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-lg font-semibold text-white">
            SC
          </div>
          <div>
            <p className="text-sm text-theme-dark-text-secondary m-0 italic">
              "HelloCollab transformed how our team works together."
            </p>
            <p className="text-xs text-theme-dark-text-muted mt-1">
              Sarah Chen, Product Lead at TechCorp
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
