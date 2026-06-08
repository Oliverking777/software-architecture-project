import axios from 'axios'

// ── Base instance ─────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://dsas-app.tsgpcorporation.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request interceptor — attach JWT token if present ─────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dsas_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor — handle 401 globally ────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect to login
      localStorage.removeItem('dsas_token')
      localStorage.removeItem('dsas_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api