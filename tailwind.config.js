/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta principal DIVERSUS SHOP
        primary: {
          DEFAULT: '#8A2BE2', // Roxo Vibrante
          50: '#F3E8FF',
          100: '#E9D5FF',
          200: '#D8B4FE',
          300: '#C084FC',
          400: '#A855F7',
          500: '#8A2BE2',
          600: '#7C1FD1',
          700: '#6B1BB0',
          800: '#57178F',
          900: '#451377',
        },
        secondary: {
          DEFAULT: '#00FFFF', // Ciano
          50: '#E6FFFF',
          100: '#B3FFFF',
          200: '#80FFFF',
          300: '#4DFFFF',
          400: '#1AFFFF',
          500: '#00FFFF',
          600: '#00CCCC',
          700: '#009999',
          800: '#006666',
          900: '#003333',
        },
        ink: '#000000', // preto usado nas bordas/sombras
        base: '#FFFFFF', // fundo predominante
        accent: {
          yellow: '#FFE156',
          pink: '#FF6FB5',
          green: '#5CE65C',
          orange: '#FF9F45',
        },
      },
      fontFamily: {
        // Fonte lúdica e arredondada como padrão do projeto
        sans: ['Fredoka', 'Quicksand', 'Nunito', 'ui-rounded', 'sans-serif'],
        display: ['Fredoka', 'sans-serif'],
        body: ['Nunito', 'sans-serif'],
      },
      borderRadius: {
        'xl2': '1.25rem',
      },
      boxShadow: {
        // Sombras duras, "cartoon", sem blur, deslocadas
        cartoon: '4px 4px 0px 0px rgba(0,0,0,1)',
        'cartoon-sm': '2px 2px 0px 0px rgba(0,0,0,1)',
        'cartoon-lg': '6px 6px 0px 0px rgba(0,0,0,1)',
        'cartoon-xl': '8px 8px 0px 0px rgba(0,0,0,1)',
        'cartoon-hover': '2px 2px 0px 0px rgba(0,0,0,1)',
        'cartoon-primary': '4px 4px 0px 0px rgba(138,43,226,1)',
        'cartoon-secondary': '4px 4px 0px 0px rgba(0,255,255,1)',
      },
      borderWidth: {
        3: '3px',
        5: '5px',
      },
      keyframes: {
        'bounce-in': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'pop': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'bounce-in': 'bounce-in 0.4s ease-out',
        'wiggle': 'wiggle 0.3s ease-in-out',
        'pop': 'pop 0.3s ease-in-out',
      },
    },
  },
  plugins: [],
}
