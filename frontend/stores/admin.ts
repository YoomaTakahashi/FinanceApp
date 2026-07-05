import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    users:   [] as any[],
    meta:    null as any,
    stats:   null as any,
    loading: false,
  }),

  actions: {
    async fetchUsers(params = {}) {
      this.loading = true
      try {
        const { get } = useApi()
        const res  = await get('/admin/users', { page: 1, limit: 20, ...params })
        this.users = res.data
        this.meta  = res.meta
        return res
      } finally {
        this.loading = false
      }
    },

    async updateUser(id: number, data: any) {
      const { put } = useApi()
      const res = await put(`/admin/users/${id}`, data)
      const idx = this.users.findIndex((u: any) => u.id === id)
      if (idx !== -1) this.users[idx] = { ...this.users[idx], ...res.data }
      return res.data
    },

    async fetchStats() {
      const { get } = useApi()
      const res  = await get('/admin/stats')
      this.stats = res.data
      return res.data
    },
  },
})
