// XP required to reach each level
// Level 1 = 0 XP, Level 2 = 100, Level 3 = 250, etc.
export const XP_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700]

export const calculateLevel = (xp: number): number => {
  let level = 1
  for (let i = 0; i < XP_THRESHOLDS.length; i++) {
    if (xp >= XP_THRESHOLDS[i]) {
      level = i + 1
    } else {
      break
    }
  }
  return level
}

export const xpToNextLevel = (xp: number): number => {
  const level = calculateLevel(xp)
  const nextThreshold = XP_THRESHOLDS[level] // index = level (since level starts at 1)
  if (!nextThreshold) return 0 // max level
  return nextThreshold - xp
}