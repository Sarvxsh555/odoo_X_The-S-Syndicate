import { useQuery } from '@tanstack/react-query'
import { notificationApi, activityApi } from '../../api/services'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck, Package, Wrench, Calendar, ArrowLeftRight, Activity, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { formatDistanceToNow, parseISO, format } from 'date-fns'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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

const ACTIVITY_ICONS = {
  ASSET_CREATED: { icon: Package, color: '#0a84ff' },
  ASSET_ALLOCATED: { icon: ArrowLeftRight, color: '#5e5ce6' },
  ASSET_RETURNED: { icon: ArrowLeftRight, color: '#30d158' },
  MAINTENANCE_CREATED: { icon: Wrench, color: '#ff9f0a' },
  MAINTENANCE_RESOLVED: { icon: CheckCheck, color: '#30d158' },
  BOOKING_CREATED: { icon: Calendar, color: '#32ade6' },
  DEFAULT: { icon: Activity, color: '#8e8e93' },
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('notifications')
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [activityPage, setActivityPage] = useState(0)

  const { data: notifData, isLoading: notifLoading } = useQuery({
    queryKey: ['notifications', { unreadOnly }],
    queryFn: () => notificationApi.getAll({ unreadOnly }),
    enabled: activeTab === 'notifications',
  })

  const { data: actData, isLoading: actLoading } = useQuery({
    queryKey: ['activity', activityPage],
    queryFn: () => activityApi.getAll({ page: activityPage, size: 50 }),
    enabled: activeTab === 'activity',
    keepPreviousData: true,
  })

  const markAllMutation = useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => { queryClient.invalidateQueries(['notifications']); toast.success('All marked as read') },
  })

  const markOneMutation = useMutation({
    mutationFn: (id) => notificationApi.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  })

  const notifications = notifData?.data?.content || []
  const activities = actData?.data?.content || []
  const actTotalPages = actData?.data?.totalPages || 0

  return (
    <div className="page-header page-body" style={{ paddingTop: 32, maxWidth: 900, margin: '0 auto' }}>
      <div className="section-header" style={{ marginBottom: 16 }}>
        <div>
          <h2 className="section-title">Inbox</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
            {activeTab === 'notifications' ? `${notifications.length} items` : `${actData?.data?.totalElements || 0} events`}
          </p>
        </div>
        
        {activeTab === 'notifications' && (
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
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 20, borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: 0 }}>
        <button onClick={() => setActiveTab('notifications')} style={{
          padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, color: activeTab === 'notifications' ? 'var(--color-accent-violet-light)' : 'var(--color-text-muted)',
          borderBottom: activeTab === 'notifications' ? '2px solid var(--color-accent-violet)' : '2px solid transparent',
          transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8
        }}>
          <Bell size={14} /> Notifications
        </button>
        <button onClick={() => setActiveTab('activity')} style={{
          padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, color: activeTab === 'activity' ? 'var(--color-accent-violet-light)' : 'var(--color-text-muted)',
          borderBottom: activeTab === 'activity' ? '2px solid var(--color-accent-violet)' : '2px solid transparent',
          transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8
        }}>
          <Shield size={14} /> System Audit Logs
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {activeTab === 'notifications' && (
          notifLoading ? (
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
                    
                    {/* Entity Links if present (simulated via regex for now) */}
                    {n.message.includes('asset') && (
                       <div style={{ marginTop: 8 }}>
                         <span style={{ fontSize: 11, color: 'var(--color-accent-blue)', textDecoration: 'underline' }}>View details</span>
                       </div>
                    )}
                  </div>
                </motion.div>
              )
            })
          )
        )}

        {activeTab === 'activity' && (
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            {actLoading ? (
              <div style={{ padding: 32 }}>{[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 40, marginBottom: 8 }} />)}</div>
            ) : activities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 32px' }}>
                <Activity size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ color: 'var(--color-text-secondary)' }}>No audit logs found</h3>
              </div>
            ) : (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Event</th>
                      <th>User</th>
                      <th>IP / Client</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map(a => {
                      const cfg = ACTIVITY_ICONS[a.action] || ACTIVITY_ICONS.DEFAULT
                      const Icon = cfg.icon
                      return (
                        <tr key={a.id}>
                          <td style={{ fontSize: 11, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                            {a.createdAt ? format(parseISO(a.createdAt), 'MMM d, HH:mm:ss') : '—'}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 24, height: 24, borderRadius: 6, background: `${cfg.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={12} color={cfg.color} />
                              </div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{a.description || a.action}</div>
                                {a.entityType && (
                                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                                    {a.entityType} #{a.entityId}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={{ fontSize: 12 }}>{a.performedByName}</td>
                          <td style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{a.ipAddress || '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {actTotalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: 16, borderTop: '1px solid var(--color-border-subtle)' }}>
                    <button className="btn-ghost btn-sm" disabled={activityPage === 0} onClick={() => setActivityPage(p => p - 1)}>Previous</button>
                    <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Page {activityPage + 1} of {actTotalPages}</span>
                    <button className="btn-ghost btn-sm" disabled={activityPage >= actTotalPages - 1} onClick={() => setActivityPage(p => p + 1)}>Next</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
