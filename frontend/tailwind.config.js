module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        urbans: {
          cream: '#FBF8F3',
          sand: '#F5F0E8',
          stone: '#E8E2D9',
          warm: '#2C2420',
          noir: '#1A1614',
          gold: '#B8860B',
          'gold-light': '#D4A84B',
          copper: '#A67C52',
          blush: '#C9B8A8',
        },
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
        serif: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 24px -4px rgba(0,0,0,0.06), 0 8px 16px -6px rgba(0,0,0,0.03)',
        'soft-lg': '0 12px 40px -8px rgba(0,0,0,0.1), 0 4px 16px -4px rgba(0,0,0,0.04)',
        'gold': '0 0 0 1px rgba(184, 134, 11, 0.2), 0 4px 14px -2px rgba(184, 134, 11, 0.15)',
      },
      backgroundImage: {
        'gradient-cream': 'linear-gradient(180deg, #FBF8F3 0%, #F5F0E8 100%)',
        'gradient-hero': 'linear-gradient(180deg, #1A1614 0%, #2C2420 100%)',
      },
    },
  },
  plugins: [],
};
