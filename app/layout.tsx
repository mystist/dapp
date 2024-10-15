import './globals.css'

import dynamic from 'next/dynamic'
import localFont from 'next/font/local'

import { Pulse } from '@/components/Animation'
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

const Header = dynamic(() => import('@/components/Header'), { ssr: false, loading: () => <Pulse /> })

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
