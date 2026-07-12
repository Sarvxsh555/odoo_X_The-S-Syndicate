import { useQuery } from '@tanstack/react-query'
import { notificationApi } from '../../api/services'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck, Package, Wrench, Calendar, ArrowLeftRight } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'

const TYPE_ICONS = {
  ASSET_ALLOCATED: ArrowLeftRight,
  ASSET_RETURNED: ArrowLeftRight,
  MAINTENANCE_REQUESTED: Wrench,
  MAINTENANCE_RESOLVED: Wrench,
  BOOKING_CONFIRMED: Calendar,
  BOOKING_CANCELLED: Calendar,
  BOOKING_REMINDER: Calendar,
}

const TYPE_COLORS = {
  ASSET_ALLOCATED: '#6366f1', ASSET_RETURNED: '#10b981',
  MAINTENANCE_REQUESTED: '#f59e0b', MAINTENANCE_RESOLVED: '#10b981',
  BOOKING_CONFIRMED: '#06b6d4', BOOKING_CANCELLED: '#f43f5e',
  BOOKING_REMINDER: '#f97316',
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const [unreadOnly, setUnreadOnly] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', { unreadOnly }],
    queryFn: () => notificationApi.getAll({ unreadOnly }),
  })

  const markAllMutation = useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => { queryClient.invalidateQueries(['notifications']); toast.success('All marked as read') },
  })

  const markOneMutation = useMutation({
    mutationFn: (id) => notificationApi.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  })

  const notifications = data?.data?.content || []

  return (
    <div className="page-header page-body" style={{ paddingTop: 32, maxWidth: 800, margin: '0 auto' }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">Notifications</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{notifications.length} items</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn-${unreadOnly ? 'primary' : 'secondary'} btn-sm`}
            onClick={() => setUnreadOnly(!unreadOnly)}
          >
            Unread Only
          </button>
          <button className="btn-ghost btn-sm" onClick={() => markAllMutation.mutate()}>
            <CheckCheck size={14} /> Mark all read
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {isLoading ? (
          [...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80 }} />)
        ) : notifications.length === 0 ? (
          <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
            <Bell size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ color: 'var(--color-text-secondary)', marginBottom: 8 }}>All caught up!</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>No notifications to show.</p>
          </div>
        ) : (
          notifications.map(n => {
            const Icon = TYPE_ICONS[n.type] || Bell
            const color = TYPE_COLORS[n.type] || '#7c3aed'
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card"
                style={{
                  padding: '14px 16px',
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  opacity: n.read ? 0.6 : 1,
                  cursor: n.read ? 'default' : 'pointer',
                  transition: 'opacity 0.2s',
                }}
                onClick={() => !n.read && markOneMutation.mutate(n.id)}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}20`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <Icon size={16} color={color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary)' }}>{n.title}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent-violet)', flexShrink: 0 }} />}
                      <span style={{ fontSize: 11, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                        {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : ''}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.5, margin: 0 }}>{n.message}</p>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
