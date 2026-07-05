import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export function useFormatters() {
  const settingsStore = useSettingsStore()

  function currency(amount: number | string, showSign = false) {
    const num    = parseFloat(String(amount)) || 0
    const symbol = settingsStore.settings?.currency_symbol || '$'
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(num))
    const sign = showSign && num >= 0 ? '+' : ''
    return `${sign}${symbol}${formatted}`
  }

  function formatDate(date: string | Date, fmt = 'MMM DD, YYYY') {
    return dayjs(date).format(fmt)
  }

  function formatDateTime(date: string | Date) {
    return dayjs(date).format('MMM DD, YYYY HH:mm')
  }

  function fromNow(date: string | Date) {
    return dayjs(date).fromNow()
  }

  function capitalize(str: string) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
  }

  function paymentMethodLabel(method: string) {
    const map: Record<string, string> = {
      cash: 'Cash', card: 'Card', bank_transfer: 'Bank Transfer',
      e_wallet: 'E-Wallet', other: 'Other',
    }
    return map[method] || method
  }

  return { currency, formatDate, formatDateTime, fromNow, capitalize, paymentMethodLabel }
}
