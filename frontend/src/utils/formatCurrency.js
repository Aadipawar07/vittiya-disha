// Currency formatting utility - rounds exactly once at final display
export function formatCurrency(value, locale = 'en-IN', currency = 'INR') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

export function formatNumber(value, locale = 'en-IN') {
  return new Intl.NumberFormat(locale).format(value)
}
