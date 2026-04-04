import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../store/auth.store'
import { Colors } from '../../constants/colors'
import React from 'react'

export default function ProfileScreen() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  if (!user) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  const handleLogout = async () => {
    await logout()
    router.replace('/(auth)/welcome')
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={[styles.tierBadge, user.tier === 'VIP' && styles.vipBadge]}>
          <Text style={[styles.tierText, user.tier === 'VIP' && styles.vipText]}>
            {user.tier === 'VIP' ? '⭐ VIP Member' : 'FREE'}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Level', value: String(user.level) },
          { label: 'Total XP', value: String(user.totalXP) },
          { label: 'Streak', value: `${user.streakDays} 🔥` },
        ].map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        {[
  { icon: '🏆', label: 'Achievements', onPress: () => router.push('/(tabs)/achievements') },
  { icon: '⚔️', label: 'My Guild', onPress: () => router.push('/guild') },
  { icon: '❓', label: 'Help Board', onPress: () => router.push('/helpboard') },
  { icon: '⚙️', label: 'Settings', onPress: () => {} },
].map((item) => (
  <TouchableOpacity key={item.label} style={styles.menuItem} onPress={item.onPress}>
    <Text style={styles.menuIcon}>{item.icon}</Text>
    <Text style={styles.menuLabel}>{item.label}</Text>
    <Text style={styles.menuArrow}>→</Text>
  </TouchableOpacity>
))}
      </View>

      {user.tier === 'FREE' && (
        <TouchableOpacity style={styles.upgradeCard}>
          <Text style={styles.upgradeTitle}>⭐ Upgrade to VIP</Text>
          <Text style={styles.upgradeDesc}>
            Unlock all subjects, exclusive story arcs, and more.
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  center: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center', backgroundColor: Colors.background,
  },
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary + '33',
    borderWidth: 2, borderColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: Colors.primary },
  username: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  email: { fontSize: 13, color: Colors.textMuted, marginBottom: 10 },
  tierBadge: {
    backgroundColor: Colors.surface, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 4,
    borderWidth: 1, borderColor: Colors.border,
  },
  vipBadge: { borderColor: Colors.accent, backgroundColor: Colors.accent + '22' },
  tierText: { color: Colors.textSecondary, fontWeight: '700', fontSize: 13 },
  vipText: { color: Colors.accent },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 12,
    padding: 16, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.primary, marginBottom: 4 },
  statLabel: { fontSize: 12, color: Colors.textSecondary },
  menu: { gap: 10, marginBottom: 24 },
  menuItem: {
    backgroundColor: Colors.surface, borderRadius: 12,
    padding: 16, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  menuIcon: { fontSize: 20, marginRight: 14 },
  menuLabel: { flex: 1, color: Colors.textPrimary, fontSize: 15, fontWeight: '600' },
  menuArrow: { color: Colors.textMuted, fontSize: 16 },
  upgradeCard: {
    backgroundColor: Colors.accent + '15', borderRadius: 14,
    padding: 18, marginBottom: 24,
    borderWidth: 1, borderColor: Colors.accent + '44',
  },
  upgradeTitle: { color: Colors.accent, fontWeight: '800', fontSize: 16, marginBottom: 6 },
  upgradeDesc: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20 },
  logoutButton: {
    borderWidth: 1, borderColor: Colors.error + '44',
    borderRadius: 12, padding: 16, alignItems: 'center',
    marginTop: 8,
  },
  logoutText: { color: Colors.error, fontWeight: '600', fontSize: 15 },
})