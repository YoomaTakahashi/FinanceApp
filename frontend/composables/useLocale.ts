import en, { type LocaleKey } from '~/locales/en'
import th from '~/locales/th'

const messages = { en, th } as const

export function useLocale() {
  const settingsStore = useSettingsStore()
  const locale = computed<'en' | 'th'>(() =>
    (settingsStore.settings?.language as 'en' | 'th') || 'en'
  )

  function t(key: LocaleKey): string {
    return messages[locale.value]?.[key] ?? messages.en[key] ?? key
  }

  return { t, locale }
}
