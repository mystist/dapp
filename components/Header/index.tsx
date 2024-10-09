'use client'

import ConnectWallet from '../ConnectWallet'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Basic', href: '/basic' },
]

export default function Home() {
  return (
    <header className="bg-white font-sans">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-x-6 p-6 px-8">
        <div className="flex flex-1">
          <a href="/">
            <span>dapp</span>
          </a>
        </div>
        <div className="flex gap-x-12">
          {navigation.map((item) => (
            <a key={item.name} href={item.href} className="font-medium leading-6 text-gray-900">
              {item.name}
            </a>
          ))}
        </div>

        <ConnectWallet />
      </nav>
    </header>
  )
}
