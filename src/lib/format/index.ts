export const formatPrice = (
  intPrice: number,
  currency: 'USD' | 'GBP' | 'EUR' = 'USD'
) => {
  return (intPrice / 100).toLocaleString('en-US', {
    style: 'currency',
    currency,
  })
}
