import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: {
      theme:          'dark',
      currency:       'USD',
      currency_symbol: '$',
      language:       'en',
      timezone:       'UTC',
      notify_daily:   true,
      notify_weekly:  true,
      notify_monthly: true,
      notify_bill:    true,
      notify_expense: true,
      notify_income:  true,
      monthly_budget: null as number | null,
    } as any,
    loading: false,
  }),

  actions: {
    async fetch() {
      this.loading = true
      try {
        const { get } = useApi()
        const res       = await get('/settings')
        this.settings   = res.data
        return res.data
      } finally {
        this.loading = false
      }
    },

    async update(data: any) {
      const { put } = useApi()
      const res       = await put('/settings', data)
      this.settings   = res.data
      return res.data
    },
  },
})
