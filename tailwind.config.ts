import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:  ['var(--font-sans)', 'Syne', 'sans-serif'],
        serif: ['var(--font-serif)', 'DM Serif Display', 'serif'],
        mono:  ['var(--font-mono)', 'DM Mono', 'monospace'],
      },
      colors: {
        ink:    '#0a0a0f',
        ink2:   '#3d3d52',
        ink3:   '#8888a0',
        surface:'#f7f6f3',
        accent: '#1a1aff',
        green:  '#00c896',
        gold:   '#f5c842',
        coral:  '#ff6b35',
      },
    },
  },
  plugins: [],
}
export default config
