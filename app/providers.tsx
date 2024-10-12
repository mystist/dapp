'use client'

import '@rainbow-me/rainbowkit/styles.css'

import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { type ReactNode } from 'react'
import { type State, WagmiProvider } from 'wagmi'

import { advanced, basic } from '@/config'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

export default function Providers({ children, basicInitialState, advancedInitialState }: { children: ReactNode; basicInitialState: State | undefined; advancedInitialState: State | undefined }) {
  const searchParams = useSearchParams()
  const isAdvanced = searchParams.get('advanced') === 'true'

  return (
    <WagmiProvider config={isAdvanced ? advanced : basic} initialState={isAdvanced ? advancedInitialState : basicInitialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact">{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
