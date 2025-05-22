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
        'safeia-error-light': '#FEE2E2',
        'safeia-error-border': '#F87171',
        'safeia-error-dark': '#991B1B',
        'safeia-risk-low': 'rgba(76, 175, 80)',
        'safeia-risk-medium': 'rgba(255, 152, 0)',
        'safeia-risk-high': 'rgba(244, 67, 54)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
