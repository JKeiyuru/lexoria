import { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
  TextInput, Alert,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useAuthStore } from '../../store/auth.store'
import { Colors } from '../../constants/colors'
import React from 'react'

export default function HelpPostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['help-post', id],
    queryFn: async () => {
      const res = await api.get(`/help/${id}`)
      return res.data.post
    },
    enabled: !!id,
  })

  const handleAnswer = async () => {
    if (answer.trim().length < 5) {
      Alert.alert('Error', 'Answer must be at least 5 characters')
      return
    }
    setSubmitting(true)
    try {
      await api.post(`/help/${id}/answer`, { body: answer.trim() })
      setAnswer('')
      queryClient.invalidateQueries({ queryKey: ['help-post', id] })
      queryClient.invalidateQueries({ queryKey: ['help-posts'] })
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Could not post answer')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAccept = async (answerId: string) => {
    try {
      await api.post(`/help/answer/${answerId}/accept`)
      queryClient.invalidateQueries({ queryKey: ['help-post', id] })
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Could not accept answer')
    }
  }

  const handleVoteAnswer = async (answerId: string, p0?: number) => {
  try {
    await api.post(`/help/answer/${answerId}/vote`)
    queryClient.invalidateQueries({ queryKey: ['help-post', id] })
  } catch (err: any) {
    const msg = err?.response?.data?.error
    if (msg === 'You have already voted on this answer') {
      Alert.alert('Already Voted', 'You can only vote on an answer once.')
    } else if (msg === 'You cannot vote on your own answer') {
      Alert.alert('Not Allowed', 'You cannot vote on your own answer.')
    }
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
        <Text style={styles.errorText}>Post not found</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Back */}
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* Post */}
      <View style={styles.postCard}>
        {data.resolvedAt && (
          <View style={styles.resolvedBadge}>
            <Text style={styles.resolvedText}>✓ Resolved</Text>
          </View>
        )}
        <Text style={styles.postTitle}>{data.title}</Text>
        <Text style={styles.postBody}>{data.body}</Text>
        <View style={styles.postMeta}>
          <Text style={styles.postAuthor}>
            Asked by {data.user.username} · Level {data.user.level}
          </Text>
          {data.chapter && (
            <Text style={styles.postChapter}>📖 {data.chapter.title}</Text>
          )}
        </View>
      </View>

      {/* Answers */}
      <Text style={styles.sectionTitle}>
        {data.answers.length} {data.answers.length === 1 ? 'Answer' : 'Answers'}
      </Text>

      {data.answers.length === 0 && (
        <View style={styles.noAnswers}>
          <Text style={styles.noAnswersText}>No answers yet. Be the first to help!</Text>
        </View>
      )}

      {data.answers.map((ans: any) => (
        <View
          key={ans.id}
          style={[styles.answerCard, ans.isAccepted && styles.acceptedCard]}
        >
          {ans.isAccepted && (
            <View style={styles.acceptedBadge}>
              <Text style={styles.acceptedText}>✓ Accepted Answer</Text>
            </View>
          )}
          <Text style={styles.answerBody}>{ans.body}</Text>
          <View style={styles.answerFooter}>
            <Text style={styles.answerAuthor}>
              {ans.user.username} · Level {ans.user.level}
            </Text>
            <View style={styles.answerActions}>
              {/* Vote buttons */}
              <TouchableOpacity
  style={styles.voteBtn}
  onPress={() => handleVoteAnswer(ans.id)}
>
  <Text style={styles.voteBtnText}>▲ {ans.voteCount}</Text>
</TouchableOpacity>
              {/* Accept button — only post owner and not yet accepted */}
              {data.user.id === user?.id && !ans.isAccepted && (
                <TouchableOpacity
                  style={styles.acceptBtn}
                  onPress={() => handleAccept(ans.id)}
                >
                  <Text style={styles.acceptBtnText}>✓ Accept</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      ))}

      {/* Write answer */}
      <View style={styles.answerForm}>
        <Text style={styles.formTitle}>Your Answer</Text>
        <TextInput
          style={styles.answerInput}
          value={answer}
          onChangeText={setAnswer}
          placeholder="Write a helpful answer..."
          placeholderTextColor={Colors.textMuted}
          multiline
          numberOfLines={4}
        />
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.disabledBtn]}
          onPress={handleAnswer}
          disabled={submitting}
        >
          {submitting
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.submitBtnText}>Post Answer (+15 XP)</Text>
          }
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  errorText: { color: Colors.textSecondary, fontSize: 16 },
  back: { marginBottom: 20 },
  backText: { color: Colors.primary, fontSize: 16 },
  postCard: {
    backgroundColor: Colors.surface, borderRadius: 14,
    padding: 18, marginBottom: 24,
    borderWidth: 1, borderColor: Colors.border,
  },
  resolvedBadge: {
    backgroundColor: Colors.success + '22', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 3,
    alignSelf: 'flex-start', marginBottom: 10,
  },
  resolvedText: { color: Colors.success, fontWeight: '700', fontSize: 12 },
  postTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginBottom: 12 },
  postBody: { fontSize: 15, color: Colors.textSecondary, lineHeight: 23, marginBottom: 14 },
  postMeta: { gap: 4 },
  postAuthor: { color: Colors.textMuted, fontSize: 12 },
  postChapter: { color: Colors.primary, fontSize: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  noAnswers: {
    backgroundColor: Colors.surface, borderRadius: 12,
    padding: 20, alignItems: 'center', marginBottom: 20,
    borderWidth: 1, borderColor: Colors.border,
  },
  noAnswersText: { color: Colors.textMuted, fontSize: 14 },
  answerCard: {
    backgroundColor: Colors.surface, borderRadius: 12,
    padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  acceptedCard: { borderColor: Colors.success + '66', backgroundColor: Colors.success + '08' },
  acceptedBadge: {
    backgroundColor: Colors.success + '22', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 3,
    alignSelf: 'flex-start', marginBottom: 10,
  },
  acceptedText: { color: Colors.success, fontWeight: '700', fontSize: 12 },
  answerBody: { fontSize: 15, color: Colors.textPrimary, lineHeight: 23, marginBottom: 12 },
  answerFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  answerAuthor: { color: Colors.textMuted, fontSize: 12 },
  answerActions: { flexDirection: 'row', gap: 8 },
  voteBtn: {
    backgroundColor: Colors.primary + '22', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: Colors.primary + '44',
  },
  voteBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 13 },
  acceptBtn: {
    backgroundColor: Colors.success + '22', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: Colors.success + '44',
  },
  acceptBtnText: { color: Colors.success, fontWeight: '700', fontSize: 13 },
  answerForm: {
    backgroundColor: Colors.surface, borderRadius: 14,
    padding: 18, marginTop: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  formTitle: { color: Colors.textPrimary, fontWeight: '700', fontSize: 16, marginBottom: 12 },
  answerInput: {
    backgroundColor: Colors.background, borderWidth: 1,
    borderColor: Colors.border, borderRadius: 10,
    padding: 12, color: Colors.textPrimary,
    fontSize: 15, minHeight: 100,
    textAlignVertical: 'top', marginBottom: 12,
  },
  submitBtn: {
    backgroundColor: Colors.primary, borderRadius: 10,
    padding: 14, alignItems: 'center',
  },
  disabledBtn: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
})