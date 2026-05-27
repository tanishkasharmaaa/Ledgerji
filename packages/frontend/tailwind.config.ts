import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
          400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
          800: '#1e40af', 900: '#1e3a8a', 950: '#172554',
        },
        surface: {
          DEFAULT: '#ffffff',
          secondary: '#f8fafc',
          tertiary: '#f1f5f9',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        pending: '#f97316',
        paid: '#10b981',
        credit: '#6366f1',
        debit: '#10b981',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        'sm-touch': ['0.9375rem', { lineHeight: '1.375rem' }],
        'base-touch': ['1.0625rem', { lineHeight: '1.5rem' }],
        'lg-touch': ['1.1875rem', { lineHeight: '1.75rem' }],
        'xl-touch': ['1.375rem', { lineHeight: '1.875rem' }],
        '2xl-touch': ['1.625rem', { lineHeight: '2.125rem' }],
        '3xl-touch': ['2rem', { lineHeight: '2.5rem' }],
      },
      borderRadius: {
        'touch': '0.875rem',
        'touch-lg': '1.125rem',
        'touch-xl': '1.5rem',
      },
      spacing: {
        'touch': '0.75rem',
        'touch-sm': '0.5rem',
        'touch-lg': '1rem',
        'touch-xl': '1.5rem',
      },
      minHeight: {
        'touch': '3rem',
        'touch-lg': '3.5rem',
        'touch-xl': '4rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { '0%': { opacity: '0', transform: 'translateY(-10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        pulseSoft: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.7' } },
      },
    },
  },
  plugins: [],
} satisfies Config;