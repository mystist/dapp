import { lineaSepolia, mainnet, scroll, sepolia } from 'viem/chains'
import { cookieStorage, createConfig, type CreateConfigParameters, createStorage, http } from 'wagmi'
import { injected } from 'wagmi/connectors'

const configLiteral = {
  chains: [mainnet, scroll, sepolia, lineaSepolia],
  transports: {
    [mainnet.id]: http(),
    [scroll.id]: http(),
    [sepolia.id]: http(),
    [lineaSepolia.id]: http(),
  },
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
} as CreateConfigParameters

const basicConnectors = [injected()]
const basic = createConfig({ ...configLiteral, connectors: basicConnectors })

let advanced = basic

if (typeof window !== 'undefined') {
  ;(async () => {
    const [{ connectorsForWallets }, { walletConnectWallet }] = await Promise.all([import('@rainbow-me/rainbowkit'), import('@rainbow-me/rainbowkit/wallets')])

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

    advanced = createConfig({ ...configLiteral, connectors: advancedConnectors })
  })()
}

export { advanced, basic }
