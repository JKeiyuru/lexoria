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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    await SecureStore.setItemAsync('accessToken', res.data.accessToken)
    set({ user: res.data.user, isAuthenticated: true, isLoading: false })
  },

  register: async (data) => {
    const res = await api.post('/auth/register', data)
    await SecureStore.setItemAsync('accessToken', res.data.accessToken)
    set({ user: res.data.user, isAuthenticated: true, isLoading: false })
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
      const user = res.data.user
      set({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          tier: user.tier,
          level: user.level,
          totalXP: user.totalXP,
          avatarConfig: user.avatarConfig ?? {},
          streakDays: user.streakDays ?? 0,
        },
        isAuthenticated: true,
        isLoading: false,
      })
    } catch {
      await SecureStore.deleteItemAsync('accessToken')
      set({ isLoading: false, isAuthenticated: false, user: null })
    }
  },

  updateUser: (data) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    })),
}))