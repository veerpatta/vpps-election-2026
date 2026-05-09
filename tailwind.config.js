/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        vpps: {
          navy: '#0B1F3A',
          gold: '#F4B400',
          richGold: '#D6A21E',
          soft: '#F7F8FB',
          success: '#16A34A',
          warning: '#F97316',
          danger: '#DC2626',
        },
      },
      boxShadow: {
        soft: '0 18px 45px rgba(11, 31, 58, 0.10)',
      },
    },
  },
  plugins: [],
}
