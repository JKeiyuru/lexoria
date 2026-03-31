import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import { api } from '../lib/api'

export interface User {
  id: string
  email: string
  username: string
  tier: 'FREE' | 'VIP'
  level: number
  totalXP: number
  avatarConfig: object
  streakDays: number
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  loadUser: () => Promise<void>
  updateUser: (data: Partial<User>) => void
}

interface RegisterData {
  email: string
  username: string
  password: string
  age?: number
}

const mapUser = (raw: any): User => ({
  id: raw.id,
  email: raw.email,
  username: raw.username,
  tier: raw.tier ?? 'FREE',
  level: raw.level ?? 1,
  totalXP: raw.totalXP ?? 0,
  avatarConfig: raw.avatarConfig ?? {},
  streakDays: raw.streakDays ?? 0,
})

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
  try {
    const res = await api.post('/auth/login', { email, password })
    console.log('LOGIN RESPONSE:', JSON.stringify(res.data))
    const token = String(res.data.accessToken)
    await SecureStore.setItemAsync('accessToken', token)
    set({
      user: mapUser(res.data.user),
      isAuthenticated: true,
      isLoading: false,
    })
  } catch (err: any) {
    console.error('LOGIN ERROR:', JSON.stringify(err?.response?.data || err?.message || err))
    throw err
  }
},

  register: async (data) => {
    try {
      const res = await api.post('/auth/register', data)
      const token = String(res.data.accessToken)
      await SecureStore.setItemAsync('accessToken', token)
      set({
        user: mapUser(res.data.user),
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (err: any) {
      console.error('REGISTER ERROR:', JSON.stringify(err?.response?.data || err?.message || err))
      throw err
    }
  },

  logout: async () => {
    try { await api.post('/auth/logout') } catch {}
    await SecureStore.deleteItemAsync('accessToken')
    set({ user: null, isAuthenticated: false, isLoading: false })
  },

 loadUser: async () => {
  try {
    const token = await SecureStore.getItemAsync('accessToken')
    if (!token) {
      set({ isLoading: false, isAuthenticated: false })
      return
    }
    const res = await api.get('/auth/me')
    console.log('LOAD USER RESPONSE:', JSON.stringify(res.data))
    set({
      user: mapUser(res.data.user),
      isAuthenticated: true,
      isLoading: false,
    })
  } catch (err) {
    console.error('LOAD USER ERROR:', err)
    await SecureStore.deleteItemAsync('accessToken')
    set({ isLoading: false, isAuthenticated: false, user: null })
  }
},

  updateUser: (data) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    })),
}))