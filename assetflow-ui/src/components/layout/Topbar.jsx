import { useNavigate, useLocation } from 'react-router-dom'
import { Search, Bell, Plus, Command, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { notificationApi } from '../../api/services'
import { useState } from 'react'
import { motion } from 'framer-motion'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard Overview',
  '/assets': 'Asset Directory',
  '/assets/register': 'Register Asset',
  '/allocations': 'Allocations',
  '/bookings': 'Resource Bookings',
  '/maintenance': 'Maintenance Center',
  '/audits': 'Audit Center',
  '/departments': 'Departments',
  '/employees': 'Employees',
  '/notifications': 'Inbox & Activity',
  '/reports': 'Reports & Analytics',
  '/search': 'Global Search',
  '/settings': 'System Settings',
}

export default function Topbar({ onSearchClick }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAdmin } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationApi.getUnreadCount(),
    refetchInterval: 30000,
  })

  const unreadCount = unreadData?.data?.count || 0

  const pageTitle = PAGE_TITLES[location.pathname] ||
    (location.pathname.startsWith('/assets/') ? 'Asset Detail' : 'AssetFlow')

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="topbar">
      {/* Page Title & Breadcrumb */}
      <div style={{ flex: '1 1 auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)' }}>AssetFlow</div>
        <ChevronRight size={14} color="var(--color-text-disabled)" />
        <motion.h1 
          key={location.pathname}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}
        >
          {pageTitle}
        </motion.h1>
      </div>

      {/* Centered Search (Linear / macOS Spotlight Style) */}
      <div style={{ flex: '0 1 400px', display: 'flex', justifyContent: 'center' }}>
        <div 
          onClick={onSearchClick}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--glass-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 8, padding: '6px 12px',
            width: '100%', maxWidth: 320,
            cursor: 'text',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'all 0.2s cubic-bezier(0.25, 1, 0.5, 1)'
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'}
        >
          <Search size={14} strokeWidth={2} color="var(--color-text-secondary)" />
          <span style={{ flex: 1, fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 500 }}>Search assets, users, docs...</span>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 2,
            background: 'var(--color-bg-primary)',
            padding: '2px 6px', borderRadius: 4,
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)', fontSize: 11, fontWeight: 600
          }}>
            <Command size={10} strokeWidth={2.5} /> K
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div style={{ flex: '1 1 auto', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16 }}>
        {isAdmin && (
          <button
            className="btn-primary"
            onClick={() => navigate('/assets/register')}
            style={{ borderRadius: 8 }}
          >
            <Plus size={16} strokeWidth={2.5} />
            Register Asset
          </button>
        )}

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          style={{
            position: 'relative', background: 'var(--glass-bg)',
            border: '1px solid var(--color-border)', borderRadius: 8,
            padding: '8px', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-text-secondary)', transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--glass-bg-heavy)'
            e.currentTarget.style.color = 'var(--color-accent-blue)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--glass-bg)'
            e.currentTarget.style.color = 'var(--color-text-secondary)'
          }}
        >
          <Bell size={18} strokeWidth={2} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: -6, right: -6,
              background: 'var(--color-accent-rose)', color: 'white',
              borderRadius: '50%', width: 18, height: 18,
              fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #FFFFFF',
              boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
