import dayjs from 'dayjs'
import 'dayjs/locale/th'
import relativeTime from 'dayjs/plugin/relativeTime'
import buddhistEra from 'dayjs/plugin/buddhistEra'

dayjs.extend(relativeTime)
dayjs.extend(buddhistEra)

// English format → Thai equivalent (Buddhist era year)
const thaiFormatMap: Record<string, string> = {
  'MMM DD, YYYY':       'DD MMM BBBB',
  'MMM DD, YYYY HH:mm': 'DD MMM BBBB HH:mm',
  'MMM DD':             'DD MMM',
}

export function useFormatters() {
  const settingsStore = useSettingsStore()
  const { t } = useLocale()

  const isThai = () => (settingsStore.settings?.language || 'en') === 'th'

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
    if (isThai()) {
      return dayjs(date).locale('th').format(thaiFormatMap[fmt] || fmt)
    }
    return dayjs(date).format(fmt)
  }

  function formatDateTime(date: string | Date) {
    return formatDate(date, 'MMM DD, YYYY HH:mm')
  }

  function fromNow(date: string | Date) {
    return dayjs(date).locale(isThai() ? 'th' : 'en').fromNow()
  }

  function capitalize(str: string) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
  }

  function paymentMethodLabel(method: string) {
    const map: Record<string, string> = {
      cash:          t('pay.cash'),
      card:          t('pay.card'),
      bank_transfer: t('pay.bank'),
      e_wallet:      t('pay.ewallet'),
      other:         t('pay.other'),
    }
    return map[method] || method
  }

  return { currency, formatDate, formatDateTime, fromNow, capitalize, paymentMethodLabel }
}
