import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Package, ArrowLeftRight, Calendar,
  Wrench, ClipboardCheck, Building2, Users, Bell,
  BarChart3, Search, Settings, LogOut, Zap, ChevronDown
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
      { to: '/allocations', icon: ArrowLeftRight, label: 'Allocations' },
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
      transition={{ duration: 0.3 }}
    >
      {/* Window Controls */}
      <div style={{ display: 'flex', gap: '8px', padding: '16px 20px', alignItems: 'center' }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56', border: '1px solid #e0443e' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e', border: '1px solid #dea123' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f', border: '1px solid #1aab29' }} />
      </div>

      {/* Logo */}
      <div style={{ padding: '0 16px 16px', borderBottom: '1px solid rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--gradient-violet)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
          }}>
            <Zap size={18} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
              AssetFlow
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 500 }}>
              Enterprise
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} style={{ marginBottom: 8 }}>
            <div style={{
              padding: '8px 22px 4px',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-text-disabled)',
            }}>
              {section.label}
            </div>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      size={16}
                      strokeWidth={1.75}
                      color={isActive ? 'white' : 'var(--color-text-secondary)'}
                    />
                    <span style={{ fontSize: 13.5 }}>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Settings */}
      <div style={{ borderTop: '1px solid rgba(0,0,0,0.2)', padding: '8px 0' }}>
        <NavLink to="/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          {({ isActive }) => (
            <>
              <Settings size={16} strokeWidth={1.75} color={isActive ? 'white' : 'var(--color-text-secondary)'} />
              <span style={{ fontSize: 13.5 }}>Settings</span>
            </>
          )}
        </NavLink>
      </div>

      {/* User Profile */}
      <div style={{
        padding: '12px 12px',
        borderTop: '1px solid rgba(0,0,0,0.2)',
      }}>
        <div
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 10,
            cursor: 'pointer', transition: 'background 0.2s',
            background: userMenuOpen ? 'var(--color-bg-elevated)' : 'transparent',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-elevated)'}
          onMouseLeave={e => !userMenuOpen && (e.currentTarget.style.background = 'transparent')}
        >
          <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.firstName} {user?.lastName}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              {isAdmin ? 'Admin' : 'Employee'}
            </div>
          </div>
          <ChevronDown size={14} color="var(--color-text-muted)" style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
        </div>

        {userMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 4, padding: 4,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 10,
            }}
          >
            <button
              onClick={logout}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', borderRadius: 8, border: 'none',
                background: 'transparent', cursor: 'pointer',
                color: 'var(--color-accent-rose)', fontSize: 13, fontWeight: 500,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,63,94,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={14} />
              Sign out
            </button>
          </motion.div>
        )}
      </div>
    </motion.aside>
  )
}
