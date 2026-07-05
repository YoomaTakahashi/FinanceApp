import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

interface User {
  id: number
  name: string
  email: string
  role: string
  avatar: string | null
  is_active: number
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  loading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user:         null,
    accessToken:  null,
    refreshToken: null,
    loading:      false,
  }),

  getters: {
    isAuthenticated: (s) => !!s.accessToken && !!s.user,
    isAdmin:         (s) => s.user?.role === 'admin',
    userAvatar:      (s) => s.user?.avatar || null,
    userName:        (s) => s.user?.name || '',
  },

  actions: {
    async login(email: string, password: string, rememberMe = false) {
      this.loading = true
      try {
        const { post } = useApi()
        const res = await post('/auth/login', { email, password, rememberMe })
        this.accessToken  = res.data.accessToken
        this.refreshToken = res.data.refreshToken
        this.user         = res.data.user
        this.persistTokens()
        return res.data
      } finally {
        this.loading = false
      }
    },

    async register(name: string, email: string, password: string) {
      this.loading = true
      try {
        const { post } = useApi()
        return await post('/auth/register', { name, email, password })
      } finally {
        this.loading = false
      }
    },

    async logout() {
      const { post } = useApi()
      try {
        await post('/auth/logout', { refreshToken: this.refreshToken })
      } catch {}
      this.clearAuth()
      navigateTo('/auth/login')
    },

    async refreshAccessToken() {
      if (!this.refreshToken) throw new Error('No refresh token')
      const { post } = useApi()
      const res = await post('/auth/refresh', { refreshToken: this.refreshToken })
      this.accessToken  = res.data.accessToken
      this.refreshToken = res.data.refreshToken
      this.user         = res.data.user
      this.persistTokens()
      return res.data.accessToken
    },

    async fetchMe() {
      const { get } = useApi()
      const res  = await get('/auth/me')
      this.user  = res.data
    },

    async updateProfile(formData: FormData | object) {
      const { put, putForm } = useApi()
      const res = formData instanceof FormData
        ? await putForm('/auth/profile', formData)
        : await put('/auth/profile', formData)
      this.user = res.data
      return res
    },

    persistTokens() {
      if (process.client) {
        localStorage.setItem('accessToken',  this.accessToken  || '')
        localStorage.setItem('refreshToken', this.refreshToken || '')
      }
    },

    loadFromStorage() {
      if (process.client) {
        this.accessToken  = localStorage.getItem('accessToken')  || null
        this.refreshToken = localStorage.getItem('refreshToken') || null
      }
    },

    clearAuth() {
      this.user         = null
      this.accessToken  = null
      this.refreshToken = null
      if (process.client) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      }
    },
  },
})
