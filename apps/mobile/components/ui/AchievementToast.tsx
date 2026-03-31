import { useEffect, useRef } from 'react'
import { Animated, Text, StyleSheet, View } from 'react-native'
import { Colors } from '../../constants/colors'
import React from 'react';

interface Props {
  achievement: { name: string; description: string; xpReward: number } | null
  onHide: () => void
}

export function AchievementToast({ achievement, onHide }: Props) {
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(40)).current

  useEffect(() => {
    if (!achievement) return

    opacity.setValue(0)
    translateY.setValue(40)

    Animated.parallel([
      Animated.spring(opacity, { toValue: 1, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
    ]).start()

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 40, duration: 400, useNativeDriver: true }),
      ]).start(() => onHide())
    }, 3500)

    return () => clearTimeout(timer)
  }, [achievement])

  if (!achievement) return null

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      <Text style={styles.badge}>🏆</Text>
      <View style={styles.textArea}>
        <Text style={styles.title}>Achievement Unlocked!</Text>
        <Text style={styles.name}>{achievement.name}</Text>
        <Text style={styles.desc}>{achievement.description}</Text>
        {achievement.xpReward > 0 && (
          <Text style={styles.xp}>+{achievement.xpReward} XP bonus</Text>
        )}
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', bottom: 90, left: 16, right: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1, borderColor: Colors.accent + '66',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12,
    elevation: 10,
  },
  badge: { fontSize: 36 },
  textArea: { flex: 1 },
  title: { color: Colors.accent, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  name: { color: Colors.textPrimary, fontWeight: '800', fontSize: 16, marginBottom: 2 },
  desc: { color: Colors.textSecondary, fontSize: 13, marginBottom: 4 },
  xp: { color: Colors.accentGreen, fontWeight: '700', fontSize: 13 },
})