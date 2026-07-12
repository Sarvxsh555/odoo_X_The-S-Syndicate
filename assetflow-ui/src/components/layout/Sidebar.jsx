import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Package, ArrowLeftRight, Calendar,
  Wrench, ClipboardCheck, Building2, Users, Bell,
  BarChart3, Search, Settings, LogOut, Zap, ChevronDown,
  History, Map, CalendarDays
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/search', icon: Search, label: 'Search' },
    ]
  },
  {
    label: 'Assets',
    items: [
      { to: '/assets', icon: Package, label: 'Asset Directory' },
      { to: '/map', icon: Map, label: 'Live Asset Map' },
      { to: '/allocations', icon: ArrowLeftRight, label: 'Allocations' },
      { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
      { to: '/bookings', icon: Calendar, label: 'Bookings' },
      { to: '/maintenance', icon: Wrench, label: 'Maintenance' },
      { to: '/audits', icon: ClipboardCheck, label: 'Audit Center' },
    ]
  },
  {
    label: 'Organization',
    items: [
      { to: '/departments', icon: Building2, label: 'Departments' },
      { to: '/employees', icon: Users, label: 'Employees' },
    ]
  },
  {
    label: 'Insights',
    items: [
      { to: '/notifications', icon: Bell, label: 'Notifications' },
      { to: '/reports', icon: BarChart3, label: 'Reports' },
      { to: '/activity-log', icon: History, label: 'Activity Log', adminOnly: true },
    ]
  },
]

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <motion.aside
      className="sidebar"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
    >
      {/* Window Controls (macOS style) */}
      <div style={{ display: 'flex', gap: '8px', padding: '20px 24px', alignItems: 'center' }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF3B30', border: '1px solid #E0352B' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFCC00', border: '1px solid #E0B400' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28CD41', border: '1px solid #24B73B' }} />
      </div>

      {/* Logo */}
      <div style={{ padding: '0 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--color-accent-blue)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-glow-blue)'
          }}>
            <Zap size={18} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 16, letterSpacing: '0.05em', color: 'var(--color-text-primary)', textTransform: 'uppercase' }}>
              AETHER ERP
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--color-accent-cyan)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              MAC CONSOLE
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }} className="no-scrollbar">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} style={{ marginBottom: 16 }}>
            <div style={{
              padding: '0 24px 6px',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-text-disabled)',
            }}>
              {section.label}
            </div>
            {section.items
              .filter(item => !item.adminOnly || isAdmin)
              .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      size={18}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Settings */}
      <div style={{ padding: '8px 0' }}>
        <NavLink to="/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          {({ isActive }) => (
            <>
              <Settings size={18} strokeWidth={isActive ? 2.5 : 2} />
              <span>Settings</span>
            </>
          )}
        </NavLink>
      </div>

      {/* User Profile */}
      <div style={{ padding: '16px 16px' }}>
        <div
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px', borderRadius: 12,
            cursor: 'pointer', transition: 'all 0.2s',
            background: userMenuOpen ? 'var(--color-bg-hover)' : 'transparent',
            border: '1px solid transparent'
          }}
          onMouseEnter={e => {
            if (!userMenuOpen) {
              e.currentTarget.style.background = 'rgba(0,0,0,0.02)'
              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)'
            }
          }}
          onMouseLeave={e => {
            if (!userMenuOpen) {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'transparent'
            }
          }}
        >
          <div className="avatar" style={{ width: 36, height: 36, fontSize: 13 }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.firstName} {user?.lastName}
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-accent-emerald)', fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              ● ADMIN
            </div>
          </div>
          <LogOut size={16} color="var(--color-text-muted)" style={{ marginLeft: 'auto' }} />
        </div>

        {userMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.15 }}
            style={{
              marginTop: 8, padding: 6,
              background: 'var(--glass-bg-heavy)',
              backdropFilter: 'var(--glass-blur)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              boxShadow: 'var(--macos-shadow)',
            }}
          >
            <button
              onClick={logout}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8, border: 'none',
                background: 'transparent', cursor: 'pointer',
                color: 'var(--color-accent-rose)', fontSize: 13, fontWeight: 600,
                transition: 'background 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={16} strokeWidth={2} />
              Sign out securely
            </button>
          </motion.div>
        )}
      </div>
    </motion.aside>
  )
}
