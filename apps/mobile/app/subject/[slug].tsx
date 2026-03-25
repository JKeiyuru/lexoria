import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Colors } from '../../constants/colors'

export default function SubjectScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const router = useRouter()

  const { data, isLoading } = useQuery({
    queryKey: ['subject', slug],
    queryFn: () => api.get(`/subjects/${slug}`).then((r) => r.data.subject),
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

      <Text style={styles.title}>{data?.name}</Text>
      <Text style={styles.world}>{data?.storyWorld}</Text>
      <Text style={styles.description}>{data?.description}</Text>

      <Text style={styles.sectionTitle}>Seasons</Text>
      {data?.seasons?.map((season: any) => (
        <TouchableOpacity
          key={season.id}
          style={styles.seasonCard}
          onPress={() => router.push(`/season/${season.id}`)}
        >
          <Text style={styles.seasonTitle}>{season.title}</Text>
          <Text style={styles.seasonDesc}>{season.description}</Text>
          <Text style={styles.seasonMeta}>{season._count?.chapters} chapters</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  back: { marginBottom: 24 },
  backText: { color: Colors.textSecondary, fontSize: 16 },
  title: { fontSize: 30, fontWeight: '800', color: Colors.textPrimary, marginBottom: 6 },
  world: { fontSize: 15, color: Colors.primary, marginBottom: 10, fontWeight: '600' },
  description: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 14 },
  seasonCard: {
    backgroundColor: Colors.surface, borderRadius: 14,
    padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  seasonTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6 },
  seasonDesc: { fontSize: 14, color: Colors.textSecondary, marginBottom: 8, lineHeight: 20 },
  seasonMeta: { fontSize: 12, color: Colors.textMuted },
})