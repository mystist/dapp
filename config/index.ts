import { mainnet, scroll, sepolia } from 'viem/chains'
import { cookieStorage, createConfig, createStorage, http } from 'wagmi'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [mainnet, sepolia, scroll],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [scroll.id]: http(),
  },
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
})
