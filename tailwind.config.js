/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:       '#0a0a0a',
        surface:  '#141414',
        surface2: '#1c1c1c',
        surface3: '#242424',
        border:   '#2a2a2a',
        border2:  '#333',
        accent:   '#c9a84c',
        'accent-dim': '#7a6030',
        'accent-glow': 'rgba(201,168,76,0.12)',
        muted:    '#555',
        subtle:   '#888',
        text:     '#d8d6cc',
        'text-dim': '#666',
        red:      '#c85050',
        amber:    '#d4903a',
        blue:     '#5a8fc8',
        green:    '#5a9a5a',
      },
      fontFamily: {
        bebas: ['"Bebas Neue"', 'cursive'],
        courier: ['"Courier Prime"', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      aspectRatio: {
        '16/9': '16 / 9',
        '4/3':  '4 / 3',
      },
    },
  },
  plugins: [],
}
