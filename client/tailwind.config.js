/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './public/index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#10a37f',
          light: '#1dd1a1',
          dark: '#0d8f72'
        }
      },
      backgroundImage: {
        'grid': "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)",
      },
      boxShadow: {
        glow: '0 0 32px rgba(16,163,127,0.25)'
      },
      borderRadius: {
        xl: '1.25rem'
      }
    },
  },
  plugins: [],
};
