import './globals.css'

import localFont from 'next/font/local'

import Header from '@/components/Header'
import SvgSymbols from '@/components/SvgSymbols'

import Providers from './providers'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
})

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} relative flex min-h-screen flex-col font-sans`}>
        <SvgSymbols />

        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  )
}
