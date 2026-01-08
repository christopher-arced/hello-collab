import { Button } from '@/components/common'
import RegisterForm from '../components/features/auth/RegisterForm'
import { Link } from 'react-router-dom'

const RegisterPage = () => {
  return (
    <div className="min-h-screen flex bg-theme-dark-bg-base font-sans relative overflow-hidden">
      {/* Left Panel - Branding & Graphics */}
      <div className="flex-1 bg-gradient-to-br from-theme-dark-bg-elevated via-theme-dark-bg-surface to-theme-dark-bg-deep flex flex-col justify-center items-center p-[60px] relative">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gradient Orbs */}
          <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] rounded-full blur-[60px] animate-pulse-glow bg-indigo-500/15" />
          <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] rounded-full blur-[50px] animate-pulse-glow bg-fuchsia-500/10 [animation-delay:2s]" />
          <div className="absolute top-[60%] left-[10%] w-[250px] h-[250px] rounded-full blur-[40px] animate-pulse-glow bg-green-500/10 [animation-delay:4s]" />

          {/* Floating Cards */}
          <div className="absolute top-[15%] left-[15%] w-[180px] h-[100px] bg-gradient-to-br from-white/[0.03] to-white/[0.01] rounded-xl border border-white/5 backdrop-blur-lg animate-float -rotate-12">
            <div className="p-3 border-b border-white/5">
              <div className="w-20 h-2 bg-white/10 rounded" />
            </div>
            <div className="p-3 flex gap-1.5">
              <div className="w-5 h-5 rounded-full bg-indigo-500/30" />
              <div>
                <div className="w-[60px] h-1.5 bg-white/[0.08] rounded mb-1" />
                <div className="w-10 h-1.5 bg-white/5 rounded" />
              </div>
            </div>
          </div>

          <div className="absolute top-[25%] right-[20%] w-[180px] h-[100px] bg-gradient-to-br from-white/[0.03] to-white/[0.01] rounded-xl border border-white/5 backdrop-blur-lg animate-float rotate-[8deg] [animation-delay:2s]">
            <div className="p-3 border-b border-white/5">
              <div className="w-20 h-2 bg-white/10 rounded" />
            </div>
            <div className="p-3 flex gap-1.5">
              <div className="w-5 h-5 rounded-full bg-indigo-500/30" />
              <div>
                <div className="w-[60px] h-1.5 bg-white/[0.08] rounded mb-1" />
                <div className="w-10 h-1.5 bg-white/5 rounded" />
              </div>
            </div>
          </div>

          <div className="absolute bottom-[30%] left-[25%] w-[180px] h-[100px] bg-gradient-to-br from-white/[0.03] to-white/[0.01] rounded-xl border border-white/5 backdrop-blur-lg animate-float -rotate-[5deg] [animation-delay:4s]">
            <div className="p-3 border-b border-white/5">
              <div className="w-20 h-2 bg-white/10 rounded" />
            </div>
            <div className="p-3 flex gap-1.5">
              <div className="w-5 h-5 rounded-full bg-indigo-500/30" />
              <div>
                <div className="w-[60px] h-1.5 bg-white/[0.08] rounded mb-1" />
                <div className="w-10 h-1.5 bg-white/5 rounded" />
              </div>
            </div>
          </div>

          <div className="absolute bottom-[15%] right-[15%] w-[180px] h-[100px] bg-gradient-to-br from-white/[0.03] to-white/[0.01] rounded-xl border border-white/5 backdrop-blur-lg animate-float rotate-[15deg] [animation-delay:1s]">
            <div className="p-3 border-b border-white/5">
              <div className="w-20 h-2 bg-white/10 rounded" />
            </div>
            <div className="p-3 flex gap-1.5">
              <div className="w-5 h-5 rounded-full bg-indigo-500/30" />
              <div>
                <div className="w-[60px] h-1.5 bg-white/[0.08] rounded mb-1" />
                <div className="w-10 h-1.5 bg-white/5 rounded" />
              </div>
            </div>
          </div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-[500px]">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3.5 mb-12">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/40 animate-gradient-shift bg-[length:200%_200%]">
              <span className="text-[28px] font-bold text-white font-mono">H</span>
            </div>
            <span className="text-[28px] font-semibold text-white tracking-tight">HelloCollab</span>
          </div>

          <h1 className="text-[44px] font-bold text-white leading-tight mb-5 tracking-tight">
            Where teams
            <br />
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              collaborate in flow
            </span>
          </h1>

          <p className="text-[17px] text-theme-dark-text-secondary leading-relaxed mb-10">
            Join thousands of teams managing projects with real-time collaboration, intuitive
            boards, and seamless workflows.
          </p>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex">
              {['bg-indigo-500', 'bg-green-500', 'bg-amber-500', 'bg-pink-500', 'bg-blue-500'].map(
                (color, i) => (
                  <div
                    key={i}
                    className={`w-9 h-9 rounded-full ${color} border-[3px] border-theme-dark-bg-elevated flex items-center justify-center text-xs font-semibold text-white ${i > 0 ? '-ml-2.5' : ''}`}
                  >
                    {['SC', 'AR', 'JP', 'MK', 'TL'][i]}
                  </div>
                )
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white m-0">10,000+ teams</p>
              <p className="text-[13px] text-theme-text-secondary m-0">already collaborating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="w-[520px] bg-theme-dark-bg-panel border-l border-white/[0.06] flex flex-col justify-center px-14 py-12 relative">
        <div className="absolute top-8 right-14 flex items-center gap-2">
          <span className="text-sm text-theme-text-secondary">Already have an account?</span>
          <Link to="/login">
            <Button variant="outline">Sign in</Button>
          </Link>
        </div>
        <div className="max-w-[400px] mx-auto w-full">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
