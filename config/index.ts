'use client'

import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import { walletConnectWallet } from '@rainbow-me/rainbowkit/wallets'
import { lineaSepolia, mainnet, scroll, sepolia } from 'viem/chains'
import { createConfig, type CreateConfigParameters, http } from 'wagmi'
import { injected } from 'wagmi/connectors'

const common = {
  chains: [mainnet, scroll, sepolia, lineaSepolia],
  transports: {
    [mainnet.id]: http(),
    [scroll.id]: http(),
    [sepolia.id]: http(),
    [lineaSepolia.id]: http(),
  },
} as CreateConfigParameters

const basicConnectors = [injected()]
const basic = createConfig({ ...common, connectors: basicConnectors })

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
const advanced = createConfig({ ...common, connectors: advancedConnectors })

export { advanced, basic }
