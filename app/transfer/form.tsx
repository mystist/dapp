'use client'

import BigNumber from 'bignumber.js'
import { useSearchParams } from 'next/navigation'
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { formatEther, parseEther } from 'viem'
import { BaseError, useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { estimateFeesPerGas, estimateGas } from 'wagmi/actions'
import { z } from 'zod'

import { Ping, Spin } from '@/components/Animation'
import Notification from '@/components/Notification'
import { advanced, basic } from '@/config'
import { useRefreshStore } from '@/store'
import { classNames } from '@/utils'

const schema = z.object({
  to: z
    .string()
    .startsWith('0x', 'Address must start with 0x')
    .transform((val) => val as `0x${string}`),
  amount: z
    .string()
    .refine((val) => !!val && +val >= 0, 'Invalid amount')
    .transform((val) => BigNumber(val).toFixed()),
})

export default function Form() {
  const [errorMsg, setErrorMsg] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [isEstimating, setIsEstimating] = useState(false)
  const [gasLimit, setGasLimit] = useState<bigint>()
  const [maxFeePerGas, setMaxFeePerGas] = useState<bigint>()

  const searchParams = useSearchParams()

  const { address } = useAccount()
  const { data: balanceData } = useBalance({ address })

  const { data: hash, sendTransaction, isPending } = useSendTransaction()
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash })

  const refresh = useRefreshStore((state) => state.refresh)

  const config = useMemo(() => {
    const isAdvanced = searchParams.get('advanced') === 'true'

    return isAdvanced ? advanced : basic
  }, [searchParams])

  const onSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      setErrorMsg('')

      if (!gasLimit || !maxFeePerGas) return

      try {
        const formData = Object.fromEntries(new FormData(e.target as HTMLFormElement))

        const { to, amount } = schema.parse(formData)
        const value = parseEther(amount)
        const feeWithBuffer = BigInt(BigNumber(maxFeePerGas.toString()).times(1.1).toFixed(0))

        sendTransaction({ to, value, gas: gasLimit, maxFeePerGas: feeWithBuffer }, { onSuccess: () => setIsOpen(true) })
      } catch (error) {
        console.log(error)

        if (error instanceof z.ZodError) {
          setErrorMsg(error.errors[0].message || '')
        }
      }
    },
    [gasLimit, maxFeePerGas, sendTransaction],
  )

  const formattedGasFee = useMemo(() => {
    if (!gasLimit || !maxFeePerGas) return

    const gasFee = BigInt(BigNumber(gasLimit.toString()).times(maxFeePerGas.toString()).toFixed())

    return `${formatEther(gasFee)} ETH`
  }, [gasLimit, maxFeePerGas])

  const estimate = useCallback(
    async ({ to: rawTo, amount: rawAmount, balance }: { to: string; amount: string; balance: bigint }) => {
      try {
        setIsEstimating(true)

        const amount = BigNumber(rawAmount).toFixed()
        const to = rawTo as `0x${string}`
        const value = parseEther(amount)

        if (balance < value) {
          setErrorMsg('Insufficient balance')
        } else {
          const gasLimit = await estimateGas(config, { to, value })
          const { maxFeePerGas } = await estimateFeesPerGas(config)

          setGasLimit(gasLimit)
          if (maxFeePerGas) setMaxFeePerGas(maxFeePerGas)
        }
      } catch (error) {
        console.log(error)

        if (error instanceof BaseError) {
          setErrorMsg(error.shortMessage)
        }
      } finally {
        setIsEstimating(false)
      }
    },
    [config],
  )

  useEffect(() => {
    if (isSuccess) refresh()
  }, [isSuccess, refresh])

  useEffect(() => {
    setErrorMsg('')
    setGasLimit(undefined)
    setMaxFeePerGas(undefined)

    if (!toAddress || !amount || +amount < 0) return
    if (!balanceData || balanceData.decimals !== 18) return

    const { value: balance } = balanceData

    estimate({ to: toAddress, amount, balance })
  }, [amount, balanceData, estimate, toAddress])

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
                  onBlur={(e) => setToAddress(e.target.value)}
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
                  onBlur={(e) => setAmount(e.target.value)}
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
                <button disabled={isPending || !formattedGasFee} type="submit" className={classNames(isPending || !formattedGasFee ? 'cursor-not-allowed opacity-50' : '', 'btn btn-secondary flex items-center gap-1')}>
                  {isPending && (
                    <div className="text-gray-700">
                      <Spin />
                    </div>
                  )}
                  <span>Submit</span>
                </button>
                {errorMsg && <span className="text-sm text-red-600">{errorMsg}</span>}
                {(isEstimating || formattedGasFee) && (
                  <span className="relative text-sm">
                    {isEstimating && (
                      <div className="absolute right-0 top-0 -mr-4 -mt-1">
                        <Ping />
                      </div>
                    )}
                    Estimated gas: {isEstimating ? 'Estimating...' : formattedGasFee}
                  </span>
                )}
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
