/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aura: {
          primary: '#6366F1',
          calm: '#10B981',
          alert: '#EF4444',
          background: '#121212' // Catchy black color for background
        }
      },
      animation: {
        'pulse-calm': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-active': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-alert': 'pulse 0.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' }
        }
      }
    },
  },
  plugins: [],
}