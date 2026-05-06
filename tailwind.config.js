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
  plugins: [],
};
