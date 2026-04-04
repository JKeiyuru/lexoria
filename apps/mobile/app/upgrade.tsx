import { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Linking, Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../store/auth.store'
import { api } from '../lib/api'
import { Colors } from '../constants/colors'
import React from 'react'

const VIP_FEATURES = [
  { icon: '📚', text: 'All subjects unlocked (Mathematics, Biology, Physics, Chemistry, Genetics)' },
  { icon: '📖', text: 'Exclusive story arcs and advanced chapters' },
  { icon: '💀', text: 'Advanced boss missions' },
  { icon: '🤖', text: 'Unlimited AI Mentor hints' },
  { icon: '⚔️', text: 'Guild creation ability' },
  { icon: '🎨', text: 'Exclusive avatar cosmetics' },
  { icon: '⚡', text: 'Early access to new features' },
  { icon: '🚫', text: 'No ads' },
]

export default function UpgradeScreen() {
  const router = useRouter()
  const { user, loadUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [granting, setGranting] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const res = await api.post('/payments/checkout')
      if (res.data.url) {
        await Linking.openURL(res.data.url)
      }
    } catch (err) {
      Alert.alert('Error', 'Could not start checkout. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // Dev only — test VIP without paying
  const handleTestVIP = async () => {
    setGranting(true)
    try {
      await api.post('/payments/grant-vip')
      await loadUser()
      Alert.alert('✅ VIP Activated!', 'You are now a VIP member.', [
        { text: 'Continue', onPress: () => router.replace('/(tabs)/home') },
      ])
    } catch (err) {
      Alert.alert('Error', 'Could not grant VIP.')
    } finally {
      setGranting(false)
    }
  }

  if (user?.tier === 'VIP') {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.alreadyVip}>
          <Text style={styles.vipEmoji}>⭐</Text>
          <Text style={styles.vipTitle}>You are already VIP!</Text>
          <Text style={styles.vipSubtitle}>Enjoy all of Lexoria's features.</Text>
        </View>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>⭐</Text>
        <Text style={styles.heroTitle}>Upgrade to VIP</Text>
        <Text style={styles.heroSubtitle}>
          Unlock the full Lexoria universe
        </Text>
        <View style={styles.priceBadge}>
          <Text style={styles.price}>$4.99</Text>
          <Text style={styles.pricePer}>/month</Text>
        </View>
      </View>

      {/* Features */}
      <View style={styles.featuresCard}>
        <Text style={styles.featuresTitle}>Everything in VIP:</Text>
        {VIP_FEATURES.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={styles.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={[styles.upgradeBtn, loading && styles.disabledBtn]}
        onPress={handleCheckout}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#000" />
          : <Text style={styles.upgradeBtnText}>Subscribe Now — $4.99/mo</Text>
        }
      </TouchableOpacity>

      <Text style={styles.cancelNote}>Cancel anytime. No commitment.</Text>

      {/* Dev testing button */}
      {__DEV__ && (
        <TouchableOpacity
          style={[styles.testBtn, granting && styles.disabledBtn]}
          onPress={handleTestVIP}
          disabled={granting}
        >
          {granting
            ? <ActivityIndicator size="small" color={Colors.primary} />
            : <Text style={styles.testBtnText}>🧪 Dev: Grant VIP Free</Text>
          }
        </TouchableOpacity>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  back: { marginBottom: 24 },
  backText: { color: Colors.primary, fontSize: 16 },
  hero: { alignItems: 'center', marginBottom: 32 },
  heroEmoji: { fontSize: 56, marginBottom: 12 },
  heroTitle: { fontSize: 32, fontWeight: '900', color: Colors.textPrimary, marginBottom: 8 },
  heroSubtitle: { fontSize: 16, color: Colors.textSecondary, marginBottom: 20 },
  priceBadge: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 4,
    backgroundColor: Colors.accent + '22', borderRadius: 16,
    paddingHorizontal: 20, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.accent,
  },
  price: { fontSize: 32, fontWeight: '900', color: Colors.accent },
  pricePer: { fontSize: 16, color: Colors.accent, marginBottom: 4 },
  featuresCard: {
    backgroundColor: Colors.surface, borderRadius: 16,
    padding: 20, marginBottom: 24,
    borderWidth: 1, borderColor: Colors.border,
  },
  featuresTitle: { color: Colors.textPrimary, fontWeight: '700', fontSize: 16, marginBottom: 16 },
  featureRow: { flexDirection: 'row', gap: 12, marginBottom: 14, alignItems: 'flex-start' },
  featureIcon: { fontSize: 20, width: 28 },
  featureText: { color: Colors.textSecondary, fontSize: 14, lineHeight: 21, flex: 1 },
  upgradeBtn: {
    backgroundColor: Colors.accent, borderRadius: 14,
    padding: 18, alignItems: 'center', marginBottom: 12,
  },
  disabledBtn: { opacity: 0.6 },
  upgradeBtnText: { color: '#000', fontWeight: '900', fontSize: 17 },
  cancelNote: { color: Colors.textMuted, textAlign: 'center', fontSize: 13, marginBottom: 24 },
  testBtn: {
    borderWidth: 1, borderColor: Colors.primary + '44',
    borderRadius: 12, padding: 14, alignItems: 'center',
    backgroundColor: Colors.primary + '11',
  },
  testBtnText: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
  alreadyVip: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  vipEmoji: { fontSize: 64, marginBottom: 16 },
  vipTitle: { fontSize: 24, fontWeight: '800', color: Colors.accent, marginBottom: 8 },
  vipSubtitle: { fontSize: 16, color: Colors.textSecondary },
})