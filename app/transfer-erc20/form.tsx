'use client'

import BigNumber from 'bignumber.js'
import { FormEvent, useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { encodeFunctionData, formatEther, parseUnits } from 'viem'
import { BaseError, useAccount } from 'wagmi'
import { estimateFeesPerGas, estimateGas, readContracts, simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'
import { z } from 'zod'

import { Ping, Spin } from '@/components/Animation'
import Notification from '@/components/Notification'
import { config } from '@/config'
import { getContract } from '@/config/contracts'
import { ContractInfo, Transaction } from '@/interfaces'
import { actionPostTransaction, actionUpdateTransaction } from '@/requests/actions'
import { transferSchema } from '@/schemas'
import { useRefreshStore } from '@/store'
import { classNames } from '@/utils'

export default function Form() {
  const [errorMsg, setErrorMsg] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [isEstimating, setIsEstimating] = useState(false)
  const [gasLimit, setGasLimit] = useState<bigint>()
  const [maxFeePerGas, setMaxFeePerGas] = useState<bigint>()
  const [contractInfo, setContractInfo] = useState<null | ContractInfo>(null)

  const { address, chainId } = useAccount()

  const [isPosting, startPostTransition] = useTransition()
  const [isUpdating, startUpdateTransition] = useTransition()

  const refresh = useRefreshStore((state) => state.refresh)

  const onPostSubmit = useCallback(
    async ({ txHash, to, value: rawValue, decimals, symbol, action }: { txHash: `0x${string}`; to: string; value: bigint; decimals: number; symbol: string; action: string }) => {
      if (!chainId || !address) return

      try {
        setTxHash(txHash)
        setIsSuccess(false)
        setIsOpen(true)

        const now = new Date().toISOString()
        const value = BigNumber(rawValue.toString()).toFixed()
        const transaction: Transaction = { chainId, txHash, address, recipientAddress: to, value, decimals, symbol, action, date: now, status: 'pending' }

        startPostTransition(() => actionPostTransaction(transaction))

        setIsLoading(true)
        await waitForTransactionReceipt(config, { hash: txHash })

        setIsSuccess(true)
      } catch (error) {
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    },
    [address, chainId],
  )

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()

      try {
        setErrorMsg('')
        setIsPending(true)

        if (!chainId) return
        if (!contractInfo || !gasLimit || !maxFeePerGas) return

        const { abi, address: contractAddress, balance, decimals, symbol } = contractInfo

        const formData = Object.fromEntries(new FormData(e.target as HTMLFormElement))

        const { to, amount } = transferSchema.parse(formData)
        const value = parseUnits(amount, decimals)
        const feeWithBuffer = BigInt(BigNumber(maxFeePerGas.toString()).times(1.1).toFixed(0))

        if (balance >= value) {
          const action = 'transfer'
          const { request } = await simulateContract(config, { abi, address: contractAddress, functionName: action, gas: gasLimit, maxFeePerGas: feeWithBuffer, args: [to, value] })
          const txHash = await writeContract(config, request)

          onPostSubmit({ txHash, to, value, decimals, symbol, action })
        }
      } catch (error) {
        console.log(error)

        if (error instanceof z.ZodError) {
          setErrorMsg(error.errors[0].message || '')
        }
      } finally {
        setIsPending(false)
      }
    },
    [chainId, contractInfo, gasLimit, maxFeePerGas, onPostSubmit],
  )

  const formattedGasFee = useMemo(() => {
    if (!gasLimit || !maxFeePerGas) return

    const gasFee = BigInt(BigNumber(gasLimit.toString()).times(maxFeePerGas.toString()).toFixed())

    return `${formatEther(gasFee)} ETH`
  }, [gasLimit, maxFeePerGas])

  const estimate = useCallback(
    async ({ to: rawTo, amount: rawAmount }: { to: string; amount: string }) => {
      if (!contractInfo) return

      try {
        setIsEstimating(true)

        const { abi, address: contractAddress, balance, decimals } = contractInfo

        const amount = BigNumber(rawAmount).toFixed()
        const to = rawTo as `0x${string}`
        const value = parseUnits(amount, decimals)

        if (balance < value) {
          setErrorMsg('Insufficient balance')
        } else {
          const encodedData = encodeFunctionData({
            abi,
            functionName: 'transfer',
            args: [to, value],
          })

          const gasLimit = await estimateGas(config, { to: contractAddress, data: encodedData })
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
    [contractInfo],
  )

  useEffect(() => {
    ;(async () => {
      if (!address || !chainId) return {}

      const contract = getContract(chainId, 'MTK')
      if (!contract) return {}

      const mtkContract = { abi: contract.abi, address: contract.address }

      const results = await readContracts(config, {
        contracts: [
          { ...mtkContract, functionName: 'balanceOf', args: [address] },
          { ...mtkContract, functionName: 'decimals' },
          { ...mtkContract, functionName: 'symbol' },
        ],
      })

      setContractInfo({ abi: contract.abi, address: contract.address, balance: results[0].result as bigint, decimals: results[1].result as number, symbol: results[2].result as string })
    })()
  }, [address, chainId])

  useEffect(() => {
    if (!txHash || !(isSuccess || isError)) return

    startUpdateTransition(() => actionUpdateTransaction(txHash, isSuccess ? 'success' : 'error'))
    refresh()
  }, [txHash, isError, isSuccess, refresh])

  useEffect(() => {
    setErrorMsg('')
    setGasLimit(undefined)
    setMaxFeePerGas(undefined)

    if (!toAddress || !amount || +amount < 0) return

    estimate({ to: toAddress, amount })
  }, [amount, estimate, toAddress])

  useEffect(() => {
    if (!chainId) return

    setIsOpen(false)
  }, [chainId])

  return (
    <>
      <form onSubmit={onSubmit}>
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
                  MTK
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          {address ? (
            <div className="flex items-center gap-x-6">
              <button disabled={isPending || !formattedGasFee} type="submit" className={classNames(isPending || !formattedGasFee ? 'cursor-not-allowed opacity-50' : '', 'btn btn-secondary relative flex items-center gap-1')}>
                {isPending && (
                  <div className="text-gray-700">
                    <Spin />
                  </div>
                )}
                <span>Submit</span>
                {(isPosting || isUpdating) && (
                  <div className="absolute right-0 top-0 -mr-1 -mt-1">
                    <Ping />
                  </div>
                )}
              </button>
              {errorMsg && <span className="text-sm text-red-600">{errorMsg}</span>}
              {(isEstimating || formattedGasFee) && (
                <span className="relative text-sm">
                  {isEstimating && (
                    <div className="absolute right-0 top-0 -mr-4 -mt-1">
                      <Ping />
                    </div>
                  )}
                  <span>Estimated gas: {isEstimating ? 'Estimating...' : formattedGasFee}</span>
                </span>
              )}
            </div>
          ) : (
            <span className="font-medium">Please connect wallet</span>
          )}
        </div>
      </form>

      <Notification isOpen={isOpen} setIsOpen={setIsOpen} hash={txHash} isLoading={isLoading} isSuccess={isSuccess} />
    </>
  )
}
