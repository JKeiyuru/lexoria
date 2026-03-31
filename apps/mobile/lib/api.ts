import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

// Your computer's local IP — must be the same network as your phone
// Expo is on 192.168.8.37 so your API should be on the same IP
const API_URL = 'http://192.168.8.37:3001'

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach access token to every request
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {}
  return config
})

// Auto-refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const res = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        const newToken = String(res.data.accessToken)
        await SecureStore.setItemAsync('accessToken', newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch {
        await SecureStore.deleteItemAsync('accessToken')
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)