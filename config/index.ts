'use client'

import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import { metaMaskWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets'
import { lineaSepolia, mainnet, scroll, sepolia } from 'viem/chains'
import { createConfig, type CreateConfigParameters, http } from 'wagmi'

const common = {
  chains: [mainnet, scroll, sepolia, lineaSepolia],
  transports: {
    [mainnet.id]: http(),
    [scroll.id]: http(),
    [sepolia.id]: http(),
    [lineaSepolia.id]: http(),
  },
} as CreateConfigParameters

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Popular',
      wallets: [metaMaskWallet, walletConnectWallet],
    },
  ],
  {
    appName: 'dapp',
    projectId: 'edd4a3a6d5256ef234836b3b30a2c000',
  },
)
export const config = createConfig({ ...common, connectors })
