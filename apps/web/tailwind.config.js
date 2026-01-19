/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'SF Pro Display', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Light theme (default)
        theme: {
          'bg-base': '#f5f5f5',
          bg: '#fafafa',
          'bg-deep': '#f0f0f5',
          'bg-panel': '#ffffff',
          'bg-elevated': '#ffffff',
          'bg-surface': '#fafafa',
          'bg-secondary': '#ffffff',
          'bg-tertiary': '#f5f5f5',
          'bg-card': '#ffffff',
          'bg-hover': '#f0f0f5',
          text: '#0a0a0f',
          'text-secondary': '#6b6b7e',
          'text-muted': '#9a9aae',
          accent: '#6366f1',
          'accent-hover': '#4f46e5',
          success: '#16a34a',
          warning: '#d97706',
          danger: '#dc2626',
          border: '#e5e5ea',
          'border-hover': '#d5d5da',
        },
        // Dark theme
        'theme-dark': {
          'bg-base': '#08080c',
          bg: '#0a0a0f',
          'bg-deep': '#0a0a12',
          'bg-panel': '#0c0c14',
          'bg-elevated': '#0f0f18',
          'bg-surface': '#12121c',
          'bg-secondary': '#12121a',
          'bg-tertiary': '#1a1a24',
          'bg-card': '#16161f',
          'bg-hover': '#1e1e2a',
          text: '#ffffff',
          'text-secondary': '#8b8b9e',
          'text-muted': '#5a5a6e',
          accent: '#6366f1',
          'accent-hover': '#818cf8',
          success: '#22c55e',
          warning: '#f59e0b',
          danger: '#ef4444',
          border: '#2a2a3a',
          'border-hover': '#3a3a4a',
        },
      },
      boxShadow: {
        'accent-glow': '0 4px 12px rgba(99, 102, 241, 0.15)',
        'accent-glow-dark': '0 4px 12px rgba(99, 102, 241, 0.3)',
      },
      backgroundImage: {
        'theme-gradient': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 8s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 4s ease infinite',
        'slide-up': 'slide-up 0.6s ease-out forwards',
        'slide-up-delay-1': 'slide-up 0.6s ease-out 0.1s forwards',
        'slide-up-delay-2': 'slide-up 0.6s ease-out 0.2s forwards',
        'slide-up-delay-3': 'slide-up 0.6s ease-out 0.3s forwards',
        'slide-up-delay-4': 'slide-up 0.6s ease-out 0.4s forwards',
        'slide-up-delay-5': 'slide-up 0.6s ease-out 0.5s forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(5deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    function ({ addBase }) {
      addBase({
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          'scrollbar-color': 'rgb(209 213 219 / 0.8) transparent',
        },
        '.scrollbar-thin::-webkit-scrollbar': {
          width: '6px',
        },
        '.scrollbar-thin::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb': {
          'background-color': 'rgb(209 213 219 / 0.8)',
          'border-radius': '3px',
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb:hover': {
          'background-color': 'rgb(156 163 175 / 0.8)',
        },
        '.dark .scrollbar-thin': {
          'scrollbar-color': 'rgb(75 85 99 / 0.6) transparent',
        },
        '.dark .scrollbar-thin::-webkit-scrollbar-thumb': {
          'background-color': 'rgb(75 85 99 / 0.6)',
        },
        '.dark .scrollbar-thin::-webkit-scrollbar-thumb:hover': {
          'background-color': 'rgb(107 114 128 / 0.7)',
        },
      })
    },
  ],
  darkMode: 'class',
}
