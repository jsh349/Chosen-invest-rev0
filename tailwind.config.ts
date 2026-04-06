import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // gray-500 override: #6b7280 (default) gives ~4.27:1 on surface.card — fails WCAG AA.
        // #7c8698 gives ~4.93:1 on surface.card — passes WCAG AA for normal text.
        gray: {
          500: '#7c8698',
        },
        brand: {
          50:  '#f0f4ff',
          100: '#dce6fd',
          200: '#b9cdfb',
          300: '#86a9f8',
          400: '#4f7df3',
          500: '#2b5be8',
          600: '#1a3fd4',
          700: '#1632ac',
          800: '#182d8c',
          900: '#192a6f',
          950: '#121b47',
        },
        surface: {
          DEFAULT: '#0f1117',
          card: '#161b27',
          border: '#1e2535',
          muted: '#252d3f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
