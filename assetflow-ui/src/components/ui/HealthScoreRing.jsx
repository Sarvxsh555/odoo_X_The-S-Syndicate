import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

/**
 * Animated SVG Health Score Ring
 * score: 0–100
 * size: px (default 120)
 */
export default function HealthScoreRing({ score = 0, size = 120, label = 'Health Score' }) {
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const clampedScore = Math.max(0, Math.min(100, score))
  const offset = circumference - (clampedScore / 100) * circumference

  const getColor = (s) => {
    if (s >= 75) return { stroke: '#30d158', glow: 'rgba(48,209,88,0.5)', label: 'Excellent' }
    if (s >= 50) return { stroke: '#ff9f0a', glow: 'rgba(255,159,10,0.5)', label: 'Fair' }
    return { stroke: '#ff453a', glow: 'rgba(255,69,58,0.5)', label: 'Critical' }
  }

  const { stroke, glow, label: statusLabel } = getColor(clampedScore)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={8}
          />
          {/* Progress ring with animation */}
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
            style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
          />
        </svg>
        {/* Center text */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{ fontSize: size * 0.22, fontWeight: 700, color: stroke, lineHeight: 1 }}
          >
            {clampedScore}
          </motion.div>
          <div style={{ fontSize: size * 0.1, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>/ 100</div>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }}>{label}</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: stroke, marginTop: 2 }}>{statusLabel}</div>
      </div>
    </div>
  )
}

/**
 * Calculate a health score from asset data
 */
export function calcHealthScore(asset) {
  if (!asset) return 0
  let score = 100

  // Penalize for bad status
  if (asset.status === 'MAINTENANCE') score -= 25
  if (asset.status === 'LOST') score -= 60
  if (asset.status === 'RETIRED') score -= 50
  if (asset.status === 'DISPOSED') score -= 80

  // Penalize for warranty expiry
  if (asset.warrantyExpiry) {
    const daysLeft = Math.floor((new Date(asset.warrantyExpiry) - new Date()) / (1000 * 60 * 60 * 24))
    if (daysLeft < 0) score -= 20
    else if (daysLeft < 30) score -= 12
    else if (daysLeft < 90) score -= 5
  } else {
    score -= 10 // no warranty info
  }

  // Bonus for newer assets (purchase date)
  if (asset.purchaseDate) {
    const ageYears = (new Date() - new Date(asset.purchaseDate)) / (1000 * 60 * 60 * 24 * 365)
    if (ageYears > 5) score -= 15
    else if (ageYears > 3) score -= 8
  }

  return Math.max(0, Math.min(100, Math.round(score)))
}
