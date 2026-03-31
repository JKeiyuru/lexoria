import { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native'
import { api } from '../../lib/api'
import { Colors } from '../../constants/colors'
import { CodeEditor } from '../editor/CodeEditor'
import { useAuthStore } from '../../store/auth.store'
import React from 'react'

interface Props {
  challenge: {
    id: string
    title: string
    type: string
    prompt: string
    starterCode: string
    xpReward: number
    passed?: boolean
  }
  onClose: () => void
  onPass: () => void
}

export function ChallengePanel({ challenge, onClose, onPass }: Props) {
  const { updateUser, user } = useAuthStore()
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [code, setCode] = useState(challenge.starterCode || '')
  const [hint, setHint] = useState<{ mentorName: string; hint: string } | null>(null)
const [loadingHint, setLoadingHint] = useState(false)

  const handleSubmit = async () => {
    if (!code.trim()) return
    setSubmitting(true)
    setResult(null)
    try {
      const res = await api.post(`/execute/challenge/${challenge.id}`, { code })
      setResult(res.data)

      if (res.data.passed) {
        if (res.data.xpEarned > 0) {
          updateUser({
            totalXP: res.data.newTotalXP,
            level: res.data.newLevel,
          })
        }
        Alert.alert(
          '🎉 Challenge Passed!',
          `${res.data.xpEarned > 0 ? `+${res.data.xpEarned} XP earned!` : 'Already completed — no XP this time.'}${res.data.levelUp ? `\n⬆️ Level Up! Level ${res.data.newLevel}!` : ''}`,
          [{ text: 'Continue', onPress: onPass }]
        )
      }
    } catch (err) {
      Alert.alert('Error', 'Submission failed. Check your connection.')
    } finally {
      setSubmitting(false)
    }
  }


  const handleGetHint = async () => {
  setLoadingHint(true)
  setHint(null)
  try {
    const res = await api.post('/mentor/hint', {
      challengeId: challenge.id,
      userCode: code,
      errorMessage: result?.error || '',
      mode: 'STORY',
    })
    setHint(res.data)
  } catch {
    // Mentor unavailable — fail silently
  } finally {
    setLoadingHint(false)
  }
}

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={[
            styles.typeBadge,
            challenge.type === 'BOSS' && styles.bossBadge,
            challenge.type === 'MISSION' && styles.missionBadge,
          ]}>
            <Text style={styles.typeText}>
              {challenge.type === 'BOSS' ? '💀 BOSS' : challenge.type === 'MISSION' ? '⚔️ MISSION' : '⚡ MINI'}
            </Text>
          </View>
          <Text style={styles.title} numberOfLines={1}>{challenge.title}</Text>
        </View>
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>+{challenge.xpReward} XP</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Prompt */}
        <View style={styles.promptBlock}>
          <Text style={styles.promptLabel}>📋 Mission</Text>
          <Text style={styles.promptText}>{challenge.prompt}</Text>
        </View>

        {/* Code editor */}
        <CodeEditor
          initialCode={challenge.starterCode}
          onResult={(r) => {
            // Just running — not submitting
          }}
        />

        {/* Test results */}
        {result && (
          <View style={[styles.resultBlock, result.passed ? styles.resultPassed : styles.resultFailed]}>
            <Text style={styles.resultTitle}>
              {result.passed ? '✅ All tests passed!' : '❌ Some tests failed'}
            </Text>
            {result.results?.map((test: any, i: number) => (
              <View key={i} style={styles.testRow}>
                <Text style={styles.testIcon}>{test.passed ? '✓' : '✗'}</Text>
                <Text style={[styles.testDesc, !test.passed && styles.testFailed]}>
                  {test.description}
                </Text>
              </View>
            ))}
            {result.output && (
              <View style={styles.outputPreview}>
                <Text style={styles.outputPreviewLabel}>Your output:</Text>
                <Text style={styles.outputPreviewText}>{result.output}</Text>
              </View>
            )}
          </View>
        )}

        {/* Mentor hint */}
<TouchableOpacity
  style={styles.hintBtn}
  onPress={handleGetHint}
  disabled={loadingHint}
>
  {loadingHint ? (
    <ActivityIndicator size="small" color={Colors.accentPurple} />
  ) : (
    <Text style={styles.hintBtnText}>💡 Ask your Mentor for a hint</Text>
  )}
</TouchableOpacity>

{hint && (
  <View style={styles.hintBlock}>
    <Text style={styles.hintMentor}>{hint.mentorName} says:</Text>
    <Text style={styles.hintText}>{hint.hint}</Text>
  </View>
)}

        {/* Submit button */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled, challenge.passed && styles.submitBtnPassed]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>
              {challenge.passed ? '✓ Resubmit' : 'Submit Solution'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({

  hintBtn: {
  borderWidth: 1, borderColor: Colors.accentPurple + '66',
  borderRadius: 12, padding: 14, alignItems: 'center',
  marginBottom: 12, backgroundColor: Colors.accentPurple + '11',
},
hintBtnText: { color: Colors.accentPurple, fontWeight: '600', fontSize: 14 },
hintBlock: {
  backgroundColor: Colors.surface, borderRadius: 12,
  padding: 16, marginBottom: 12,
  borderWidth: 1, borderColor: Colors.accentPurple + '44',
},
hintMentor: { color: Colors.accentPurple, fontWeight: '700', fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
hintText: { color: Colors.textPrimary, fontSize: 14, lineHeight: 22 },
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 56, paddingHorizontal: 16, paddingBottom: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    gap: 10,
  },
  closeBtn: { padding: 4 },
  closeText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  headerCenter: { flex: 1, gap: 4 },
  typeBadge: {
    backgroundColor: Colors.primary + '22', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start',
  },
  bossBadge: { backgroundColor: Colors.error + '22' },
  missionBadge: { backgroundColor: Colors.warning + '22' },
  typeText: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700' },
  title: { color: Colors.textPrimary, fontWeight: '700', fontSize: 15 },
  xpBadge: {
    backgroundColor: Colors.accent + '22', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: Colors.accent + '44',
  },
  xpText: { color: Colors.accent, fontWeight: '700', fontSize: 13 },
  scroll: { flex: 1 },
  scrollContent: { padding: 18, paddingBottom: 40 },
  promptBlock: {
    backgroundColor: Colors.surface, borderRadius: 12,
    padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  promptLabel: { color: Colors.primary, fontWeight: '700', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  promptText: { color: Colors.textPrimary, fontSize: 14, lineHeight: 22 },
  resultBlock: {
    borderRadius: 12, padding: 16, marginVertical: 12,
    borderWidth: 1,
  },
  resultPassed: { backgroundColor: Colors.success + '11', borderColor: Colors.success + '44' },
  resultFailed: { backgroundColor: Colors.error + '11', borderColor: Colors.error + '33' },
  resultTitle: { color: Colors.textPrimary, fontWeight: '700', fontSize: 15, marginBottom: 12 },
  testRow: { flexDirection: 'row', gap: 10, marginBottom: 8, alignItems: 'flex-start' },
  testIcon: { color: Colors.success, fontWeight: '700', fontSize: 14, width: 16 },
  testDesc: { color: Colors.textSecondary, fontSize: 13, flex: 1 },
  testFailed: { color: Colors.error },
  outputPreview: {
    backgroundColor: '#0D1117', borderRadius: 8,
    padding: 10, marginTop: 10,
  },
  outputPreviewLabel: { color: Colors.textMuted, fontSize: 11, marginBottom: 6 },
  outputPreviewText: { color: '#E6EDF3', fontFamily: 'monospace', fontSize: 12 },
  submitBtn: {
    backgroundColor: Colors.primary, borderRadius: 14,
    padding: 18, alignItems: 'center', marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnPassed: { backgroundColor: Colors.success },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})