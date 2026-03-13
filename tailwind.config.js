/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          50:  '#FFF5F7',
          100: '#FFE4E8',
          200: '#FFD1DC',
          300: '#FBC4C4',
          400: '#FF9EB5',
          500: '#E6A4B4',
          600: '#d4849a',
          700: '#b85c75',
          800: '#8B3A52',
          900: '#831843',
        },
        gold: {
          300: '#f0d9b5',
          400: '#E8C39E',
          500: '#d4a96a',
        },
        cream: '#FFF9F9',
      },
      fontFamily: {
        'great-vibes': ['"Great Vibes"', 'cursive'],
        'playfair': ['"Playfair Display"', 'serif'],
        'poppins': ['Poppins', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'gentle-pulse': 'gentlePulse 3s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'slide-down': 'slideDown 0.3s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        gentlePulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.75' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'pink-sm': '0 2px 12px rgba(255, 158, 181, 0.18)',
        'pink-md': '0 6px 24px rgba(255, 158, 181, 0.28)',
        'pink-lg': '0 12px 40px rgba(255, 158, 181, 0.35)',
        'card': '0 4px 24px rgba(230, 164, 180, 0.15)',
        'card-hover': '0 12px 40px rgba(230, 164, 180, 0.30)',
      },
    },
  },
  plugins: [],
}
