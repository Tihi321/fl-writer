/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#3B82F6',
        'primary-dark': '#1E40AF',
        'secondary': '#8B5CF6',
        'accent': '#F59E0B',
        'dark': '#1F2937',
        'darker': '#111827',
      }
    },
  },
  plugins: [],
} 