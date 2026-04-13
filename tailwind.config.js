/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        surface: '#12121a',
        primary: '#a855f7',
        secondary: '#22d3ee',
        success: '#4ade80',
        danger: '#f87171',
        textMain: '#ffffff',
        textMuted: '#94a3b8',
        inputBg: '#1e1e2e',
      },
      boxShadow: {
        'neon-card': '0 0 16px rgba(168,85,247,0.25)',
        'neon-btn': '0 0 12px rgba(168,85,247,0.5)',
      }
    },
  },
  plugins: [],
}

