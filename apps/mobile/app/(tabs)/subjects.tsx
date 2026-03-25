import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useAuthStore } from '../../store/auth.store'
import { Colors } from '../../constants/colors'
import React from 'react'

const subjectEmojis: Record<string, string> = {
  javascript: '⚡',
  mathematics: '📐',
  biology: '🧬',
  physics: '⚛️',
  chemistry: '🧪',
  genetics: '🔬',
}

export default function SubjectsScreen() {
  const router = useRouter()
  const { user } = useAuthStore()

  const { data, isLoading, error } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const res = await api.get('/subjects')
      return res.data.subjects ?? []
    },
    enabled: !!user,
  })

  if (!user) return null

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  if (error || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Could not load subjects.</Text>
        <Text style={styles.errorSub}>Make sure the API server is running.</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Subjects</Text>
      <Text style={styles.subtitle}>Choose your adventure</Text>

      {data.map((subject: any) => (
        <TouchableOpacity
          key={subject.id}
          style={[
            styles.subjectCard,
            { borderLeftColor: subject.color, borderLeftWidth: 4 },
            subject.locked && styles.lockedCard,
          ]}
          onPress={() => {
            if (!subject.locked) {
              router.push(`/subject/${subject.slug}`)
            }
          }}
        >
          <View style={styles.cardLeft}>
            <Text style={styles.emoji}>{subjectEmojis[subject.slug] ?? '📚'}</Text>
            <View style={styles.cardText}>
              <Text style={styles.subjectName}>{subject.name}</Text>
              <Text style={styles.storyWorld}>{subject.storyWorld}</Text>
              <Text style={styles.seasonCount}>
                {subject._count?.seasons ?? 0} seasons
              </Text>
            </View>
          </View>
          {subject.locked ? (
            <View style={styles.vipBadge}>
              <Text style={styles.vipText}>VIP</Text>
            </View>
          ) : (
            <Text style={styles.arrow}>→</Text>
          )}
        </TouchableOpacity>
      ))}

      {user.tier === 'FREE' && (
        <View style={styles.upgradeCard}>
          <Text style={styles.upgradeTitle}>Unlock All Subjects</Text>
          <Text style={styles.upgradeDesc}>
            Upgrade to VIP to access Mathematics, Biology, Physics, Chemistry, and Genetics.
          </Text>
          <TouchableOpacity style={styles.upgradeButton}>
            <Text style={styles.upgradeButtonText}>Upgrade to VIP</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, paddingTop: 60 },
  center: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.background, padding: 24,
  },
  errorText: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 8 },
  errorSub: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, marginBottom: 28 },
  subjectCard: {
    backgroundColor: Colors.surface, borderRadius: 14,
    padding: 18, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 14, borderWidth: 1, borderColor: Colors.border,
  },
  lockedCard: { opacity: 0.55 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  cardText: { flex: 1 },
  emoji: { fontSize: 30 },
  subjectName: { color: Colors.textPrimary, fontWeight: '700', fontSize: 16, marginBottom: 2 },
  storyWorld: { color: Colors.textSecondary, fontSize: 13, marginBottom: 2 },
  seasonCount: { color: Colors.textMuted, fontSize: 12 },
  vipBadge: {
    backgroundColor: Colors.accent + '22', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: Colors.accent,
  },
  vipText: { color: Colors.accent, fontWeight: '700', fontSize: 12 },
  arrow: { color: Colors.primary, fontSize: 20 },
  upgradeCard: {
    backgroundColor: Colors.primary + '15', borderRadius: 16,
    padding: 20, marginTop: 12,
    borderWidth: 1, borderColor: Colors.primary + '44',
  },
  upgradeTitle: { color: Colors.textPrimary, fontWeight: '800', fontSize: 18, marginBottom: 8 },
  upgradeDesc: { color: Colors.textSecondary, fontSize: 14, marginBottom: 16, lineHeight: 20 },
  upgradeButton: {
    backgroundColor: Colors.primary, borderRadius: 10,
    padding: 14, alignItems: 'center',
  },
  upgradeButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
})