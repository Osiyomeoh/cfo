import { DM_Mono, DM_Serif_Display, Syne } from 'next/font/google'

export const fontUi = Syne({
  subsets: ['latin'],
  variable: '--font-ui',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const fontDisplay = DM_Serif_Display({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400'],
  display: 'swap',
})

export const fontMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
  display: 'swap',
})

export const fontClassNames = `${fontUi.variable} ${fontDisplay.variable} ${fontMono.variable}`
