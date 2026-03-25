import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

const API_URL = 'http://192.168.8.16:8081'
// Replace YOUR_LOCAL_IP with your actual local IP
// Find it by running: ipconfig (Windows) — look for IPv4 Address

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true,
})

// Attach access token to every request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
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
        const res = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true })
        const newToken = res.data.accessToken
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