/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        beige: '#F4E9D8',
        beigeCard: '#EDE0C8',
        beigeDeep: '#E3D2AC',
        ink: '#241B12',
        inkSoft: '#5C4A34',
        saffron: '#E8762C',
        saffronDeep: '#B8541A',
        saffronLight: '#F7A860',
        gold: '#C6961D',
        maroon: '#9C2B1E',
        go: '#2F6B4F',
        line: '#D8C6A0'
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace']
      }
    }
  },
  plugins: []
}
