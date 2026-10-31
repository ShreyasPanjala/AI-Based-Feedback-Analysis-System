import axios from 'axios'
import { demoApi } from './demo'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
const localHost = ['localhost', '127.0.0.1'].includes(window.location.hostname)
export const demoMode = import.meta.env.VITE_DEMO_MODE === 'true' || (!localHost && !import.meta.env.VITE_API_BASE_URL)

export const api = demoMode ? demoApi : axios.create({ baseURL, timeout: 8000 })
export const adminApi = demoMode ? demoApi : axios.create({ baseURL, timeout: 8000 })

export async function signIn(username, password) {
  if (demoMode) {
    if (username !== 'admin' || password !== 'admin123') throw new Error('Invalid demo admin credentials.')
    return
  }
  await adminApi.get('/reports/summary', { auth: { username, password } })
  adminApi.defaults.auth = { username, password }
}

export function signOut() {
  if (!demoMode) delete adminApi.defaults.auth
}

export function errorMessage(error) {
  const data = error.response?.data
  if (data?.fields) return Object.entries(data.fields).map(([field, message]) => `${field}: ${message}`).join('; ')
  if (error.response?.status === 401) return 'Incorrect admin credentials. Please try again.'
  if (!demoMode && !error.response) return `Cannot reach Spring Boot at ${baseURL}. Start the backend or configure a public HTTPS API URL.`
  return data?.error || data?.message || error.message || 'Request failed'
}
