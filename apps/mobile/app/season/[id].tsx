import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Colors } from '../../constants/colors'

export default function SeasonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

  const { data, isLoading } = useQuery({
    queryKey: ['season', id],
    queryFn: () => api.get(`/subjects/season/${id}`).then((r) => r.data.season),
  })

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.subject}>{data?.subject?.name}</Text>
      <Text style={styles.title}>{data?.title}</Text>
      <Text style={styles.storyArc}>{data?.storyArc}</Text>

      <Text style={styles.sectionTitle}>Chapters</Text>
      {data?.chapters?.map((chapter: any, index: number) => (
        <TouchableOpacity
          key={chapter.id}
          style={[
            styles.chapterCard,
            chapter.completed && styles.completedCard,
            !chapter.accessible && styles.lockedCard,
          ]}
          onPress={() => {
            if (chapter.accessible) {
              router.push(`/chapter/${chapter.id}`)
            }
          }}
          disabled={!chapter.accessible}
        >
          <View style={styles.chapterLeft}>
            <View style={[
              styles.chapterNumber,
              chapter.completed && styles.completedNumber,
              !chapter.accessible && styles.lockedNumber,
            ]}>
              <Text style={styles.chapterNumberText}>
                {chapter.completed ? '✓' : !chapter.accessible ? '🔒' : index + 1}
              </Text>
            </View>
            <View style={styles.chapterInfo}>
              <Text style={styles.chapterTitle}>{chapter.title}</Text>
              <Text style={styles.chapterConcept}>{chapter.conceptTaught}</Text>
              <Text style={styles.chapterXP}>+{chapter.xpReward} XP</Text>
            </View>
          </View>
          {chapter.completed && <Text style={styles.completedBadge}>Done</Text>}
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  back: { marginBottom: 20 },
  backText: { color: Colors.textSecondary, fontSize: 16 },
  subject: { fontSize: 13, color: Colors.primary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginBottom: 10 },
  storyArc: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21, marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 14 },
  chapterCard: {
    backgroundColor: Colors.surface, borderRadius: 14,
    padding: 16, marginBottom: 12, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  completedCard: { borderColor: Colors.success + '44' },
  lockedCard: { opacity: 0.5 },
  chapterLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  chapterNumber: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary + '22',
    borderWidth: 1, borderColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  completedNumber: { backgroundColor: Colors.success + '22', borderColor: Colors.success },
  lockedNumber: { backgroundColor: Colors.textMuted + '22', borderColor: Colors.textMuted },
  chapterNumberText: { color: Colors.textPrimary, fontWeight: '700', fontSize: 14 },
  chapterInfo: { flex: 1 },
  chapterTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 3 },
  chapterConcept: { fontSize: 13, color: Colors.textSecondary, marginBottom: 3 },
  chapterXP: { fontSize: 12, color: Colors.accent, fontWeight: '600' },
  completedBadge: { color: Colors.success, fontSize: 12, fontWeight: '700' },
})