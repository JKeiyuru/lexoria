import { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, TextInput, Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth.store'
import { Colors } from '../constants/colors'
import React from 'react'

export default function HelpBoardScreen() {
  const { user } = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [posting, setPosting] = useState(false)
  const [form, setForm] = useState({ title: '', body: '' })
  const [loading, setLoading] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['help-posts'],
    queryFn: async () => {
      const res = await api.get('/help')
      return res.data
    },
    enabled: !!user,
  })

  const handlePost = async () => {
    if (form.title.trim().length < 5) {
      Alert.alert('Error', 'Title must be at least 5 characters')
      return
    }
    if (form.body.trim().length < 10) {
      Alert.alert('Error', 'Question must be at least 10 characters')
      return
    }
    setLoading(true)
    try {
      await api.post('/help', { title: form.title, body: form.body })
      queryClient.invalidateQueries({ queryKey: ['help-posts'] })
      setPosting(false)
      setForm({ title: '', body: '' })
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Could not post question')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>❓ Help Board</Text>
      <Text style={styles.subtitle}>Ask questions, help others, earn XP</Text>

      {/* Ask question */}
      {!posting ? (
        <TouchableOpacity
          style={styles.askBtn}
          onPress={() => setPosting(true)}
        >
          <Text style={styles.askBtnText}>+ Ask a Question</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.postForm}>
          <Text style={styles.formTitle}>New Question</Text>
          <TextInput
            style={styles.input}
            value={form.title}
            onChangeText={(v) => setForm((p) => ({ ...p, title: v }))}
            placeholder="Short, clear title"
            placeholderTextColor={Colors.textMuted}
          />
          <TextInput
            style={[styles.input, styles.inputMulti]}
            value={form.body}
            onChangeText={(v) => setForm((p) => ({ ...p, body: v }))}
            placeholder="Describe your question in detail..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={4}
          />
          <View style={styles.formBtns}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setPosting(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.disabledBtn]}
              onPress={handlePost}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.submitBtnText}>Post</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Posts list */}
      {isLoading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
      ) : (
        data?.posts?.map((post: any) => (
          <TouchableOpacity
            key={post.id}
            style={[styles.postCard, post.resolvedAt && styles.resolvedCard]}
            onPress={() => router.push(`/helppost/${post.id}`)}
          >
            <View style={styles.postTop}>
              {post.resolvedAt && (
                <View style={styles.resolvedBadge}>
                  <Text style={styles.resolvedText}>✓ Resolved</Text>
                </View>
              )}
              <Text style={styles.postTitle}>{post.title}</Text>
            </View>
            <View style={styles.postMeta}>
              <Text style={styles.postAuthor}>by {post.user.username}</Text>
              <Text style={styles.postStats}>
                {post._count?.answers ?? 0} answers · {post.voteCount} votes
              </Text>
            </View>
            {post.chapter && (
              <Text style={styles.postChapter}>📖 {post.chapter.title}</Text>
            )}
          </TouchableOpacity>
        ))
      )}

      {data?.posts?.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No questions yet.</Text>
          <Text style={styles.emptySubtext}>Be the first to ask one!</Text>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, marginBottom: 6 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, marginBottom: 24 },
  askBtn: {
    borderWidth: 1, borderColor: Colors.primary,
    borderRadius: 12, padding: 16, alignItems: 'center',
    marginBottom: 24, borderStyle: 'dashed',
  },
  askBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 15 },
  postForm: {
    backgroundColor: Colors.surface, borderRadius: 14,
    padding: 18, marginBottom: 24,
    borderWidth: 1, borderColor: Colors.border,
  },
  formTitle: { color: Colors.textPrimary, fontWeight: '700', fontSize: 16, marginBottom: 14 },
  input: {
    backgroundColor: Colors.background, borderWidth: 1,
    borderColor: Colors.border, borderRadius: 10,
    padding: 12, color: Colors.textPrimary,
    fontSize: 15, marginBottom: 10,
  },
  inputMulti: { minHeight: 100, textAlignVertical: 'top' },
  formBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, padding: 12, alignItems: 'center',
  },
  cancelBtnText: { color: Colors.textSecondary, fontWeight: '600' },
  submitBtn: {
    flex: 1, backgroundColor: Colors.primary,
    borderRadius: 10, padding: 12, alignItems: 'center',
  },
  submitBtnText: { color: '#fff', fontWeight: '700' },
  disabledBtn: { opacity: 0.6 },
  postCard: {
    backgroundColor: Colors.surface, borderRadius: 12,
    padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  resolvedCard: { borderColor: Colors.success + '44' },
  postTop: { marginBottom: 8 },
  resolvedBadge: {
    backgroundColor: Colors.success + '22', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 2,
    alignSelf: 'flex-start', marginBottom: 6,
  },
  resolvedText: { color: Colors.success, fontSize: 11, fontWeight: '700' },
  postTitle: { color: Colors.textPrimary, fontWeight: '700', fontSize: 15, lineHeight: 22 },
  postMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  postAuthor: { color: Colors.textMuted, fontSize: 12 },
  postStats: { color: Colors.textMuted, fontSize: 12 },
  postChapter: { color: Colors.primary, fontSize: 12 },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { color: Colors.textSecondary, fontSize: 16, fontWeight: '600' },
  emptySubtext: { color: Colors.textMuted, fontSize: 14, marginTop: 6 },
})