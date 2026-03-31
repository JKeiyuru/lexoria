import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, TouchableOpacity,
} from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useAuthStore } from '../../store/auth.store'
import { Colors } from '../../constants/colors'
import React from 'react'

export default function AchievementsScreen() {
  const { user } = useAuthStore()

  const { data, isLoading } = useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: async () => {
      const res = await api.get('/gamification/achievements')
      return res.data
    },
    enabled: !!user,
  })

  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const res = await api.get('/gamification/leaderboard')
      return res.data.leaderboard
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Achievements</Text>

      {/* Progress bar */}
      <View style={styles.progressCard}>
        <Text style={styles.progressText}>
          {data?.unlockedCount ?? 0} / {data?.total ?? 0} Unlocked
        </Text>
        <View style={styles.progressBg}>
          <View style={[
            styles.progressFill,
            { width: `${data?.total ? (data.unlockedCount / data.total) * 100 : 0}%` }
          ]} />
        </View>
      </View>

      {/* Unlocked */}
      {data?.unlocked?.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>🏆 Unlocked</Text>
          {data.unlocked.map((a: any) => (
            <View key={a.id} style={[styles.achievementCard, styles.unlockedCard]}>
              <Text style={styles.achievementIcon}>🏆</Text>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementName}>{a.name}</Text>
                <Text style={styles.achievementDesc}>{a.description}</Text>
                {a.xpReward > 0 && (
                  <Text style={styles.achievementXP}>+{a.xpReward} XP</Text>
                )}
              </View>
            </View>
          ))}
        </>
      )}

      {/* Locked */}
      {data?.locked?.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>🔒 Locked</Text>
          {data.locked.map((a: any) => (
            <View key={a.id} style={[styles.achievementCard, styles.lockedCard]}>
              <Text style={styles.achievementIcon}>🔒</Text>
              <View style={styles.achievementInfo}>
                <Text style={[styles.achievementName, styles.lockedText]}>{a.name}</Text>
                <Text style={styles.achievementDesc}>{a.description}</Text>
              </View>
            </View>
          ))}
        </>
      )}

      {/* Leaderboard */}
      {leaderboard && (
        <>
          <Text style={styles.sectionTitle}>🌍 Global Leaderboard</Text>
          {leaderboard.map((entry: any, index: number) => (
            <View
              key={entry.id}
              style={[
                styles.leaderRow,
                entry.id === user.id && styles.leaderRowSelf,
              ]}
            >
              <Text style={styles.leaderRank}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </Text>
              <Text style={styles.leaderName}>
                {entry.username}
                {entry.id === user.id ? ' (You)' : ''}
              </Text>
              <View style={styles.leaderRight}>
                <Text style={styles.leaderLevel}>Lv {entry.level}</Text>
                <Text style={styles.leaderXP}>{entry.totalXP} XP</Text>
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, marginBottom: 20 },
  progressCard: {
    backgroundColor: Colors.surface, borderRadius: 14,
    padding: 18, marginBottom: 28,
    borderWidth: 1, borderColor: Colors.border,
  },
  progressText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600', marginBottom: 10 },
  progressBg: { height: 8, backgroundColor: Colors.background, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12, marginTop: 8 },
  achievementCard: {
    borderRadius: 12, padding: 16, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1,
  },
  unlockedCard: { backgroundColor: Colors.surface, borderColor: Colors.accent + '44' },
  lockedCard: { backgroundColor: Colors.surface, borderColor: Colors.border, opacity: 0.6 },
  achievementIcon: { fontSize: 28 },
  achievementInfo: { flex: 1 },
  achievementName: { color: Colors.textPrimary, fontWeight: '700', fontSize: 15, marginBottom: 3 },
  lockedText: { color: Colors.textMuted },
  achievementDesc: { color: Colors.textSecondary, fontSize: 13 },
  achievementXP: { color: Colors.accentGreen, fontWeight: '700', fontSize: 12, marginTop: 4 },
  leaderRow: {
    backgroundColor: Colors.surface, borderRadius: 12,
    padding: 14, marginBottom: 8, flexDirection: 'row',
    alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  leaderRowSelf: { borderColor: Colors.primary + '66', backgroundColor: Colors.primary + '11' },
  leaderRank: { fontSize: 18, width: 36, textAlign: 'center' },
  leaderName: { flex: 1, color: Colors.textPrimary, fontWeight: '600', fontSize: 14 },
  leaderRight: { alignItems: 'flex-end' },
  leaderLevel: { color: Colors.primary, fontWeight: '700', fontSize: 13 },
  leaderXP: { color: Colors.textMuted, fontSize: 12 },
})