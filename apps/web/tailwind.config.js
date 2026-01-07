/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
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
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
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
        'float': {
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
  plugins: [],
  darkMode: 'class',
}
