/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: { 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857' },
        slate: { 300: '#cbd5e1', 400: '#94a3b8', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a' },
        blue: { 500: '#3b82f6', 600: '#2563eb' },
        purple: { 500: '#8b5cf6', 600: '#7c3aed' },
        red: { 500: '#ef4444', 600: '#dc2626' },
        yellow: { 500: '#eab308', 600: '#ca8a04' },
      },
      animation: { 'pulse-slow': 'pulse 6s infinite ease-in-out' },
    },
  },
  plugins: [],
}