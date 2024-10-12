import BigNumber from 'bignumber.js'

export const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ')
}

export const shortenAddress = (address: string, chars = 4) => {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export const copyToClipboard = (address: string) => {
  navigator.clipboard.writeText(address)
}

export const formatBalance = (rawBalance: string) => {
  const balance = BigNumber(rawBalance)

  if (balance.gte(0.0001)) {
    return BigNumber(balance.toFixed(4)).toString()
  } else if (balance.gte(0.000001)) {
    return BigNumber(balance.toFixed(6)).toString()
  } else {
    return '<0.000001'
  }
}
