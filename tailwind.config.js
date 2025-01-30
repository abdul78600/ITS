/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a2234',
          light: '#2a3446',
          dark: '#141b2d',
        },
      },
    },
  },
  plugins: [],
};