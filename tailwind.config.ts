import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        win: {
          teal: '#008080',
          gray: '#C0C0C0',
          blue: '#000080',
          light: '#FFFFFF',
          dark: '#000000',
          shadow: '#808080',
        }
      },
      fontFamily: {
        retro: ['"VT323"', 'monospace'],
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

export default config

