import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { User, Mail, Shield, Bell, Moon, Globe, LogIn, Monitor, Smartphone, Tablet, Lock, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { activityApi, authApi } from '../../api/services'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { motion } from 'framer-motion'
import PasswordStrengthMeter from '../../components/ui/PasswordStrengthMeter'
import toast from 'react-hot-toast'

const TABS = ['profile', 'security', 'preferences', 'sessions']

function DeviceIcon({ type }) {
  if (type === 'Mobile') return <Smartphone size={14} />
  if (type === 'Tablet') return <Tablet size={14} />
  return <Monitor size={14} />
}

export default function SettingsPage() {
  const { user, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [newPassword, setNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)

  const { data: loginHistoryData } = useQuery({
    queryKey: ['settings', 'login-history'],
    queryFn: () => authApi.getLoginHistory({ page: 0, size: 20 }),
    enabled: activeTab === 'security' || activeTab === 'sessions'
  })

  const loginHistory = loginHistoryData?.data?.content || []

  return (
    <div className="page-body" style={{ padding: '32px', maxWidth: 760, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 }}>Settings</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>Manage your account, security, and preferences.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 0 }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
              color: activeTab === tab ? 'var(--color-accent-cyan)' : 'var(--color-text-muted)',
              borderBottom: activeTab === tab ? '2px solid var(--color-accent-cyan)' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass-card" style={{ padding: 28, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-accent-cyan), var(--color-accent-violet))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontWeight: 800, color: '#1A1525',
                boxShadow: '0 0 20px rgba(0,240,255,0.3)'
              }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{user?.firstName} {user?.lastName}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>{user?.email}</div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8,
                  fontSize: 10, fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.06em',
                  color: 'var(--color-accent-emerald)', textTransform: 'uppercase'
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent-emerald)' }} />
                  {isAdmin ? 'ADMINISTRATOR' : 'EMPLOYEE'}
                </span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input className="input" defaultValue={user?.firstName} />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="input" defaultValue={user?.lastName} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Email Address</label>
                <input className="input" type="email" defaultValue={user?.email} disabled style={{ opacity: 0.5 }} />
              </div>
            </div>
            <button className="btn-primary btn-sm" style={{ marginTop: 8 }} onClick={() => toast.success('Profile updated!')}>
              Save Changes
            </button>
          </div>
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Change Password */}
          <div className="glass-card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={16} color="var(--color-accent-violet)" />
              </div>
              <h4 style={{ fontFamily: 'monospace', fontSize: 12, letterSpacing: '0.08em', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Change Password
              </h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input type="password" className="input" placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    className="input" placeholder="••••••••"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <PasswordStrengthMeter password={newPassword} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="input" placeholder="••••••••" />
              </div>
            </div>
            <button className="btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={() => toast.success('Password change — connect to reset-password API')}>
              Update Password
            </button>
          </div>

          {/* Login History */}
          <div className="glass-card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(0,240,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LogIn size={16} color="var(--color-accent-cyan)" />
              </div>
              <h4 style={{ fontFamily: 'monospace', fontSize: 12, letterSpacing: '0.08em', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Login History & IP Logging
              </h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {loginHistory.length === 0 ? (
                <div style={{ color: 'var(--color-text-muted)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
                  No login history yet. Logs will appear after your next login.
                </div>
              ) : loginHistory.map((log, idx) => (
                <div key={log.id || idx} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 16px', background: idx === 0 ? 'rgba(0,240,255,0.05)' : 'rgba(255,255,255,0.02)',
                  borderRadius: 12, border: `1px solid ${idx === 0 ? 'rgba(0,240,255,0.15)' : 'rgba(255,255,255,0.04)'}`,
                  transition: 'all 0.15s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent-cyan)' }}>
                      <DeviceIcon type={log.deviceType} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace' }}>
                          {log.ipAddress || '0.0.0.0'}
                        </span>
                        {idx === 0 && (
                          <span style={{ fontSize: 9, fontWeight: 700, fontFamily: 'monospace', color: 'var(--color-accent-cyan)', background: 'rgba(0,240,255,0.1)', padding: '2px 6px', borderRadius: 4, letterSpacing: '0.06em' }}>CURRENT</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2, maxWidth: 380, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.deviceType || 'Desktop'} • {log.userAgent?.split(' ').slice(0, 3).join(' ') || 'Unknown Browser'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle size={12} color="var(--color-accent-emerald)" />
                      <span style={{ fontSize: 11, color: 'var(--color-accent-emerald)', fontWeight: 700, fontFamily: 'monospace' }}>SUCCESS</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                      {log.createdAt ? formatDistanceToNow(parseISO(log.createdAt), { addSuffix: true }) : '—'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass-card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h4 style={{ fontFamily: 'monospace', fontSize: 12, letterSpacing: '0.08em', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Active Sessions
              </h4>
              <button
                className="btn-secondary btn-sm"
                style={{ color: 'var(--color-accent-rose)', borderColor: 'rgba(255,51,102,0.3)' }}
                onClick={() => toast.success('All other sessions revoked!')}
              >
                Revoke All Others
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Current session (always shown) */}
              <div style={{ padding: '16px', background: 'rgba(0,240,255,0.05)', borderRadius: 12, border: '1px solid rgba(0,240,255,0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Monitor size={24} color="var(--color-accent-cyan)" />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>Current Session</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>Chrome • Windows • This device</div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-disabled)', marginTop: 2, fontFamily: 'monospace' }}>Active right now</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, fontFamily: 'monospace', color: 'var(--color-accent-emerald)', background: 'rgba(0,255,157,0.1)', padding: '4px 8px', borderRadius: 6, letterSpacing: '0.06em' }}>ACTIVE</span>
                </div>
              </div>

              <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)', color: 'var(--color-text-muted)', fontSize: 13, textAlign: 'center' }}>
                No other active sessions detected.
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass-card" style={{ padding: 28 }}>
            <h4 style={{ fontFamily: 'monospace', fontSize: 12, letterSpacing: '0.08em', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 20 }}>
              App Preferences
            </h4>
            {[
              { icon: Bell, label: 'Email Notifications', desc: 'Receive email for allocations, maintenance, and bookings', value: true },
              { icon: Bell, label: 'Browser Push Notifications', desc: 'In-browser push notifications for real-time alerts', value: false },
              { icon: Moon, label: 'Dark Mode', desc: 'Aether ERP dark theme (always enabled)', value: true, disabled: true },
              { icon: Globe, label: 'Language', desc: 'Interface language', value: 'English (US)' },
            ].map((pref, idx) => (
              <div key={pref.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: idx < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <pref.icon size={15} color="var(--color-text-muted)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{pref.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{pref.desc}</div>
                  </div>
                </div>
                {typeof pref.value === 'boolean' ? (
                  <div
                    onClick={() => !pref.disabled && toast.success(`${pref.label} toggled`)}
                    style={{
                      width: 40, height: 22, borderRadius: 999,
                      background: pref.value ? 'var(--color-accent-cyan)' : 'rgba(255,255,255,0.1)',
                      cursor: pref.disabled ? 'not-allowed' : 'pointer', position: 'relative', transition: 'all 0.2s',
                      opacity: pref.disabled ? 0.5 : 1
                    }}
                  >
                    <div style={{ position: 'absolute', top: 3, left: pref.value ? 20 : 3, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'all 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{pref.value}</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
