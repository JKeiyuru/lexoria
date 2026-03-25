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

export default function RegisterScreen() {
  const router = useRouter()
  const { register } = useAuthStore()
  const [form, setForm] = useState({
    email: '', username: '', password: '', age: '',
  })
  const [loading, setLoading] = useState(false)

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleRegister = async () => {
    if (!form.email || !form.username || !form.password) {
      Toast.show({ type: 'error', text1: 'Fill in all required fields' })
      return
    }
    setLoading(true)
    try {
      await register({
        email: form.email.trim().toLowerCase(),
        username: form.username.trim(),
        password: form.password,
        age: form.age ? parseInt(form.age) : undefined,
      })
      router.replace('/(tabs)/home')
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Registration failed.'
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

        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Your journey begins here</Text>

        <View style={styles.form}>
          {[
            { key: 'email', label: 'Email *', placeholder: 'your@email.com', keyboard: 'email-address' as const, secure: false },
            { key: 'username', label: 'Username *', placeholder: 'HeroName123', keyboard: 'default' as const, secure: false },
            { key: 'password', label: 'Password *', placeholder: '8+ characters', keyboard: 'default' as const, secure: true },
            { key: 'age', label: 'Age (optional)', placeholder: '16', keyboard: 'numeric' as const, secure: false },
          ].map((field) => (
            <View key={field.key}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                style={styles.input}
                value={form[field.key as keyof typeof form]}
                onChangeText={(v) => update(field.key, v)}
                placeholder={field.placeholder}
                placeholderTextColor={Colors.textMuted}
                keyboardType={field.keyboard}
                autoCapitalize={field.key === 'email' ? 'none' : 'words'}
                autoCorrect={false}
                secureTextEntry={field.secure}
              />
            </View>
          ))}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.switchText}>
              Already have an account?{' '}
              <Text style={styles.switchLink}>Login</Text>
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
  form: { gap: 4 },
  label: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: Colors.surface, borderWidth: 1,
    borderColor: Colors.border, borderRadius: 12,
    padding: 16, color: Colors.textPrimary, fontSize: 16,
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