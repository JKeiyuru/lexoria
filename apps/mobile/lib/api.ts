import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import Constants from 'expo-constants'

// Dynamically derive API URL from Expo's host
// This means it always matches your current IP — no more manual updates
const getApiUrl = (): string => {
  const expoHost =
    Constants.expoConfig?.hostUri ||
    Constants.manifest?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost

  if (expoHost) {
    const host = expoHost.split(':')[0]
    return `http://${host}:3001`
  }

  // Fallback for production builds
  return 'http://localhost:3001'
}

const API_URL = getApiUrl()
console.log('API URL:', API_URL)

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