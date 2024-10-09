import './globals.css'

import localFont from 'next/font/local'
import { headers } from 'next/headers'
import { cookieToInitialState } from 'wagmi'

import Header from '@/components/Header'
import SvgSymbols from '@/components/SvgSymbols'
import { config } from '@/config'

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
  const initialState = cookieToInitialState(config, headers().get('cookie'))

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <SvgSymbols />

        <Providers initialState={initialState}>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  )
}
