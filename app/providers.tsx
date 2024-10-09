'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import { type State, WagmiProvider } from 'wagmi'

import { config } from '@/config'

const queryClient = new QueryClient()

export default function Providers({ children, initialState }: { children: ReactNode; initialState: State | undefined }) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
