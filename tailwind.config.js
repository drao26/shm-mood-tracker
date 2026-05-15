import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        chrome: ['"MS Sans Serif"', 'sans-serif'],
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.border95-outset': {
          borderTopColor: 'var(--chrome-light)',
          borderLeftColor: 'var(--chrome-light)',
          borderBottomColor: 'var(--chrome-dark)',
          borderRightColor: 'var(--chrome-dark)',
        },
        '.border95-inset': {
          borderTopColor: 'var(--chrome-dark)',
          borderLeftColor: 'var(--chrome-dark)',
          borderBottomColor: 'var(--chrome-light)',
          borderRightColor: 'var(--chrome-light)',
        },
      });
    }),
  ],
};
