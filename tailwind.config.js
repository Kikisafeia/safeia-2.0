/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'safeia-yellow': '#FFB800',
        'safeia-yellow-dark': '#E6A600',
        'safeia-black': '#1A1A1A',
        'safeia-gray': '#6B7280',
        'safeia-bg': '#F9FAFB',
        'safeia-white': '#FFFFFF',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}