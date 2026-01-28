/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        rfx: ['Russo One', 'sans-serif'],
        femmora: ['Fredoka', 'sans-serif'],
        body: ['Nunito', 'sans-serif'],
      },
      colors: {
        'luxury-black': '#050505',
        'luxury-dark': '#0a0a0c',
        'rfx-primary': '#06b6d4',
        'rfx-dim': 'rgba(6, 182, 212, 0.1)',
        'fem-primary': '#ec4899',
        'fem-dim': 'rgba(236, 72, 153, 0.1)',
        'gold-accent': '#d4af37',
        'gold-glow': 'rgba(212, 175, 55, 0.3)',
        'silver-text': '#e2e8f0',
        'muted-text': '#94a3b8',
        'glass-border': 'rgba(255, 255, 255, 0.08)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
        'reveal': 'reveal 0.8s cubic-bezier(0.5, 0, 0, 1) forwards',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        },
        reveal: {
          '0%': { opacity: 0, transform: 'translateY(30px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
