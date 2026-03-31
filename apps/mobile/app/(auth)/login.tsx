import { useState } from 'react'
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, KeyboardAvoidingView,
  Platform, ActivityIndicator, ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import Toast from 'react-native-toast-message'
import { useAuthStore } from '../../store/auth.store'
import { Colors } from '../../constants/colors'
import React from 'react'

export default function LoginScreen() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({ type: 'error', text1: 'Fill in all fields' })
      return
    }
    setLoading(true)
    try {
      await login(email.trim().toLowerCase(), password)
      router.replace('/(tabs)/home')
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Login failed. Try again.'
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Continue your journey</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor={Colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.switchText}>
              No account yet?{' '}
              <Text style={styles.switchLink}>Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 28, paddingTop: 60 },
  back: { marginBottom: 32 },
  backText: { color: Colors.textSecondary, fontSize: 16 },
  title: { fontSize: 32, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 16, color: Colors.textSecondary, marginBottom: 40 },
  form: { gap: 6 },
  label: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: 12, padding: 16,
    color: Colors.textPrimary, fontSize: 16,
  },
  button: {
    backgroundColor: Colors.primary, borderRadius: 12,
    padding: 18, alignItems: 'center', marginTop: 28,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  switchText: { color: Colors.textSecondary, textAlign: 'center', marginTop: 20, fontSize: 15 },
  switchLink: { color: Colors.primary, fontWeight: '600' },
})