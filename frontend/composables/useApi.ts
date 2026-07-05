import axios from 'axios'

let isRefreshing  = false
let refreshQueue: ((token: string) => void)[] = []

export function useApi() {
  const config  = useRuntimeConfig()
  const base    = config.public.apiBase as string

  const getToken = () => process.client ? localStorage.getItem('accessToken') : null

  const client = axios.create({ baseURL: base })

  client.interceptors.request.use((cfg) => {
    const token = getToken()
    if (token) cfg.headers.Authorization = `Bearer ${token}`
    return cfg
  })

  client.interceptors.response.use(
    (res) => res,
    async (err) => {
      const original = err.config
      if (err.response?.status === 401 && err.response?.data?.code === 'TOKEN_EXPIRED' && !original._retry) {
        if (isRefreshing) {
          return new Promise((resolve) => {
            refreshQueue.push((token) => {
              original.headers.Authorization = `Bearer ${token}`
              resolve(client(original))
            })
          })
        }

        original._retry = true
        isRefreshing    = true

        try {
          const refreshToken = process.client ? localStorage.getItem('refreshToken') : null
          if (!refreshToken) throw new Error('No refresh token')

          const res = await axios.post(`${base}/auth/refresh`, { refreshToken })
          const { accessToken, refreshToken: newRefresh } = res.data.data

          if (process.client) {
            localStorage.setItem('accessToken',  accessToken)
            localStorage.setItem('refreshToken', newRefresh)
          }

          refreshQueue.forEach((cb) => cb(accessToken))
          refreshQueue = []

          original.headers.Authorization = `Bearer ${accessToken}`
          return client(original)
        } catch {
          if (process.client) {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            window.location.href = '/auth/login'
          }
          return Promise.reject(err)
        } finally {
          isRefreshing = false
        }
      }
      return Promise.reject(err)
    }
  )

  async function request(method: string, url: string, data?: any, params?: any) {
    try {
      const res = await client.request({ method, url, data, params })
      return res.data
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Network error'
      throw Object.assign(new Error(msg), { response: err.response })
    }
  }

  return {
    get:      (url: string, params?: any)       => request('GET',    url, undefined, params),
    post:     (url: string, data?: any)          => request('POST',   url, data),
    put:      (url: string, data?: any)          => request('PUT',    url, data),
    del:      (url: string)                      => request('DELETE', url),
    postForm: (url: string, fd: FormData)        => request('POST',   url, fd),
    putForm:  (url: string, fd: FormData)        => request('PUT',    url, fd),
    baseUrl:  base,
  }
}
