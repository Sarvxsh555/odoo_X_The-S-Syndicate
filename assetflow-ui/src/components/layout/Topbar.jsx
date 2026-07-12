import { useNavigate, useLocation } from 'react-router-dom'
import { Search, Bell, Plus, Command } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { notificationApi } from '../../api/services'
import { useState } from 'react'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/assets': 'Asset Directory',
  '/assets/register': 'Register Asset',
  '/allocations': 'Allocations',
  '/bookings': 'Bookings',
  '/maintenance': 'Maintenance',
  '/audits': 'Audit Center',
  '/departments': 'Departments',
  '/employees': 'Employees',
  '/notifications': 'Notifications',
  '/reports': 'Reports',
  '/search': 'Search',
  '/settings': 'Settings',
}

export default function Topbar() {
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
      {/* Page Title */}
      <div style={{ flex: '0 0 auto' }}>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
          {pageTitle}
        </h1>
      </div>

      <div style={{ flex: 1 }} />

      {/* Search */}
      <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center' }}>
        <div className="search-wrapper">
          <Search size={14} />
          <input
            className="search-input"
            style={{ width: 240, paddingRight: 40 }}
            placeholder="Search assets, employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            display: 'flex', alignItems: 'center', gap: 2,
            color: 'var(--color-text-disabled)', fontSize: 11
          }}>
            <Command size={10} />K
          </div>
        </div>
      </form>

      {/* Actions */}
      {isAdmin && (
        <button
          className="btn-primary btn-sm"
          onClick={() => navigate('/assets/register')}
        >
          <Plus size={14} />
          Add Asset
        </button>
      )}

      {/* Notifications */}
      <button
        onClick={() => navigate('/notifications')}
        style={{
          position: 'relative', background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)', borderRadius: 10,
          padding: '8px', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-text-secondary)', transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'var(--color-bg-hover)'
          e.currentTarget.style.color = 'var(--color-text-primary)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'var(--color-bg-elevated)'
          e.currentTarget.style.color = 'var(--color-text-secondary)'
        }}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: 'var(--color-accent-rose)', color: 'white',
            borderRadius: '50%', width: 16, height: 16,
            fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--color-bg-secondary)',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* User avatar */}
      <div
        className="avatar"
        style={{ cursor: 'pointer' }}
        onClick={() => navigate('/settings')}
      >
        {user?.firstName?.[0]}{user?.lastName?.[0]}
      </div>
    </div>
  )
}
