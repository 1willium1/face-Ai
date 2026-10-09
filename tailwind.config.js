/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f4f6f9',
          100: '#e9edf3',
          200: '#c8d2e1',
          300: '#a7b7ce',
          400: '#6480aa',
          500: '#224a86',
          600: '#1f4379',
          700: '#1a3865',
          800: '#152c51',
          900: '#112442',
        },
        gold: {
          50: '#fef9e7',
          100: '#fdf3cf',
          200: '#fbe79f',
          300: '#fada6f',
          400: '#f8cd3f',
          500: '#f6c00f',
          600: '#c59a0c',
          700: '#947309',
          800: '#624d06',
          900: '#312603',
        }
      },
      fontFamily: {
        prompt: ['Prompt', 'sans-serif'],
        sarabun: ['Sarabun', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
