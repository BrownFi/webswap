/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    screens: {
      xs: '500px',
      sm: '720px',
      md: '960px',
      lg: '990px',
    },
    extend: {
      colors: {
        // base
        white: '#FFFFFF',
        black: '#000000',

        // text — use CSS variables for dark/light switching
        text1: 'var(--color-text1)',
        text2: 'var(--color-text2)',
        text3: 'var(--color-text3)',
        text4: 'var(--color-text4)',
        text5: 'var(--color-text5)',

        // backgrounds / greys
        bg1: 'var(--color-bg1)',
        bg2: 'var(--color-bg2)',
        bg3: 'var(--color-bg3)',
        bg4: 'var(--color-bg4)',
        bg5: 'var(--color-bg5)',

        // specialty
        modalBG: 'var(--color-modalBG)',
        advancedBG: 'var(--color-advancedBG)',

        // primary
        primary1: 'var(--color-primary1)',
        primary2: 'var(--color-primary2)',
        primary3: 'var(--color-primary3)',
        primary4: 'var(--color-primary4)',
        primary5: 'var(--color-primary5)',

        // primary text
        primaryText1: 'var(--color-primaryText1)',

        // secondary
        secondary1: 'var(--color-secondary1)',
        secondary2: 'var(--color-secondary2)',
        secondary3: 'var(--color-secondary3)',

        // other
        red1: '#FD4040',
        red2: '#F82D3A',
        red3: '#D60000',
        green1: '#27AE60',
        yellow1: '#FFE270',
        yellow2: '#F3841E',
        blue1: '#2172E5',

        menuText: 'rgba(196, 148, 58, 0.5)',
        greenMain: '#c4943a',
        gray: '#8A7D66',

        // new gold palette
        gold: '#c4943a',
        goldLight: '#d4a94f',
        goldDark: '#a67424',
        brownBg: '#0a0806',
        brownCard: '#1a1510',
        brownInput: '#0d0b08',
        brownPanel: '#12100b',

        // shadow
        shadow1: 'var(--color-shadow1)',
      },
      fontFamily: {
        montserrat: ['"Montserrat"', 'sans-serif'],
      },
      keyframes: {
        rotate360: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        shrink: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0.9)' },
        },
        ellipsis: {
          '0%': { content: '"."' },
          '33%': { content: '".."' },
          '66%': { content: '"..."' },
        },
      },
      animation: {
        rotate360: 'rotate360 1s cubic-bezier(0.83, 0, 0.17, 1) infinite',
        shrink: 'shrink 0.15s ease-out',
        ellipsis: 'ellipsis 1.25s infinite',
        'spin-slow': 'rotate360 2s linear infinite',
      },
      spacing: {
        'grid-sm': '8px',
        'grid-md': '12px',
        'grid-lg': '24px',
      },
    },
  },
  plugins: [],
}
