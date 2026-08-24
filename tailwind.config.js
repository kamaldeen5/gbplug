/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#00C853',
          greenHover: '#00B74A',
          greenActive: '#009E40',
          darkBg: '#070D18',
          darkCard: '#09121F',
          darkCardBorder: '#15233A',
          darkInput: '#070D18',
          darkInputBorder: '#18263E',
          mtn: '#FFCC00',
          vodafone: '#E60000',
          glo: '#00A651',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
