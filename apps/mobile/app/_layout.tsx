import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Toast from 'react-native-toast-message'
import { useAuthStore } from '../store/auth.store'
import { Colors } from '../constants/colors'
import React from 'react'

const queryClient = new QueryClient()

export default function RootLayout() {
  const { loadUser } = useAuthStore()

  useEffect(() => {
    loadUser()
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="subject/[slug]" options={{ headerShown: false }} />
          <Stack.Screen name="chapter/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="helppost/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="guild" options={{ headerShown: false }} />
          <Stack.Screen name="helpboard" options={{ headerShown: false }} />
          <Stack.Screen name="upgrade" options={{ headerShown: false }} />
        </Stack>
        <Toast />
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}