import type { Metadata } from 'next'
import { fontClassNames } from '@/lib/fonts'
import { themeInitScript } from '@/lib/theme'
import './globals.css'
import './pro.css'

export const metadata: Metadata = {
  title: 'Personal CFO Agent — Mantle Network',
  description: 'Autonomous on-chain wealth management powered by Byreal on Mantle',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontClassNames} suppressHydrationWarning>
      <head>
        {/* biome-ignore lint: theme init must run before paint */}
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
