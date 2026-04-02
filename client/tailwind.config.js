/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Outfit', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        zinc: {
          950: '#09090b',
        }
      }
    },
  },
  plugins: [],
}
