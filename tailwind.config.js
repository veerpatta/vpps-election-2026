/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        vpps: {
          navy: '#0B1F3A',
          navyDark: '#081730',
          navySoft: '#1a2f54',
          gold: '#F4B400',
          richGold: '#D6A21E',
          deepGold: '#B68611',
          ivory: '#FAF8F3',
          paper: '#FFFFFF',
          soft: '#F5F7FB',
          line: '#E5E9F2',
          mute: '#6B7280',
          success: '#16A34A',
          warning: '#F97316',
          danger: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 12px 32px -12px rgba(11, 31, 58, 0.18)',
        card: '0 1px 0 rgba(11, 31, 58, 0.04), 0 8px 24px -16px rgba(11, 31, 58, 0.18)',
        ring: '0 0 0 1px rgba(11, 31, 58, 0.08)',
        floating: '0 20px 50px -20px rgba(11, 31, 58, 0.35)',
        inset: 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
      },
      borderRadius: {
        '2.5xl': '1.25rem',
      },
      backgroundImage: {
        'paper-grain': "radial-gradient(rgba(11,31,58,0.035) 1px, transparent 1px)",
      },
      backgroundSize: {
        'paper-grain': '14px 14px',
      },
    },
  },
  plugins: [],
}
