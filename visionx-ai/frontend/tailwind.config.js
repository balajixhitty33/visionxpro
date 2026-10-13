/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#050B18',
          secondary: '#08111F',
          panel: '#0D1728',
          card: '#0F1B2E',
          accent: '#132238',
        },
        brand: {
          blue: '#2F80FF',
          'blue-bright': '#3B8DFF',
          cyan: '#18C8FF',
          glow: 'rgba(47, 128, 255, 0.25)',
          'cyan-glow': 'rgba(24, 200, 255, 0.25)',
        },
        content: {
          primary: '#FFFFFF',
          secondary: '#8B9BB4',
          muted: '#5A6B82',
        },
        status: {
          success: '#22C55E',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          light: 'rgba(255, 255, 255, 0.12)',
          focus: 'rgba(47, 128, 255, 0.5)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Geist', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(47, 128, 255, 0.25)',
        'glow-md': '0 0 25px -5px rgba(47, 128, 255, 0.35)',
        'glow-cyan': '0 0 20px -3px rgba(24, 200, 255, 0.3)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 3s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(0%)', opacity: '0.4' },
          '50%': { transform: 'translateY(100%)', opacity: '0.8' },
        }
      }
    },
  },
  plugins: [],
}
