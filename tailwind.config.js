/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f6f6f4',
          100: '#e7e7e3',
          200: '#c9c9c2',
          300: '#a8a8a0',
          400: '#82827b',
          500: '#63635d',
          600: '#4c4c47',
          700: '#383834',
          800: '#232320',
          900: '#161614',
        },
        clay: {
          50: '#faf6f0',
          100: '#f2e9da',
          200: '#e4d2b3',
          300: '#d3b586',
          400: '#c09a5f',
          500: '#a87f45',
          600: '#8a6536',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
