'use client'

import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { use, useMemo } from 'react'
import { formatUnits } from 'viem'
import { useAccount } from 'wagmi'

import { Transaction } from '@/interfaces'
import { shortenAddress } from '@/utils'

export default function Transactions({ transactionsPromise }: { transactionsPromise: Promise<Transaction[]> }) {
  // use all transactions just for react server component poc purpose
  // need to change to server actions and fetch it for client component
  const allTransactions = use(transactionsPromise)

  const { chain, address } = useAccount()

  const transactions = useMemo(() => {
    if (!chain || !address) return []

    return allTransactions.filter((item) => item.address === address && item.chainId === chain.id)
  }, [address, allTransactions, chain])

  const blockExplorer = useMemo(() => {
    if (!chain) return

    return chain.blockExplorers
  }, [chain])

  return (
    <div className="px-8">
      <div className="flex items-center">
        <div className="flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Transactions</h1>
          <p className="mt-2 text-sm text-gray-700">A list of transactions on {chain ? <em className="font-medium">{chain.name}</em> : 'selected network'}.</p>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto">
          <div className="inline-block min-w-full px-4 py-2 align-middle">
            {transactions.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="py-3.5 pl-0 pr-3 text-left text-sm font-semibold text-gray-900">
                      Transaction Hash
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Action
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Amount
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Recipient
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Timestamp
                    </th>
                    <th scope="col" className="py-3.5 pl-3 pr-0 text-center text-sm font-semibold text-gray-900">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {blockExplorer &&
                    transactions.map((item, index) => (
                      <tr key={index}>
                        <td className="whitespace-nowrap py-4 pl-0 pr-3 font-mono text-sm text-gray-900">
                          <a href={`${blockExplorer.default.url}/tx/${item.txHash}`} target="_blank" className="text-blue-700 underline">
                            {shortenAddress(item.txHash)}
                          </a>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm capitalize text-gray-500">{item.action}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatUnits(BigInt(item.value), item.decimals)} {item.symbol}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 font-mono text-sm text-gray-500">{shortenAddress(item.recipientAddress)}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(item.date).toLocaleString()}</td>
                        <td className="whitespace-nowrap py-4 pl-3 pr-0 text-right text-sm capitalize">
                          {item.status === 'success' && <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">{item.status}</span>}
                          {item.status === 'error' && <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">{item.status}</span>}
                          {item.status === 'pending' && <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">{item.status}</span>}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            ) : (
              <div className="pt-16 text-center">
                <InformationCircleIcon className="mx-auto h-12 w-12 stroke-1 text-gray-400" />
                <h3 className="mt-2 text-sm text-gray-900">No transactions yet</h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
