import { useAuth } from '../../context/AuthContext'
import { User, Mail, Building2, Shield, Bell, Moon, Globe } from 'lucide-react'

export default function SettingsPage() {
  const { user, isAdmin } = useAuth()

  return (
    <div className="page-header page-body" style={{ paddingTop: 32, maxWidth: 700, margin: '0 auto' }}>
      <h2 className="section-title" style={{ marginBottom: 32 }}>Settings</h2>

      {/* Profile */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
        <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: 20 }}>Profile</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div className="avatar avatar-lg">{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, }}>{user?.firstName} {user?.lastName}</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{user?.email}</div>
            <span className={`badge badge-${isAdmin ? 'admin' : 'employee'}`} style={{ marginTop: 6, display: 'inline-flex' }}>
              {isAdmin ? 'Administrator' : 'Employee'}
            </span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group"><label className="form-label">First Name</label><input className="input" defaultValue={user?.firstName} /></div>
          <div className="form-group"><label className="form-label">Last Name</label><input className="input" defaultValue={user?.lastName} /></div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Email</label><input className="input" type="email" defaultValue={user?.email} disabled /></div>
        </div>
        <button className="btn-primary btn-sm" onClick={() => alert('Profile update — connect to PUT /api/v1/employees/{id}')}>Save Changes</button>
      </div>

      {/* Security */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
        <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: 20 }}>Security</h4>
        <div className="form-group"><label className="form-label">Current Password</label><input type="password" className="input" placeholder="••••••••" /></div>
        <div className="form-group"><label className="form-label">New Password</label><input type="password" className="input" placeholder="••••••••" /></div>
        <div className="form-group"><label className="form-label">Confirm Password</label><input type="password" className="input" placeholder="••••••••" /></div>
        <button className="btn-secondary btn-sm">Change Password</button>
      </div>

      {/* Preferences */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: 20 }}>Preferences</h4>
        {[
          { icon: Bell, label: 'Email Notifications', desc: 'Receive email for allocations, maintenance, and bookings', value: true },
          { icon: Moon, label: 'Dark Mode', desc: 'Always enabled for best experience', value: true },
          { icon: Globe, label: 'Language', desc: 'Interface language', value: 'English' },
        ].map(pref => (
          <div key={pref.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <pref.icon size={15} color="var(--color-text-muted)" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{pref.label}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{pref.desc}</div>
              </div>
            </div>
            {typeof pref.value === 'boolean' ? (
              <div style={{ width: 36, height: 20, borderRadius: 999, background: pref.value ? 'var(--gradient-violet)' : 'var(--color-bg-elevated)', cursor: 'pointer', position: 'relative', border: '1px solid var(--color-border)' }}>
                <div style={{ position: 'absolute', top: 2, right: pref.value ? 2 : 'auto', left: pref.value ? 'auto' : 2, width: 14, height: 14, borderRadius: '50%', background: 'white' }} />
              </div>
            ) : (
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{pref.value}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
