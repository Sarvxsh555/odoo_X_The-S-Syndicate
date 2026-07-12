import { motion } from 'framer-motion'
import { Package, ArrowUpRight, RotateCcw, Wrench, Plus, Shield, AlertTriangle, CheckCircle } from 'lucide-react'
import { format, parseISO } from 'date-fns'

const EVENT_CONFIG = {
  CREATED: { icon: Plus, color: '#30d158', label: 'Asset Created' },
  ALLOCATED: { icon: ArrowUpRight, color: '#5e5ce6', label: 'Allocated' },
  RETURNED: { icon: RotateCcw, color: '#0a84ff', label: 'Returned' },
  MAINTENANCE_STARTED: { icon: Wrench, color: '#ff9f0a', label: 'Maintenance Started' },
  MAINTENANCE_RESOLVED: { icon: CheckCircle, color: '#30d158', label: 'Maintenance Resolved' },
  TRANSFERRED: { icon: ArrowUpRight, color: '#32ade6', label: 'Transferred' },
  CONDITION_UPDATED: { icon: Shield, color: '#bf5af2', label: 'Condition Updated' },
  STATUS_CHANGED: { icon: Package, color: '#ff9f0a', label: 'Status Changed' },
  WARRANTY_EXPIRING: { icon: AlertTriangle, color: '#ff453a', label: 'Warranty Alert' },
}

function TimelineEvent({ event, isLast, index }) {
  const cfg = EVENT_CONFIG[event.eventType] || EVENT_CONFIG.STATUS_CHANGED
  const Icon = cfg.icon
  const dateStr = event.createdAt ? format(parseISO(event.createdAt), 'MMM d, yyyy · h:mm a') : ''

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      style={{ display: 'flex', gap: 16, position: 'relative' }}
    >
      {/* Left: icon + line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: `${cfg.color}18`,
          border: `2px solid ${cfg.color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', zIndex: 1,
          boxShadow: `0 0 12px ${cfg.color}20`
        }}>
          <Icon size={15} color={cfg.color} strokeWidth={2} />
        </div>
        {!isLast && (
          <div style={{
            width: 2,
            flex: 1,
            minHeight: 24,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)',
            marginTop: 4,
          }} />
        )}
      </div>

      {/* Right: content */}
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: cfg.color }}>
            {event.description || cfg.label}
          </span>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', whiteSpace: 'nowrap', marginLeft: 12 }}>
            {dateStr}
          </span>
        </div>
        {event.performedByName && (
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>
            by {event.performedByName}
          </div>
        )}
        {(event.fromValue || event.toValue) && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 11, padding: '2px 8px', borderRadius: 5,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--color-border-subtle)',
            color: 'var(--color-text-secondary)',
          }}>
            {event.fromValue && <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>{event.fromValue}</span>}
            {event.fromValue && event.toValue && <span style={{ color: 'var(--color-text-muted)' }}>→</span>}
            {event.toValue && <span style={{ color: cfg.color, fontWeight: 600 }}>{event.toValue}</span>}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function AssetTimeline({ allocations = [], maintenance = [], asset = null }) {
  // Build unified timeline from allocations + maintenance
  const events = []

  if (asset) {
    events.push({
      id: 'created',
      eventType: 'CREATED',
      description: 'Asset registered in system',
      createdAt: asset.purchaseDate ? `${asset.purchaseDate}T00:00:00` : null,
      performedByName: null,
    })
  }

  allocations.forEach(a => {
    events.push({
      id: `alloc-${a.id}`,
      eventType: 'ALLOCATED',
      description: `Allocated to ${a.allocatedToName}`,
      createdAt: a.allocationDate ? `${a.allocationDate}T00:00:00` : a.createdAt,
      performedByName: a.allocatedByName,
      toValue: a.departmentName,
    })
    if (a.returnDate) {
      events.push({
        id: `return-${a.id}`,
        eventType: 'RETURNED',
        description: `Returned from ${a.allocatedToName}`,
        createdAt: `${a.returnDate}T00:00:00`,
        performedByName: a.allocatedByName,
        fromValue: a.conditionAtAllocation,
        toValue: a.conditionAtReturn,
      })
    }
  })

  maintenance.forEach(m => {
    events.push({
      id: `maint-${m.id}`,
      eventType: 'MAINTENANCE_STARTED',
      description: m.title,
      createdAt: m.createdAt,
      performedByName: m.requestedByName,
      toValue: m.priority,
    })
    if (m.status === 'RESOLVED') {
      events.push({
        id: `maint-resolved-${m.id}`,
        eventType: 'MAINTENANCE_RESOLVED',
        description: `Resolved: ${m.title}`,
        createdAt: m.resolvedDate || m.updatedAt,
        performedByName: m.technicianName,
      })
    }
  })

  // Sort by date descending
  events.sort((a, b) => {
    if (!a.createdAt) return 1
    if (!b.createdAt) return -1
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  if (events.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <Package size={40} color="var(--color-text-muted)" style={{ margin: '0 auto 12px' }} />
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>No history events recorded yet.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '4px 0' }}>
      {events.map((event, i) => (
        <TimelineEvent key={event.id} event={event} isLast={i === events.length - 1} index={i} />
      ))}
    </div>
  )
}
