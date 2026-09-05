/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        parchment: {
          50: '#fdfbf6',
          100: '#faf5ea',
          200: '#f2e8d3',
          300: '#e7d5b3',
        },
        wood: {
          50: '#faf6f1',
          100: '#f0e4d7',
          200: '#dcc3a8',
          300: '#c39d76',
          400: '#a9784f',
          500: '#8f5d38',
          600: '#74482c',
          700: '#573624',
          800: '#3b2519',
          900: '#241610',
          950: '#150c08',
        },
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      boxShadow: {
        sheet: '0 1px 2px rgba(59,37,25,0.06), 0 8px 30px rgba(59,37,25,0.10)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease-out both',
      },
    },
  },
  plugins: [],
};
