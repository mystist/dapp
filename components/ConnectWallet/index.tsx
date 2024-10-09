'use client'

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { useCallback, useMemo } from 'react'
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi'

import { copyToClipboard, shortenAddress } from '@/utils'

export default function Home() {
  const { connectors, connect } = useConnect()
  const { address, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const { chains, switchChain } = useSwitchChain()

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

  return (
    <div className="flex flex-1 items-center justify-end gap-x-6">
      {!address && (
        <button
          onClick={onConnect}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Connect Wallet
        </button>
      )}

      {address && (
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 font-medium text-gray-900 hover:bg-gray-50">
              {chain ? chain.name : 'unsupported chain'}
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
                  <button onClick={() => switchChain({ chainId: item.id })} className="block w-full px-4 py-2 text-left text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900">
                    {item.name}
                  </button>
                </MenuItem>
              ))}
            </div>
          </MenuItems>
        </Menu>
      )}

      {address && (
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 font-medium text-gray-900 hover:bg-gray-50">
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
      )}
    </div>
  )
}
