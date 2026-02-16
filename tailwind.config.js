/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1DB954',
        dark: '#121212',
        'dark-lighter': '#282828',
      }
    },
  },
  plugins: [],
}
