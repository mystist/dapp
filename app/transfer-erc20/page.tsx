import dynamic from 'next/dynamic'

const Form = dynamic(() => import('./form'), { ssr: false })

export default function Home() {
  return (
    <>
      <div className="mx-auto mt-6 flex max-w-2xl items-center justify-center p-8">
        <div className="pb-12">
          <h2 className="flex items-baseline gap-1 text-base font-semibold leading-7 text-gray-900">
            <span>Transfer (ERC-20)</span>
            <span className="text-sm font-normal">(Sepolia only)</span>
          </h2>
          <p className="mt-1 flex gap-1.5 text-sm leading-6 text-gray-600">
            <span>{`Send ERC-20 token "MTK" to anther address through Smart Contract.`}</span>
            <a href="https://sepolia.etherscan.io/address/0xa677F65460E1d6cb09c42308010e6AbBeB67cd5B" target="_blank" className="text-blue-700 underline">
              View Contract
            </a>
          </p>
          <Form />
        </div>
      </div>
    </>
  )
}
