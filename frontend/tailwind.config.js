/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Sampled from the approved mockups
        navy: {
          950: '#000c1c',
          900: '#00102a',
          850: '#00122e',
          800: '#011a3d',
          700: '#0a2550',
        },
        brand: {
          DEFAULT: '#0051fc',
          600: '#0046e0',
          bar: '#004cf8',
          sky: '#64b6f5',
          label: '#0a82d3',
          bright: '#138ee9',
        },
        light: {
          DEFAULT: '#f3f6fb',
          50: '#f9fbfe',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
      },
      maxWidth: {
        site: '1440px',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(56,132,255,.55), 0 0 24px rgba(30,110,255,.45)',
      },
    },
  },
  plugins: [],
};
