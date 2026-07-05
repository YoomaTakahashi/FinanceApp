import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    items:       [] as any[],
    meta:        null as any,
    unreadCount: 0,
    loading:     false,
  }),

  actions: {
    async fetch(params = {}) {
      this.loading = true
      try {
        const { get } = useApi()
        const res = await get('/notifications', { page: 1, limit: 30, ...params })
        this.items       = res.data
        this.meta        = res.meta
        this.unreadCount = res.unread_count
        return res
      } finally {
        this.loading = false
      }
    },

    async fetchUnreadCount() {
      const { get } = useApi()
      const res        = await get('/notifications/unread-count')
      this.unreadCount = res.data.count
      return res.data.count
    },

    async markRead(id: number) {
      const { put } = useApi()
      await put(`/notifications/${id}/read`, {})
      const item = this.items.find((n: any) => n.id === id)
      if (item && !item.is_read) {
        item.is_read     = 1
        this.unreadCount = Math.max(0, this.unreadCount - 1)
      }
    },

    async markAllRead() {
      const { put } = useApi()
      await put('/notifications/mark-all-read', {})
      this.items.forEach((n: any) => (n.is_read = 1))
      this.unreadCount = 0
    },

    async remove(id: number) {
      const { del } = useApi()
      await del(`/notifications/${id}`)
      const item = this.items.find((n: any) => n.id === id)
      if (item && !item.is_read) this.unreadCount = Math.max(0, this.unreadCount - 1)
      this.items = this.items.filter((n: any) => n.id !== id)
    },
  },
})
