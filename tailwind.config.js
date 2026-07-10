/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        card: 'rgba(255, 255, 255, 0.03)',
        border: 'rgba(255, 255, 255, 0.1)',
        primary: '#3b82f6',
        accent: '#8b5cf6',
      },
      transitionTimingFunction: {
        cinematic: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        shimmer: 'shimmer 2.5s infinite linear',
        'text-gradient': 'textGradient 8s linear infinite',
        'metallic-shimmer': 'metallicShimmer 6s linear infinite',
        'wave-slow': 'wave 15s ease-in-out infinite alternate',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        textGradient: {
          '0%': { backgroundPosition: '0% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        metallicShimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        wave: {
          '0%': { transform: 'scale(1) translate(0, 0)' },
          '50%': { transform: 'scale(1.1) translate(2%, 2%)' },
          '100%': { transform: 'scale(1) translate(-2%, -2%)' },
        },
      },
    },
  },
  plugins: [],
};
