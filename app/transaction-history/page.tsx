import { headers } from 'next/headers'
import { Suspense } from 'react'

import { actionFetchTransactions } from '@/requests/actions'

import Transactions from './transactions'

const getChainId = (wagmiCookie: string | null) => {
  if (!wagmiCookie) return

  const match = wagmiCookie.match(/chainId":(\d+)/)
  if (match && match[1]) {
    return parseInt(match[1], 10)
  }
}

const getAccount = (wagmiCookie: string | null) => {
  if (!wagmiCookie) return

  const regex = /"accounts":\s*(\[.*?\])/
  const match = wagmiCookie.match(regex)

  if (match && match[1]) {
    try {
      return JSON.parse(match[1])[0]
    } catch (e) {
      return ''
    }
  } else {
    return ''
  }
}

export default function Home() {
  const cookie = headers().get('cookie')
  const account = getAccount(cookie)
  const chainId = getChainId(cookie)

  const transactionsPromise = actionFetchTransactions(account, chainId)

  return (
    <>
      <div className="mx-auto mt-6 flex max-w-7xl items-center justify-center p-8">
        <Suspense fallback={<div>Loading...</div>}>
          <Transactions transactionsPromise={transactionsPromise} />
        </Suspense>
      </div>
    </>
  )
}
