'use client'

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { useCallback, useMemo } from 'react'
import { formatUnits } from 'viem'
import { useAccount, useBalance, useConnect, useDisconnect, useSwitchChain } from 'wagmi'

import { copyToClipboard, formatBalance, shortenAddress } from '@/utils'

import { Ping, Spin } from '../Animation'

export default function Home() {
  const { connectors, connect } = useConnect()
  const { address, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const { chains, switchChain, isPending } = useSwitchChain()
  const { data: balanceData, isLoading } = useBalance({ address })

  const connector = useMemo(() => {
    return connectors.find((item) => item.id === 'injected')
  }, [connectors])

  const onConnect = useCallback(() => {
    if (!connector) return

    connect({ connector })
  }, [connect, connector])

  const onDisconnect = useCallback(() => {
    if (!connector) return

    disconnect({ connector })
  }, [connector, disconnect])

  const balanceDisplay = useMemo(() => {
    if (!balanceData) return ''

    return `${formatBalance(formatUnits(balanceData.value, balanceData.decimals))} ${balanceData.symbol}`
  }, [balanceData])

  return (
    <div className="flex flex-1 items-center justify-end gap-x-6">
      {!address && (
        <button onClick={onConnect} className="btn btn-primary">
          Connect Wallet
        </button>
      )}

      {address && (
        <>
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <MenuButton className="relative inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 font-medium text-gray-900 hover:bg-gray-50">
                {isPending && (
                  <div className="absolute -left-1 top-1">
                    <Ping />
                  </div>
                )}
                {chain ? (
                  <>
                    <svg className="h-6 w-6">
                      <use href={`#icon-${chain.name.toLowerCase()}`} />
                    </svg>
                    {chain.name}
                  </>
                ) : (
                  'unsupported chain'
                )}
                <ChevronDownIcon aria-hidden="true" className="-mr-1 h-5 w-5 text-gray-400" />
              </MenuButton>
            </div>

            <MenuItems
              transition
              className="absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
            >
              <div className="py-1">
                {chains.map((item) => (
                  <MenuItem key={item.id}>
                    <button onClick={() => switchChain({ chainId: item.id })} className="flex w-full gap-2 px-4 py-2 text-left text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900">
                      <svg className="h-6 w-6">
                        <use href={`#icon-${item.name.toLowerCase()}`} />
                      </svg>
                      {item.name}
                    </button>
                  </MenuItem>
                ))}
              </div>
            </MenuItems>
          </Menu>

          <Menu as="div" className="relative inline-block text-left">
            <div>
              <MenuButton className="relative inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 font-medium text-gray-900 hover:bg-gray-50">
                {isLoading && (
                  <div className="absolute -left-1 top-1">
                    <Ping />
                  </div>
                )}
                {shortenAddress(address)}
                <ChevronDownIcon aria-hidden="true" className="-mr-1 h-5 w-5 text-gray-400" />
              </MenuButton>
            </div>

            <MenuItems
              transition
              className="absolute right-0 z-10 mt-2 origin-top-right text-nowrap rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
            >
              <div className="py-1">
                <MenuItem>
                  <div className="truncate px-3.5 py-2">
                    <div className="block text-sm text-gray-500">Balance</div>
                    <div className="mt-1 text-sm text-gray-700">{isLoading ? <Spin /> : balanceDisplay}</div>
                  </div>
                </MenuItem>
              </div>
              <div className="border-t border-gray-100 py-2">
                <MenuItem>
                  <button className="block w-full px-4 py-2 text-left text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900">Transaction history</button>
                </MenuItem>
                <MenuItem>
                  <button onClick={() => copyToClipboard(address)} className="block w-full px-4 py-2 text-left text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900">
                    Copy address
                  </button>
                </MenuItem>
                <MenuItem>
                  <button onClick={onDisconnect} className="block w-full px-4 py-2 text-left text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900">
                    Disconnect
                  </button>
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
        </>
      )}
    </div>
  )
}
