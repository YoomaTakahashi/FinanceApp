import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

export const useTransactionStore = defineStore('transactions', {
  state: () => ({
    items:    [] as any[],
    current:  null as any,
    meta:     null as any,
    loading:  false,
    filters:  {
      page: 1, limit: 20, type: '', category_id: '', status: '',
      search: '', date_from: '', date_to: '', sort: 'transaction_date', order: 'DESC',
    },
  }),

  actions: {
    async fetch(params = {}) {
      this.loading = true
      try {
        const { get } = useApi()
        const query = { ...this.filters, ...params }
        const res   = await get('/transactions', query)
        this.items  = res.data
        this.meta   = res.meta
        return res
      } finally {
        this.loading = false
      }
    },

    async fetchOne(id: number) {
      const { get } = useApi()
      const res     = await get(`/transactions/${id}`)
      this.current  = res.data
      return res.data
    },

    async create(data: any) {
      if (data.slip instanceof File) {
        const { postForm } = useApi()
        return postForm('/transactions', buildFormData(data))
      }
      const { post } = useApi()
      const { slip, ...payload } = data
      return post('/transactions', payload)
    },

    async update(id: number, data: any) {
      if (data.slip instanceof File) {
        const { putForm } = useApi()
        return putForm(`/transactions/${id}`, buildFormData(data))
      }
      const { put } = useApi()
      const { slip, ...payload } = data
      return put(`/transactions/${id}`, payload)
    },

    async remove(id: number) {
      const { del } = useApi()
      return del(`/transactions/${id}`)
    },

    async restore(id: number) {
      const { post } = useApi()
      return post(`/transactions/${id}/restore`, {})
    },

    async duplicate(id: number) {
      const { post } = useApi()
      return post(`/transactions/${id}/duplicate`, {})
    },

    async uploadSlip(id: number, file: File) {
      const { postForm } = useApi()
      const fd = new FormData()
      fd.append('slip', file)
      return postForm(`/transactions/${id}/slip`, fd)
    },

    async deleteSlip(id: number) {
      const { del } = useApi()
      return del(`/transactions/${id}/slip`)
    },

    setFilter(key: string, value: any) {
      (this.filters as any)[key] = value
      this.filters.page = 1
    },

    resetFilters() {
      this.filters = {
        page: 1, limit: 20, type: '', category_id: '', status: '',
        search: '', date_from: '', date_to: '', sort: 'transaction_date', order: 'DESC',
      }
    },
  },
})

function buildFormData(data: any): FormData {
  const fd = new FormData()
  Object.entries(data).forEach(([k, v]) => {
    if (v instanceof File) {
      fd.append(k, v)
    } else if (v !== undefined && v !== null) {
      fd.append(k, String(v))
    }
  })
  return fd
}
