/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        chrome: ['"MS Sans Serif"', '"Pixelated MS Sans Serif"', 'Tahoma', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
