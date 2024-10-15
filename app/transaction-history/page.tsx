import dynamic from 'next/dynamic'

const Transactions = dynamic(() => import('./transactions'), { ssr: false })

export default function Home() {
  return (
    <>
      <div className="mx-auto mt-6 flex max-w-7xl items-center justify-center p-8">
        <Transactions />
      </div>
    </>
  )
}
