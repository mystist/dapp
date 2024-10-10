'use client'

import { Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { useMemo } from 'react'
import { useAccount } from 'wagmi'

import { shortenAddress } from '@/utils'

import { Ping } from '../Animation'

export default function Home({ isOpen = false, setIsOpen, hash, isLoading, isSuccess }: { isOpen: boolean; setIsOpen: (isOpen: boolean) => void; hash: string | undefined; isLoading: boolean; isSuccess: boolean }) {
  const { chain } = useAccount()

  const blockExplorer = useMemo(() => {
    if (!chain) return

    return chain.blockExplorers
  }, [chain])

  return (
    <>
      <div className="pointer-events-none fixed inset-0 top-16 flex items-end px-4 py-6 sm:items-start sm:p-6">
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          <Transition show={isOpen}>
            <div className="pointer-events-auto relative w-full max-w-sm rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition data-[closed]:data-[enter]:translate-y-2 data-[enter]:transform data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-100 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:data-[enter]:sm:translate-x-2 data-[closed]:data-[enter]:sm:translate-y-0">
              {isLoading && (
                <div className="absolute left-0 top-0 -ml-1 -mt-1">
                  <Ping />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start">
                  {isSuccess && (
                    <div className="flex-shrink-0">
                      <CheckCircleIcon aria-hidden="true" className="h-6 w-6 text-green-400" />
                    </div>
                  )}
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">{isLoading ? 'Transaction Processing...' : isSuccess ? 'Transaction succeed' : 'Transaction initializing...'}</p>
                    {hash && blockExplorer && (
                      <p className="mt-1 text-sm text-gray-500">
                        <span className="mr-1">View on {blockExplorer.default.name}:</span>
                        <a href={`${blockExplorer.default.url}/tx/${hash}`} target="_blank" className="text-blue-700 underline">
                          {shortenAddress(hash)}
                        </a>
                      </p>
                    )}
                  </div>
                  <div className="ml-4 flex flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false)
                      }}
                      className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      <XMarkIcon aria-hidden="true" className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  )
}
