import { useEffect, useRef } from 'react'
import { Animated, Text, StyleSheet, View } from 'react-native'
import { Colors } from '../../constants/colors'
import React from 'react'

interface Props {
  xp: number
  levelUp?: boolean
  newLevel?: number
  visible: boolean
  onHide: () => void
}

export function XPToast({ xp, levelUp, newLevel, visible, onHide }: Props) {
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(20)).current

  useEffect(() => {
    if (!visible) return

    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start()

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -20, duration: 400, useNativeDriver: true }),
      ]).start(() => onHide())
    }, 2500)

    return () => clearTimeout(timer)
  }, [visible])

  if (!visible) return null

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      <Text style={styles.xpText}>+{xp} XP</Text>
      {levelUp && (
        <Text style={styles.levelUpText}>⬆️ Level {newLevel}!</Text>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', top: 100, alignSelf: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 30, zIndex: 999,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12,
    elevation: 10, alignItems: 'center',
  },
  xpText: { color: '#000', fontWeight: '900', fontSize: 20 },
  levelUpText: { color: '#000', fontWeight: '700', fontSize: 14, marginTop: 2 },
})