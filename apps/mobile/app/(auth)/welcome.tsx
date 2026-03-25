import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors } from '../../constants/colors'

const { width, height } = Dimensions.get('window')

export default function WelcomeScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#0F1923', '#1A2535', '#0F1923']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Stars decoration */}
      <View style={styles.starsContainer}>
        {[...Array(20)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.star,
              {
                left: Math.random() * width,
                top: Math.random() * height * 0.6,
                width: Math.random() * 3 + 1,
                height: Math.random() * 3 + 1,
                opacity: Math.random() * 0.8 + 0.2,
              },
            ]}
          />
        ))}
      </View>

      {/* Logo area */}
      <View style={styles.logoArea}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>⚡</Text>
        </View>
        <Text style={styles.appName}>LEXORIA</Text>
        <Text style={styles.tagline}>Learn by living the story.</Text>
      </View>

      {/* Subject pills */}
      <View style={styles.pillsContainer}>
        {[
          { label: 'JavaScript', color: Colors.javascript },
          { label: 'Biology', color: Colors.biology },
          { label: 'Physics', color: Colors.physics },
          { label: 'Mathematics', color: Colors.mathematics },
          { label: 'Chemistry', color: Colors.chemistry },
          { label: 'Genetics', color: Colors.genetics },
        ].map((subject) => (
          <View key={subject.label} style={[styles.pill, { borderColor: subject.color }]}>
            <Text style={[styles.pillText, { color: subject.color }]}>{subject.label}</Text>
          </View>
        ))}
      </View>

      {/* CTA buttons */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.primaryButtonText}>Begin Your Journey</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.secondaryButtonText}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  starsContainer: { ...StyleSheet.absoluteFillObject },
  star: { position: 'absolute', backgroundColor: '#FFFFFF', borderRadius: 10 },
  logoArea: { alignItems: 'center', marginTop: height * 0.15, marginBottom: 40 },
  logoCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: Colors.primary + '22',
    borderWidth: 2, borderColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
  },
  logoEmoji: { fontSize: 40 },
  appName: {
    fontSize: 42, fontWeight: '900', color: Colors.textPrimary,
    letterSpacing: 8,
  },
  tagline: { fontSize: 16, color: Colors.textSecondary, marginTop: 8 },
  pillsContainer: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', paddingHorizontal: 30, gap: 10,
    marginBottom: 50,
  },
  pill: {
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  pillText: { fontSize: 13, fontWeight: '600' },
  ctaContainer: { paddingHorizontal: 30, gap: 14 },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16, borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  secondaryButton: {
    borderWidth: 1, borderColor: Colors.border,
    paddingVertical: 16, borderRadius: 14,
    alignItems: 'center',
  },
  secondaryButtonText: { color: Colors.textSecondary, fontSize: 15 },
})