export function formatChips(amount: number): string {
  if (Number.isInteger(amount)) {
    return String(amount)
  }

  return amount.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}
