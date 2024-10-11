'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { parseUnits } from 'viem'
import { useAccount } from 'wagmi'
import { readContracts, simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'
import { z } from 'zod'

import { Spin } from '@/components/Animation'
import Notification from '@/components/Notification'
import { config } from '@/config'
import { getContract } from '@/config/contracts'
import { useRefreshStore } from '@/store'
import { classNames } from '@/utils'

const schema = z.object({
  to: z
    .string()
    .startsWith('0x', 'Address must start with 0x')
    .transform((val) => val as `0x${string}`),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, 'Invalid amount'),
})

export default function Form() {
  const [errorMsg, setErrorMsg] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [hash, setHash] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const { address, chain } = useAccount()

  const refresh = useRefreshStore((state) => state.refresh)

  useEffect(() => {
    if (isSuccess) refresh()
  }, [isSuccess, refresh])

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      setErrorMsg('')
      setIsPending(true)

      if (!address || !chain) return

      const contract = getContract(chain.id, 'MTK')
      if (!contract) return

      const mtkContract = {
        abi: contract.abi,
        address: contract.address,
      }

      const results = await readContracts(config, {
        contracts: [
          { ...mtkContract, functionName: 'balanceOf', args: [address] },
          { ...mtkContract, functionName: 'decimals' },
        ],
      })

      const balance = results[0].result as bigint
      const decimals = results[1].result as number

      const formData = Object.fromEntries(new FormData(e.target as HTMLFormElement))

      try {
        const { to, amount } = schema.parse(formData)
        const value = parseUnits(amount, decimals)

        if (balance < value) {
          setErrorMsg('Insufficient balance')
        } else {
          const { request } = await simulateContract(config, { ...mtkContract, functionName: 'transfer', args: [to, value] })
          console.log(request)
          const hash = await writeContract(config, request)

          setHash(hash)
          setIsSuccess(false)
          setIsOpen(true)
          setIsLoading(true)

          await waitForTransactionReceipt(config, { hash })

          setIsSuccess(true)
        }
      } catch (error) {
        console.log(error)

        if (error instanceof z.ZodError) {
          setErrorMsg(error.errors[0].message || '')
        }
      } finally {
        setIsPending(false)
        setIsLoading(false)
      }
    },
    [address, chain],
  )

  return (
    <>
      <form onSubmit={onSubmit}>
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

          <div className="mt-10 grid grid-cols-6 gap-x-6 gap-y-8">
            <div className="col-span-4">
              <label htmlFor="to" className="block text-sm font-medium leading-6 text-gray-900">
                Recipient address
              </label>
              <div className="mt-2">
                <input
                  id="to"
                  name="to"
                  type="text"
                  placeholder="0x..."
                  required
                  minLength={42}
                  maxLength={42}
                  className="block w-full rounded-md border-0 py-1.5 text-sm leading-6 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400"
                />
              </div>
            </div>
            <div className="col-span-2">
              <label htmlFor="amount" className="block text-sm font-medium leading-6 text-gray-900">
                Amount
              </label>
              <div className="relative mt-2 rounded-md shadow-sm">
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  step="any"
                  placeholder="0.00"
                  required
                  min={0}
                  className="block w-full rounded-md border-0 py-1.5 pr-12 text-sm leading-6 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <span id="price-currency" className="text-gray-500 sm:text-sm">
                    MTK
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            {address ? (
              <div className="flex items-center gap-x-6">
                <button disabled={isPending} type="submit" className={classNames(isPending ? 'cursor-not-allowed opacity-75' : '', 'btn btn-secondary flex items-center gap-1')}>
                  {isPending && (
                    <div className="text-gray-700">
                      <Spin />
                    </div>
                  )}
                  <span>Submit</span>
                </button>
                {errorMsg && <span className="text-sm text-red-600">{errorMsg}</span>}
              </div>
            ) : (
              <span className="font-medium">Please connect wallet</span>
            )}
          </div>
        </div>
      </form>
      <Notification isOpen={isOpen} setIsOpen={setIsOpen} hash={hash} isLoading={isLoading} isSuccess={isSuccess} />
    </>
  )
}
