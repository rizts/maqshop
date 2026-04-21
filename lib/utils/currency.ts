export const formatCurrency = (amount: number, currency: string = 'IDR') => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatNumber = (amount: number) => {
  return new Intl.NumberFormat('id-ID').format(amount)
}
