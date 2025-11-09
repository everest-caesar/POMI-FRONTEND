/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#C41E3A',
          redDeep: '#9E1B33',
          gold: '#D4AF37',
          terracotta: '#A0522D',
          charcoal: '#0F172A',
          ash: '#1E293B',
          offwhite: '#F5F3F0',
          cream: '#FFF7EB',
          green: '#27AE60',
          blue: '#3498DB',
        },
        primary: '#C41E3A',
        secondary: '#D4AF37',
        accent: '#27AE60',
        neutral: '#F5F3F0',
        dark: '#101828',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        glow: '0 18px 45px rgba(196, 30, 58, 0.35)',
        glass: '0 25px 60px rgba(15, 23, 42, 0.45)',
        card: '0 25px 50px -12px rgba(15, 23, 42, 0.45)',
      },
      backgroundImage: {
        'radial-glow':
          'radial-gradient(circle at top, rgba(255,255,255,0.08), rgba(15,23,42,0) 55%)',
        'pomi-gradient':
          'linear-gradient(135deg, rgba(196,30,58,1) 0%, rgba(212,175,55,1) 100%)',
      },
      blur: {
        xs: '2px',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        shimmer: 'shimmer 8s infinite linear',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
