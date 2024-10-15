import dynamic from 'next/dynamic'
import Link from 'next/link'

import { Pulse } from '../Animation'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Transfer', href: '/transfer' },
  { name: 'Transfer (ERC-20)', href: '/transfer-erc20' },
]

const ConnectWallet = dynamic(() => import('@/components/ConnectWallet'), { ssr: false, loading: () => <Pulse /> })

export default function Home() {
  return (
    <header className="relative z-10 bg-white font-sans">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-x-20 p-6 px-8">
        <div className="flex flex-1">
          <Link href="/">
            <span>dapp</span>
          </Link>
        </div>
        <div className="flex gap-x-12">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href} className="font-medium leading-6 text-gray-900">
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex flex-1 items-center justify-end gap-4">
          <ConnectWallet />
        </div>
      </nav>
    </header>
  )
}
