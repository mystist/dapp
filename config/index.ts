'use client'

import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import { walletConnectWallet } from '@rainbow-me/rainbowkit/wallets'
import { mainnet, scroll, sepolia } from 'viem/chains'
import { cookieStorage, createConfig, type CreateConfigParameters, createStorage, http } from 'wagmi'
import { injected } from 'wagmi/connectors'

const configLiteral = {
  chains: [mainnet, sepolia, scroll],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [scroll.id]: http(),
  },
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
} as CreateConfigParameters

const basicConnectors = [injected()]

const advancedConnectors = connectorsForWallets(
  [
    {
      groupName: 'Mobile compat',
      wallets: [walletConnectWallet],
    },
  ],
  {
    appName: 'dapp',
    projectId: 'edd4a3a6d5256ef234836b3b30a2c000',
  },
)

export const basic = createConfig({ ...configLiteral, connectors: basicConnectors })
export const advanced = createConfig({ ...configLiteral, connectors: advancedConnectors })
