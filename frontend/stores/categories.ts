import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

export const useCategoryStore = defineStore('categories', {
  state: () => ({
    items:   [] as any[],
    loading: false,
  }),

  getters: {
    defaultCategories: (s) => s.items.filter((c: any) => c.is_default),
    customCategories:  (s) => s.items.filter((c: any) => !c.is_default),
    incomeCategories:  (s) => s.items.filter((c: any) => c.type === 'income' || c.type === 'both'),
    expenseCategories: (s) => s.items.filter((c: any) => c.type === 'expense' || c.type === 'both'),
  },

  actions: {
    async fetch() {
      this.loading = true
      try {
        const { get } = useApi()
        const res   = await get('/categories')
        this.items  = res.data
        return res.data
      } finally {
        this.loading = false
      }
    },

    async create(data: any) {
      const { post } = useApi()
      const res = await post('/categories', data)
      this.items.push(res.data)
      return res.data
    },

    async update(id: number, data: any) {
      const { put } = useApi()
      const res = await put(`/categories/${id}`, data)
      const idx = this.items.findIndex((c: any) => c.id === id)
      if (idx !== -1) this.items[idx] = res.data
      return res.data
    },

    async remove(id: number) {
      const { del } = useApi()
      await del(`/categories/${id}`)
      this.items = this.items.filter((c: any) => Number(c.id) !== Number(id))
    },
  },
})
