/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fdf8ec',
          100: '#f8ecc9',
          200: '#efd68c',
          300: '#e6c05a',
          400: '#d4af37',
          500: '#c9a227',
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
        },
        dark: {
          800: '#1a1e2e',
          900: '#12151e',
          950: '#090a0f',
        },
      },
    },
  },
  plugins: [],
}
