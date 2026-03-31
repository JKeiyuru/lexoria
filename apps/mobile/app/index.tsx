import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useRouter, useSegments } from 'expo-router'
import { useAuthStore } from '../store/auth.store'
import { Colors } from '../constants/colors'
import React from 'react'

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore()
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    if (isLoading) return

    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/(tabs)/home')
      } else {
        router.replace('/(auth)/welcome')
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [isAuthenticated, isLoading])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  )
}