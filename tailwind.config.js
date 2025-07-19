/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        white: '#FFFFFF',
        black: '#000000',
        gray: {
          100: '#f7f7f7',
          200: '#e1e1e1',
          300: '#cfcfcf',
          400: '#b1b1b1',
          500: '#9e9e9e',
          600: '#7e7e7e',
          700: '#626262',
          800: '#515151',
          900: '#3b3b3b'
        }
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'monospace'],
        'inter': ['Inter', 'sans-serif']
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'twinkle': 'twinkle 2s ease-in-out infinite alternate'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        twinkle: {
          '0%': { opacity: '0.3' },
          '100%': { opacity: '1' }
        }
      }
    },
  },
  plugins: [],
};
