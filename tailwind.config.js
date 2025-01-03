/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Alumni Sans Pinstripe"', 'sans-serif'],
      },
      colors: {
        background: 'var(--background-color)',
        text: 'var(--text-color)',
      },
    },
  },
  plugins: [],
}
