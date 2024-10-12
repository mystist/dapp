'use client'

import { Field, Label, Switch } from '@headlessui/react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'

import ConnectWallet from '../ConnectWallet'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Transfer', href: '/transfer' },
  { name: 'Transfer (ERC-20)', href: '/transfer-erc20' },
]

export default function Home() {
  const searchParams = useSearchParams()
  const [enabled, setEnabled] = useState(false)

  const { address } = useAccount()

  const isAdvanced = useMemo(() => searchParams.get('advanced') === 'true', [searchParams])

  const onToggle = (newState: boolean) => {
    const currentPath = window.location.pathname
    const newUrl = newState ? `${currentPath}?advanced=true` : currentPath

    window.location.href = newUrl
  }

  const getHref = (baseHref: string) => {
    return isAdvanced ? `${baseHref}?advanced=true` : baseHref
  }

  useEffect(() => {
    setEnabled(isAdvanced)
  }, [isAdvanced])

  return (
    <header className="relative z-10 bg-white font-sans">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-x-6 p-6 px-8">
        <div className="flex flex-1">
          <Link href={getHref('/')}>
            <span>dapp</span>
          </Link>
        </div>
        <div className="flex flex-1 gap-x-12">
          {navigation.map((item) => (
            <Link key={item.name} href={getHref(item.href)} className="font-medium leading-6 text-gray-900">
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-end gap-4">
          {!address && (
            <Field className="flex items-center">
              <Switch
                checked={enabled}
                onChange={onToggle}
                className="group relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out data-[checked]:bg-indigo-600"
              >
                <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-5" />
              </Switch>
              <Label as="span" className="ml-3 text-sm">
                <span className="font-medium text-gray-900">Advanced</span> <span className="text-gray-500">(Mobile compat wallet)</span>
              </Label>
            </Field>
          )}
          <ConnectWallet />
        </div>
      </nav>
    </header>
  )
}
