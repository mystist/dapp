import { type Abi } from 'viem'
import { sepolia } from 'viem/chains'

import mtkAbi from '../abi/MTK.json'

interface ContractType {
  address: `0x${string}`
  abi: Abi
}

const contractConfig = {
  MTK: {
    [sepolia.id]: {
      address: '0xa677F65460E1d6cb09c42308010e6AbBeB67cd5B',
      abi: mtkAbi,
    },
  },
} as any

export const getContract = (chainId: number, symbol: string): ContractType | undefined => {
  try {
    return contractConfig[symbol][chainId]
  } catch (error) {
    return
  }
}
