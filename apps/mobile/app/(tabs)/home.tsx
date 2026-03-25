import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../store/auth.store'
import { Colors } from '../../constants/colors'
import React from 'react'

export default function HomeScreen() {
  const { user } = useAuthStore()
  const router = useRouter()

  if (!user) return null

  const xpForCurrentLevel = 100 * user.level
  const xpProgress = Math.min((user.totalXP % xpForCurrentLevel) / xpForCurrentLevel, 1)
  const xpToNext = xpForCurrentLevel - (user.totalXP % xpForCurrentLevel)

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.username}>{user.username} ⚡</Text>
        </View>
        <View style={styles.streakBadge}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakText}>{user.streakDays}d</Text>
        </View>
      </View>

      {/* XP Bar */}
      <View style={styles.xpCard}>
        <View style={styles.xpHeader}>
          <Text style={styles.xpLevel}>Level {user.level}</Text>
          <Text style={styles.xpTotal}>{user.totalXP} XP total</Text>
        </View>
        <View style={styles.xpBarBg}>
          <View style={[styles.xpBarFill, { width: `${xpProgress * 100}%` }]} />
        </View>
        <Text style={styles.xpNext}>{xpToNext} XP to next level</Text>
      </View>

      {/* Continue learning */}
      <Text style={styles.sectionTitle}>Continue Learning</Text>
      <TouchableOpacity
        style={styles.continueCard}
        onPress={() => router.push('/subject/javascript')}
      >
        <View style={styles.continueLeft}>
          <Text style={styles.continueEmoji}>⚡</Text>
          <View>
            <Text style={styles.continueSubject}>JavaScript</Text>
            <Text style={styles.continueChapter}>Season 1: The City of Logic</Text>
          </View>
        </View>
        <Text style={styles.continueArrow}>→</Text>
      </TouchableOpacity>

      {/* Subjects grid */}
      <Text style={styles.sectionTitle}>All Subjects</Text>
      <View style={styles.subjectsGrid}>
        {[
          { name: 'JavaScript', emoji: '⚡', color: Colors.javascript, slug: 'javascript', free: true },
          { name: 'Mathematics', emoji: '📐', color: Colors.mathematics, slug: 'mathematics', free: false },
          { name: 'Biology', emoji: '🧬', color: Colors.biology, slug: 'biology', free: false },
          { name: 'Physics', emoji: '⚛️', color: Colors.physics, slug: 'physics', free: false },
          { name: 'Chemistry', emoji: '🧪', color: Colors.chemistry, slug: 'chemistry', free: false },
          { name: 'Genetics', emoji: '🔬', color: Colors.genetics, slug: 'genetics', free: false },
        ].map((subject) => (
          <TouchableOpacity
            key={subject.slug}
            style={[styles.subjectCard, { borderColor: subject.color + '44' }]}
            onPress={() => {
              if (subject.free || user.tier === 'VIP') {
                router.push(`/subject/${subject.slug}`)
              }
            }}
          >
            <Text style={styles.subjectEmoji}>{subject.emoji}</Text>
            <Text style={styles.subjectName}>{subject.name}</Text>
            {!subject.free && user.tier === 'FREE' && (
              <View style={styles.lockBadge}>
                <Text style={styles.lockText}>VIP</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  greeting: { fontSize: 15, color: Colors.textSecondary },
  username: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surface, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.border,
  },
  streakEmoji: { fontSize: 16 },
  streakText: { color: Colors.warning, fontWeight: '700', fontSize: 15 },
  xpCard: {
    backgroundColor: Colors.surface, borderRadius: 16,
    padding: 18, marginBottom: 28,
    borderWidth: 1, borderColor: Colors.border,
  },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  xpLevel: { color: Colors.primary, fontWeight: '700', fontSize: 16 },
  xpTotal: { color: Colors.textSecondary, fontSize: 14 },
  xpBarBg: { height: 8, backgroundColor: Colors.background, borderRadius: 4, overflow: 'hidden' },
  xpBarFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 4 },
  xpNext: { color: Colors.textMuted, fontSize: 12, marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 14 },
  continueCard: {
    backgroundColor: Colors.surface, borderRadius: 14,
    padding: 18, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.primary + '44', marginBottom: 28,
  },
  continueLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  continueEmoji: { fontSize: 28 },
  continueSubject: { color: Colors.textPrimary, fontWeight: '700', fontSize: 16 },
  continueChapter: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  continueArrow: { color: Colors.primary, fontSize: 20, fontWeight: '700' },
  subjectsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  subjectCard: {
    width: '47%', backgroundColor: Colors.surface,
    borderRadius: 14, padding: 18, alignItems: 'center',
    borderWidth: 1, position: 'relative',
  },
  subjectEmoji: { fontSize: 32, marginBottom: 8 },
  subjectName: { color: Colors.textPrimary, fontWeight: '600', fontSize: 14 },
  lockBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: Colors.accent + '22',
    borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
    borderWidth: 1, borderColor: Colors.accent,
  },
  lockText: { color: Colors.accent, fontSize: 10, fontWeight: '700' },
})