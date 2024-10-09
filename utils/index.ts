export const shortenAddress = (address: string, chars = 4) => {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export const copyToClipboard = (address: string) => {
  navigator.clipboard.writeText(address)
}

export const formatBalance = (rawBalance: string) => {
  const balance = Number(rawBalance) // allow precision lose here

  if (balance >= 0.0001) {
    return Number(balance.toFixed(4)).toString()
  } else if (balance >= 0.000001) {
    return Number(balance.toFixed(6)).toString()
  } else {
    return '<0.000001'
  }
}
