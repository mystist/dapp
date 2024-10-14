import { Abi } from 'viem'

export interface ContractInfo {
  abi: Abi
  address: `0x${string}`
  balance: bigint
  decimals: number
  symbol: string
}

export interface Transaction {
  chainId: number
  txHash: string
  action: string
  value: string
  decimals: number
  symbol: string
  address: string
  recipientAddress: string
  date: string
  status: string
}
