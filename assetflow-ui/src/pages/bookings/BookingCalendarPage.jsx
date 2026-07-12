import { useState, useEffect } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, addMonths, subMonths } from 'date-fns'
import { enUS } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useQuery } from '@tanstack/react-query'
import { bookingApi, maintenanceApi, allocationApi } from '../../api/services'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, CalendarDays, Wrench, ArrowLeftRight, X, Filter, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

const locales = { 'en-US': enUS }
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales })

const EVENT_COLORS = {
  booking: { bg: '#8B5CF6', border: '#7C3AED' },
  maintenance: { bg: '#FFB800', border: '#D97706' },
  allocation: { bg: '#00F0FF', border: '#0891B2' },
  return: { bg: '#00FF9D', border: '#059669' },
}

function eventStyleGetter(event) {
  const colors = EVENT_COLORS[event.type] || EVENT_COLORS.booking
  return {
    style: {
      backgroundColor: colors.bg,
      borderLeft: `3px solid ${colors.border}`,
      borderRadius: '6px',
      color: '#1A1525',
      fontSize: '12px',
      fontWeight: '700',
      padding: '2px 6px',
      border: 'none',
      boxShadow: `0 2px 8px ${colors.bg}40`,
    }
  }
}

function EventDetailModal({ event, onClose }) {
  if (!event) return null
  const colors = EVENT_COLORS[event.type] || EVENT_COLORS.booking

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose} style={{ zIndex: 3000 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
            borderRadius: 20, padding: 32, maxWidth: 440, width: '90%', position: 'relative'
          }}
        >
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
            <X size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: colors.bg, boxShadow: `0 0 8px ${colors.bg}` }} />
            <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.08em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              {event.type}
            </span>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>{event.title}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Start</span>
              <span style={{ fontWeight: 600 }}>{format(event.start, 'PPp')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--color-text-muted)' }}>End</span>
              <span style={{ fontWeight: 600 }}>{format(event.end, 'PPp')}</span>
            </div>
            {event.resource && (
              <div style={{ marginTop: 8, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                {Object.entries(event.resource).map(([k, v]) => v && (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{String(v)}</span>
                  </div>
                ))}
              </div>
            )}
            
            {event.type === 'booking' && event.raw && event.raw.status !== 'CANCELLED' && event.raw.status !== 'COMPLETED' && (
              <div style={{ marginTop: 12 }}>
                <button 
                  className="btn-secondary" 
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => {
                    // Open a reschedule prompt or modal
                    const newStartStr = prompt('Enter new start date/time (YYYY-MM-DD HH:mm)', format(event.start, 'yyyy-MM-dd HH:mm'))
                    if (!newStartStr) return
                    const newEndStr = prompt('Enter new end date/time (YYYY-MM-DD HH:mm)', format(event.end, 'yyyy-MM-dd HH:mm'))
                    if (!newEndStr) return
                    
                    try {
                      const newStart = new Date(newStartStr).toISOString()
                      const newEnd = new Date(newEndStr).toISOString()
                      
                      bookingApi.reschedule(event.raw.id, {
                        title: event.raw.title,
                        resourceId: event.raw.resourceId,
                        startDatetime: newStart,
                        endDatetime: newEnd,
                        notes: 'Rescheduled via calendar'
                      }).then(() => {
                        toast.success('Booking rescheduled')
                        onClose(true) // pass true to refetch
                      }).catch(e => toast.error(e?.response?.data?.message || 'Failed to reschedule'))
                    } catch(e) {
                      toast.error('Invalid date format')
                    }
                  }}
                >
                  <Clock size={16} /> Reschedule
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default function BookingCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState('month')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [filter, setFilter] = useState({ booking: true, maintenance: true, allocation: true })

  const { data: bookingsData } = useQuery({
    queryKey: ['bookings', 'all'],
    queryFn: () => bookingApi.getAll({ size: 200 })
  })

  const { data: maintenanceData } = useQuery({
    queryKey: ['maintenance', 'all'],
    queryFn: () => maintenanceApi.getAll({ size: 200 })
  })

  const { data: allocationsData } = useQuery({
    queryKey: ['allocations', 'active'],
    queryFn: () => allocationApi.getAll({ status: 'ACTIVE', size: 200 })
  })

  // Build calendar events from all data sources
  const events = [
    // Bookings
    ...(filter.booking ? (bookingsData?.data?.content || []).map(b => ({
      id: `booking-${b.id}`,
      title: `📅 ${b.assetName || 'Booking'} — ${b.bookedByName || ''}`,
      start: new Date(b.startDate),
      end: new Date(b.endDate),
      type: 'booking',
      resource: { Asset: b.assetName, BookedBy: b.bookedByName, Status: b.status },
      raw: b
    })) : []),

    // Maintenance
    ...(filter.maintenance ? (maintenanceData?.data?.content || []).map(m => ({
      id: `maint-${m.id}`,
      title: `🔧 ${m.title || 'Maintenance'} — ${m.assetName || ''}`,
      start: new Date(m.scheduledDate || m.createdAt),
      end: new Date(m.scheduledDate || m.createdAt),
      type: 'maintenance',
      resource: { Asset: m.assetName, Priority: m.priority, Status: m.status }
    })) : []),

    // Allocations (expected return)
    ...(filter.allocation ? (allocationsData?.data?.content || []).filter(a => a.expectedReturnDate).map(a => ({
      id: `return-${a.id}`,
      title: `↩ Return: ${a.assetName || 'Asset'}`,
      start: new Date(a.expectedReturnDate),
      end: new Date(a.expectedReturnDate),
      type: 'return',
      resource: { Asset: a.assetName, AssignedTo: a.employeeName, DueDate: a.expectedReturnDate }
    })) : []),
  ]

  const FILTER_TYPES = [
    { key: 'booking', label: 'Bookings', icon: CalendarDays, color: EVENT_COLORS.booking.bg },
    { key: 'maintenance', label: 'Maintenance', icon: Wrench, color: EVENT_COLORS.maintenance.bg },
    { key: 'allocation', label: 'Returns', icon: ArrowLeftRight, color: EVENT_COLORS.return.bg },
  ]

  return (
    <div className="page-body" style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 }}>
            Enterprise Calendar
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>
            Bookings, maintenance schedules, and asset returns — all in one view.
          </p>
        </div>

        {/* View Switcher */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.05)', padding: 4, borderRadius: 10 }}>
          {['month', 'week', 'day', 'agenda'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
                background: view === v ? 'var(--color-accent-cyan)' : 'transparent',
                color: view === v ? '#1A1525' : 'var(--color-text-secondary)',
              }}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Badges */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {FILTER_TYPES.map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => setFilter(f => ({ ...f, [key]: !f[key] }))}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20,
              border: `1px solid ${filter[key] ? color + '50' : 'var(--color-border)'}`,
              background: filter[key] ? color + '15' : 'transparent',
              color: filter[key] ? color : 'var(--color-text-muted)',
              cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s'
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: filter[key] ? color : 'var(--color-text-muted)', boxShadow: filter[key] ? `0 0 6px ${color}` : 'none' }} />
            <Icon size={13} />
            {label}
          </button>
        ))}
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)', alignSelf: 'center', marginLeft: 8 }}>
          {events.length} events shown
        </span>
      </div>

      {/* Calendar */}
      <div style={{
        background: 'rgba(31, 25, 46, 0.8)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 20, overflow: 'hidden', padding: 24,
        minHeight: 600,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
      }}
      className="calendar-dark"
      >
        <Calendar
          localizer={localizer}
          events={events}
          view={view}
          onView={setView}
          date={currentDate}
          onNavigate={setCurrentDate}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={event => setSelectedEvent(event)}
          style={{ minHeight: 560 }}
          toolbar={true}
          popup={true}
        />
      </div>

      {/* Custom dark-mode calendar styles injected */}
      <style>{`
        .calendar-dark .rbc-calendar { background: transparent; color: white; }
        .calendar-dark .rbc-toolbar button { color: var(--color-text-secondary); background: transparent; border: 1px solid var(--color-border); border-radius: 8px; padding: 6px 14px; font-weight: 600; font-size: 13px; }
        .calendar-dark .rbc-toolbar button:hover { background: rgba(255,255,255,0.05); color: white; }
        .calendar-dark .rbc-toolbar button.rbc-active { background: var(--color-accent-cyan); color: #1A1525 !important; border-color: var(--color-accent-cyan); }
        .calendar-dark .rbc-toolbar-label { color: white; font-weight: 800; font-size: 18px; letter-spacing: -0.01em; }
        .calendar-dark .rbc-header { border-bottom: 1px solid rgba(255,255,255,0.06); padding: 10px 0; color: var(--color-text-muted); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
        .calendar-dark .rbc-off-range-bg { background: rgba(0,0,0,0.15); }
        .calendar-dark .rbc-today { background: rgba(0, 240, 255, 0.05) !important; }
        .calendar-dark .rbc-day-bg { border-color: rgba(255,255,255,0.04); }
        .calendar-dark .rbc-month-view, .calendar-dark .rbc-time-view { border: none; border-radius: 12px; overflow: hidden; }
        .calendar-dark .rbc-time-content, .calendar-dark .rbc-time-header-content { border-color: rgba(255,255,255,0.05); }
        .calendar-dark .rbc-current-time-indicator { background: var(--color-accent-cyan); }
        .calendar-dark .rbc-date-cell { padding: 4px 8px; font-size: 13px; font-weight: 600; color: var(--color-text-secondary); }
        .calendar-dark .rbc-date-cell.rbc-now button { color: var(--color-accent-cyan); font-weight: 800; }
        .calendar-dark .rbc-show-more { color: var(--color-accent-cyan); font-size: 11px; font-weight: 700; background: none; }
        .calendar-dark .rbc-agenda-view table { border-color: rgba(255,255,255,0.05); }
        .calendar-dark .rbc-agenda-date-cell, .calendar-dark .rbc-agenda-time-cell { color: var(--color-text-secondary); font-size: 12px; }
        .calendar-dark .rbc-agenda-event-cell { color: white; }
        .calendar-dark .rbc-slot-selection { background: rgba(0, 240, 255, 0.15); }
      `}</style>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal 
          event={selectedEvent} 
          onClose={(refetch) => {
            setSelectedEvent(null)
            if (refetch === true) {
              // React query refetching logic
              import('@tanstack/react-query').then(({ QueryClient }) => {
                // Just use a window reload for now to guarantee fresh data since we don't have queryClient in this scope without a hook
                window.location.reload()
              })
            }
          }} 
        />
      )}
    </div>
  )
}
