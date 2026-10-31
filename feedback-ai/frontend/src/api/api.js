import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export const api = axios.create({ baseURL, timeout: 8000 })
export const adminApi = axios.create({
  baseURL,
  timeout: 8000,
  auth: { username: 'admin', password: 'admin123' },
})

export function errorMessage(error) {
  const data = error.response?.data
  if (data?.fields) return Object.entries(data.fields).map(([field, message]) => `${field}: ${message}`).join('; ')
  return data?.error || data?.message || error.message || 'Request failed'
}
