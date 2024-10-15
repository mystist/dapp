'use client'

import '@rainbow-me/rainbowkit/styles.css'

import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { type ReactNode, useMemo } from 'react'
import { WagmiProvider } from 'wagmi'

import { advanced, basic } from '@/config'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

export default function Providers({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams()

  const isAdvanced = useMemo(() => searchParams.get('advanced') === 'true', [searchParams])

  return (
    <WagmiProvider config={isAdvanced ? advanced : basic}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact">{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
