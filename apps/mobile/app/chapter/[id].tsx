import { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useAuthStore } from '../../store/auth.store'
import { Colors } from '../../constants/colors'
import { CodeEditor } from '../../components/editor/CodeEditor'
import { ChallengePanel } from '../../components/course/ChallengePanel'
import React from 'react'

export default function ChapterScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { user, updateUser } = useAuthStore()
  const queryClient = useQueryClient()

  const [mode, setMode] = useState<'STORY' | 'TECHNICAL'>('STORY')
  const [activeChallenge, setActiveChallenge] = useState<any>(null)
  const [completing, setCompleting] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['chapter', id],
    queryFn: () => api.get(`/subjects/chapter/${id}`).then((r) => r.data.chapter),
  })

  const handleCompleteChapter = async () => {
    if (!data || data.completed) return
    setCompleting(true)
    try {
      const res = await api.post(`/subjects/chapter/${id}/complete`, { mode, score: 100 })
      if (res.data.xpEarned > 0) {
        updateUser({ totalXP: res.data.newTotalXP, level: res.data.newLevel })
        Alert.alert(
          '🎉 Chapter Complete!',
          `+${res.data.xpEarned} XP earned${res.data.levelUp ? `\n⬆️ Level Up! You are now Level ${res.data.newLevel}!` : ''}`,
          [{ text: 'Continue', onPress: () => router.back() }]
        )
      } else {
        router.back()
      }
      queryClient.invalidateQueries({ queryKey: ['chapter', id] })
    } catch (err) {
      Alert.alert('Error', 'Could not complete chapter. Try again.')
    } finally {
      setCompleting(false)
    }
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Chapter not found</Text>
      </View>
    )
  }

  const storyContent = data.storyContent as any
  const technicalContent = data.technicalContent as any

  // If a challenge is active, show the challenge panel
  if (activeChallenge) {
    return (
      <ChallengePanel
        challenge={activeChallenge}
        onClose={() => setActiveChallenge(null)}
        onPass={() => {
          setActiveChallenge(null)
          queryClient.invalidateQueries({ queryKey: ['chapter', id] })
        }}
      />
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerSubject}>{data.season?.subject?.name}</Text>
          <Text style={styles.headerChapter} numberOfLines={1}>{data.title}</Text>
        </View>
        {data.completed && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>✓</Text>
          </View>
        )}
      </View>

      {/* Mode toggle */}
      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'STORY' && styles.modeBtnActive]}
          onPress={() => setMode('STORY')}
        >
          <Text style={[styles.modeBtnText, mode === 'STORY' && styles.modeBtnTextActive]}>
            📖 Story Mode
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'TECHNICAL' && styles.modeBtnActive]}
          onPress={() => setMode('TECHNICAL')}
        >
          <Text style={[styles.modeBtnText, mode === 'TECHNICAL' && styles.modeBtnTextActive]}>
            ⚙️ Technical Mode
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {mode === 'STORY' ? (
          <StoryContent content={storyContent} />
        ) : (
          <TechnicalContent content={technicalContent} />
        )}

        {/* XP reward */}
        <View style={styles.xpBanner}>
          <Text style={styles.xpBannerText}>⭐ Complete this chapter to earn {data.xpReward} XP</Text>
        </View>

        {/* Challenges */}
        {data.challenges?.length > 0 && (
          <View style={styles.challengesSection}>
            <Text style={styles.sectionTitle}>Challenges</Text>
            {data.challenges.map((challenge: any) => (
              <TouchableOpacity
                key={challenge.id}
                style={[styles.challengeCard, challenge.passed && styles.challengePassed]}
                onPress={() => setActiveChallenge(challenge)}
              >
                <View style={styles.challengeLeft}>
                  <View style={[
                    styles.challengeTypeBadge,
                    challenge.type === 'BOSS' && styles.bossBadge,
                    challenge.type === 'MISSION' && styles.missionBadge,
                  ]}>
                    <Text style={styles.challengeTypeText}>
                      {challenge.type === 'BOSS' ? '💀 BOSS' : challenge.type === 'MISSION' ? '⚔️ MISSION' : '⚡ MINI'}
                    </Text>
                  </View>
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                  <Text style={styles.challengeXP}>+{challenge.xpReward} XP</Text>
                </View>
                <Text style={styles.challengeArrow}>
                  {challenge.passed ? '✓' : '→'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Complete button */}
        {!data.completed && (
          <TouchableOpacity
            style={[styles.completeBtn, completing && styles.completeBtnDisabled]}
            onPress={handleCompleteChapter}
            disabled={completing}
          >
            {completing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.completeBtnText}>Mark Chapter Complete ✓</Text>
            )}
          </TouchableOpacity>
        )}

        {data.completed && (
          <View style={styles.completedNotice}>
            <Text style={styles.completedNoticeText}>✓ Chapter completed</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

// ── Story Mode Content ────────────────────────────────────────────
function StoryContent({ content }: { content: any }) {
  return (
    <View>
      <View style={styles.storyBlock}>
        <Text style={styles.storyLabel}>📍 Scene</Text>
        <Text style={styles.storyText}>{content.intro}</Text>
      </View>
      <View style={styles.storyBlock}>
        <Text style={styles.storyText}>{content.scene}</Text>
      </View>
      {content.dialogue?.map((line: any, i: number) => (
        <View key={i} style={[
          styles.dialogueBubble,
          line.character === 'You' && styles.dialogueBubbleYou,
        ]}>
          <Text style={styles.dialogueCharacter}>{line.character}</Text>
          <Text style={styles.dialogueText}>{line.text}</Text>
        </View>
      ))}
      <View style={styles.storyBlock}>
        <Text style={styles.storyLabel}>✨ Outcome</Text>
        <Text style={styles.storyText}>{content.outro}</Text>
      </View>
    </View>
  )
}

// ── Technical Mode Content ────────────────────────────────────────
function TechnicalContent({ content }: { content: any }) {
  return (
    <View>
      <View style={styles.techBlock}>
        <Text style={styles.techExplanation}>{content.explanation}</Text>
      </View>
      <Text style={styles.sectionTitle}>Key Points</Text>
      {content.keyPoints?.map((point: string, i: number) => (
        <View key={i} style={styles.keyPoint}>
          <Text style={styles.keyPointBullet}>▸</Text>
          <Text style={styles.keyPointText}>{point}</Text>
        </View>
      ))}
      <Text style={styles.sectionTitle}>Examples</Text>
      {content.examples?.map((example: any, i: number) => (
        <View key={i} style={styles.exampleBlock}>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>{example.code}</Text>
          </View>
          <Text style={styles.exampleExplanation}>{example.explanation}</Text>
        </View>
      ))}
      <View style={styles.summaryBlock}>
        <Text style={styles.summaryLabel}>📌 Summary</Text>
        <Text style={styles.summaryText}>{content.summary}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  errorText: { color: Colors.textSecondary, fontSize: 16 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  back: { padding: 4, marginRight: 12 },
  backText: { color: Colors.primary, fontSize: 24 },
  headerCenter: { flex: 1 },
  headerSubject: { fontSize: 12, color: Colors.primary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  headerChapter: { fontSize: 15, color: Colors.textPrimary, fontWeight: '700', marginTop: 2 },
  completedBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.success + '22',
    borderWidth: 1, borderColor: Colors.success,
    justifyContent: 'center', alignItems: 'center',
  },
  completedText: { color: Colors.success, fontSize: 14 },
  modeToggle: {
    flexDirection: 'row', padding: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 8,
  },
  modeBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    alignItems: 'center', backgroundColor: Colors.background,
    borderWidth: 1, borderColor: Colors.border,
  },
  modeBtnActive: { backgroundColor: Colors.primary + '22', borderColor: Colors.primary },
  modeBtnText: { color: Colors.textMuted, fontWeight: '600', fontSize: 13 },
  modeBtnTextActive: { color: Colors.primary },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  storyBlock: {
    backgroundColor: Colors.surface, borderRadius: 12,
    padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  storyLabel: { color: Colors.primary, fontWeight: '700', fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  storyText: { color: Colors.textPrimary, fontSize: 15, lineHeight: 24 },
  dialogueBubble: {
    backgroundColor: Colors.surfaceAlt, borderRadius: 12,
    padding: 14, marginBottom: 10,
    borderLeftWidth: 3, borderLeftColor: Colors.textMuted,
  },
  dialogueBubbleYou: { borderLeftColor: Colors.primary, backgroundColor: Colors.primary + '11' },
  dialogueCharacter: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  dialogueText: { color: Colors.textPrimary, fontSize: 15, lineHeight: 22 },
  techBlock: {
    backgroundColor: Colors.surface, borderRadius: 12,
    padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: Colors.border,
  },
  techExplanation: { color: Colors.textPrimary, fontSize: 15, lineHeight: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12, marginTop: 8 },
  keyPoint: { flexDirection: 'row', gap: 10, marginBottom: 10, paddingHorizontal: 4 },
  keyPointBullet: { color: Colors.primary, fontSize: 14, marginTop: 2 },
  keyPointText: { color: Colors.textSecondary, fontSize: 14, lineHeight: 21, flex: 1 },
  exampleBlock: { marginBottom: 16 },
  codeBlock: {
    backgroundColor: '#0D1117', borderRadius: 10,
    padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  codeText: { color: '#E6EDF3', fontFamily: 'monospace', fontSize: 13, lineHeight: 20 },
  exampleExplanation: { color: Colors.textMuted, fontSize: 13, paddingHorizontal: 4 },
  summaryBlock: {
    backgroundColor: Colors.primary + '15', borderRadius: 12,
    padding: 16, marginTop: 8, marginBottom: 20,
    borderWidth: 1, borderColor: Colors.primary + '33',
  },
  summaryLabel: { color: Colors.primary, fontWeight: '700', fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  summaryText: { color: Colors.textPrimary, fontSize: 14, lineHeight: 22 },
  xpBanner: {
    backgroundColor: Colors.accent + '15', borderRadius: 10,
    padding: 12, marginBottom: 20,
    borderWidth: 1, borderColor: Colors.accent + '33',
    alignItems: 'center',
  },
  xpBannerText: { color: Colors.accent, fontWeight: '600', fontSize: 13 },
  challengesSection: { marginBottom: 20 },
  challengeCard: {
    backgroundColor: Colors.surface, borderRadius: 12,
    padding: 16, marginBottom: 10, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  challengePassed: { borderColor: Colors.success + '44', backgroundColor: Colors.success + '08' },
  challengeLeft: { flex: 1 },
  challengeTypeBadge: {
    backgroundColor: Colors.primary + '22', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
    alignSelf: 'flex-start', marginBottom: 8,
  },
  bossBadge: { backgroundColor: Colors.error + '22' },
  missionBadge: { backgroundColor: Colors.warning + '22' },
  challengeTypeText: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary },
  challengeTitle: { color: Colors.textPrimary, fontWeight: '600', fontSize: 15, marginBottom: 4 },
  challengeXP: { color: Colors.accent, fontSize: 12, fontWeight: '600' },
  challengeArrow: { color: Colors.primary, fontSize: 18, fontWeight: '700' },
  completeBtn: {
    backgroundColor: Colors.primary, borderRadius: 14,
    padding: 18, alignItems: 'center', marginTop: 8,
  },
  completeBtnDisabled: { opacity: 0.6 },
  completeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  completedNotice: {
    borderWidth: 1, borderColor: Colors.success + '44',
    borderRadius: 14, padding: 16, alignItems: 'center',
  },
  completedNoticeText: { color: Colors.success, fontWeight: '700', fontSize: 15 },
})