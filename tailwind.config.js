/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#4f46e5',
          light: '#6366f1',
          dark: '#4338ca',
          hover: '#3730a3',
        },
        status: {
          green: '#16a34a',
          amber: '#d97706',
          red: '#dc2626',
        },
        cyber: {
          bg: '#080d1a',
          card: 'rgba(15, 23, 42, 0.75)',
          border: 'rgba(56, 189, 248, 0.15)',
          glow: 'rgba(79, 70, 229, 0.25)',
          cyan: '#06b6d4',
          emerald: '#10b981',
        }
      },
      boxShadow: {
        'cyber-glow': '0 0 25px -5px rgba(79, 70, 229, 0.3)',
        'cyber-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.3)',
        'cyber-green': '0 0 25px -5px rgba(22, 163, 74, 0.3)',
        'cyber-red': '0 0 25px -5px rgba(220, 38, 38, 0.3)',
      },
      borderRadius: {
        '2xl': '1rem',
      }
    },
  },
  plugins: [],
};
