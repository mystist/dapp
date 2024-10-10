'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { parseEther } from 'viem'
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { z } from 'zod'

import { Spin } from '@/components/Animation'
import Notification from '@/components/Notification'
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

  const { address } = useAccount()
  const { data: balanceData } = useBalance({ address })

  const { data: hash, sendTransaction, isPending } = useSendTransaction()
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash })

  const refresh = useRefreshStore((state) => state.refresh)

  useEffect(() => {
    if (isSuccess) refresh()
  }, [isSuccess, refresh])

  const onSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      setErrorMsg('')

      if (!balanceData || balanceData.decimals !== 18) return

      const formData = Object.fromEntries(new FormData(e.target as HTMLFormElement))

      try {
        const { to, amount } = schema.parse(formData)
        const value = parseEther(amount)

        if (balanceData.value < value) {
          setErrorMsg('Insufficient balance')
        } else {
          sendTransaction({ to, value }, { onSuccess: () => setIsOpen(true) })
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          setErrorMsg(error.errors[0].message || '')
        }
      }
    },
    [balanceData, sendTransaction],
  )

  return (
    <>
      <form onSubmit={onSubmit}>
        <div className="pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Transfer</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">Send ETH to anther address through the Ethereum protocol (No Contact interaction).</p>

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
                    ETH
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
