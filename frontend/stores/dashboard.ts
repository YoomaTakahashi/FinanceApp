import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    summary:            null as any,
    monthlyChart:       [] as any[],
    weeklyChart:        [] as any[],
    topCategories:      [] as any[],
    recentTransactions: [] as any[],
    loading:            false,
  }),

  actions: {
    async fetchAll() {
      this.loading = true
      try {
        const { get } = useApi()
        const [summary, monthly, weekly, topCats, recent] = await Promise.all([
          get('/dashboard/summary'),
          get('/dashboard/chart/monthly'),
          get('/dashboard/chart/weekly'),
          get('/dashboard/top-categories', { type: 'expense', limit: 5 }),
          get('/dashboard/recent-transactions', { limit: 8 }),
        ])
        this.summary            = summary.data
        this.monthlyChart       = monthly.data
        this.weeklyChart        = weekly.data
        this.topCategories      = topCats.data
        this.recentTransactions = recent.data
      } finally {
        this.loading = false
      }
    },

    async fetchSummary() {
      const { get } = useApi()
      const res     = await get('/dashboard/summary')
      this.summary  = res.data
    },
  },
})
