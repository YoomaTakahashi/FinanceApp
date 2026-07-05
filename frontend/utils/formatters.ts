import dayjs from 'dayjs'

export function formatCurrency(amount: number | string, symbol = '$'): string {
  const num = parseFloat(String(amount)) || 0
  return `${symbol}${Math.abs(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(date: string | Date, fmt = 'MMM DD, YYYY'): string {
  return dayjs(date).format(fmt)
}

export function formatRelative(date: string | Date): string {
  const d = dayjs(date)
  const diff = dayjs().diff(d, 'day')
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7) return `${diff} days ago`
  return d.format('MMM DD')
}
