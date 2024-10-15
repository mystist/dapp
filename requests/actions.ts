'use server'

import { Transaction } from '@/interfaces'
import { getInstance } from '@/lib/list'

export const actionPostTransaction = async (transaction: Transaction) => {
  if (!transaction) return

  const instance = await getInstance()
  await instance.createItem(transaction)
}

export const actionUpdateTransaction = async (txHash: string, status: string) => {
  if (!txHash) return

  const instance = await getInstance()
  await instance.updateItem('txHash', txHash, { status })
}

export const actionFetchTransactions = async () => {
  const instance = await getInstance()
  return await instance.getList()
}
