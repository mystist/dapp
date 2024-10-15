import dynamic from 'next/dynamic'

const Form = dynamic(() => import('./form'), { ssr: false })

export default function Home() {
  return (
    <>
      <div className="mx-auto mt-6 flex max-w-2xl items-center justify-center p-8">
        <div className="pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Transfer</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">Send ETH to anther address through the Ethereum protocol.</p>
          <Form />
        </div>
      </div>
    </>
  )
}
