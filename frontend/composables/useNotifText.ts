// Notifications are stored in English in the DB; translate known templates
// on display so they follow the selected language instantly.
export function useNotifText() {
  const { t } = useLocale()

  function notifTitle(notif: any): string {
    if (notif.title === 'Welcome to FinanceApp!') return t('notif.welcome_title')
    if (notif.title === 'Large Expense Alert')    return t('notif.large_expense_title')
    return notif.title
  }

  function notifMessage(notif: any): string {
    if (notif.title === 'Welcome to FinanceApp!') return t('notif.welcome_msg')
    const large = notif.message?.match(/^You recorded a large expense of (.+) for "(.+)"$/)
    if (large) {
      return t('notif.large_expense_msg')
        .replace('{amount}', large[1])
        .replace('{title}', large[2])
    }
    return notif.message
  }

  return { notifTitle, notifMessage }
}
