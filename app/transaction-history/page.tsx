import dynamic from 'next/dynamic'

import { actionFetchTransactions } from '@/requests/actions'

const Transactions = dynamic(() => import('./transactions'), { ssr: false })

export default function Home() {
  const transactionsPromise = actionFetchTransactions()

  return (
    <>
      <div className="mx-auto mt-6 flex max-w-7xl items-center justify-center p-8">
        <Transactions transactionsPromise={transactionsPromise} />
      </div>
    </>
  )
}
