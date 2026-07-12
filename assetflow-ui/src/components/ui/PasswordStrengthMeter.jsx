import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react'

function getStrength(password) {
  if (!password) return { score: 0, label: '', color: 'transparent', checks: [] }

  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', pass: /[a-z]/.test(password) },
    { label: 'Number', pass: /[0-9]/.test(password) },
    { label: 'Special character (!@#$...)', pass: /[^A-Za-z0-9]/.test(password) },
  ]

  const score = checks.filter(c => c.pass).length

  const levels = [
    { label: 'Very Weak', color: '#FF3366' },
    { label: 'Weak', color: '#FF7A00' },
    { label: 'Fair', color: '#FFB800' },
    { label: 'Strong', color: '#00F0FF' },
    { label: 'Very Strong', color: '#00FF9D' },
  ]

  return { score, ...levels[score - 1] || { label: 'Too Short', color: '#FF3366' }, checks }
}

export default function PasswordStrengthMeter({ password }) {
  const strength = useMemo(() => getStrength(password || ''), [password])
  if (!password) return null

  const Icon = strength.score >= 4 ? ShieldCheck : strength.score >= 2 ? Shield : ShieldAlert

  return (
    <div style={{ marginTop: 8 }}>
      {/* Strength Bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: strength.score >= i ? '100%' : '0%' }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              style={{ height: '100%', background: strength.color, borderRadius: 2 }}
            />
          </div>
        ))}
      </div>

      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <Icon size={13} color={strength.color} strokeWidth={2.5} />
        <span style={{ fontSize: 12, fontWeight: 700, color: strength.color, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
          {strength.label}
        </span>
      </div>

      {/* Checklist */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
        {strength.checks.map((check, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
            <div style={{
              width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
              background: check.pass ? 'rgba(0, 255, 157, 0.15)' : 'rgba(255,255,255,0.05)',
              border: `1.5px solid ${check.pass ? '#00FF9D' : 'rgba(255,255,255,0.1)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s'
            }}>
              {check.pass && (
                <svg width="8" height="8" viewBox="0 0 8 8">
                  <polyline points="1,4 3,6 7,2" stroke="#00FF9D" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </svg>
              )}
            </div>
            <span style={{ color: check.pass ? 'var(--color-text-secondary)' : 'var(--color-text-disabled)' }}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
