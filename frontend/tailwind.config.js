/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fffdf2',
          100: '#fff7d1',
          200: '#ffefaa',
          300: '#ffe070',
          400: '#ffd54a',
          500: '#ffc107',
          600: '#ffb300',
          700: '#d18c00',
          800: '#a96d00',
          900: '#7a4d00'
        },
        ink: '#101828',
        dusk: '#0f172a'
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif']
      },
      boxShadow: {
        glow: '0 24px 80px rgba(255, 179, 0, 0.18)',
        soft: '0 16px 40px rgba(26, 26, 26, 0.08)'
      },
      backgroundImage: {
        'hero-mesh':
          'radial-gradient(circle at top left, rgba(255, 193, 7, 0.35), transparent 35%), radial-gradient(circle at top right, rgba(255, 179, 0, 0.24), transparent 30%), linear-gradient(135deg, rgba(255,252,240,0.96), rgba(255,247,209,0.72))'
      }
    }
  },
  plugins: []
};
