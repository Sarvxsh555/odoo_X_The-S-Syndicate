import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { bookingApi } from '../../api/services'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday,
  format, getHours, parseISO
} from 'date-fns'
import { motion } from 'framer-motion'

const STATUS_COLORS = {
  UPCOMING: '#5e5ce6',
  IN_PROGRESS: '#ff9f0a',
  COMPLETED: '#30d158',
  CANCELLED: '#8e8e93',
}

function BookingDot({ booking }) {
  const color = STATUS_COLORS[booking.status] || '#5e5ce6'
  return (
    <div
      title={`${booking.title} (${booking.status})`}
      style={{
        height: 4, borderRadius: 2, background: color, opacity: 0.85,
        marginBottom: 1, overflow: 'hidden', fontSize: 9,
        paddingLeft: 3, lineHeight: '4px', color: 'white',
        whiteSpace: 'nowrap', textOverflow: 'ellipsis',
      }}
    />
  )
}

export default function CalendarView({ onNewBooking }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)

  const { data } = useQuery({
    queryKey: ['bookings', 'all', format(currentMonth, 'yyyy-MM')],
    queryFn: () => bookingApi.getAll({ size: 200, page: 0 }),
    keepPreviousData: true,
  })

  const allBookings = data?.data?.content || []

  // Build a map: dateStr -> bookings[]
  const bookingsByDay = useMemo(() => {
    const map = {}
    allBookings.forEach(b => {
      if (!b.startDatetime) return
      const key = format(parseISO(b.startDatetime), 'yyyy-MM-dd')
      if (!map[key]) map[key] = []
      map[key].push(b)
    })
    return map
  }, [allBookings])

  // Build calendar grid
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days = []
  let d = gridStart
  while (d <= gridEnd) {
    days.push(d)
    d = addDays(d, 1)
  }

  const selectedBookings = selectedDay ? (bookingsByDay[format(selectedDay, 'yyyy-MM-dd')] || []) : []

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn-ghost btn-sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft size={16} />
          </button>
          <h3 style={{ fontSize: 17, fontWeight: 700, minWidth: 160, textAlign: 'center' }}>
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <button className="btn-ghost btn-sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight size={16} />
          </button>
          <button className="btn-ghost btn-sm" onClick={() => setCurrentMonth(new Date())}>Today</button>
        </div>
        {onNewBooking && (
          <button className="btn-primary btn-sm" onClick={() => onNewBooking(selectedDay)}>
            <Plus size={13} /> New Booking
          </button>
        )}
      </div>

      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', padding: '4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {days.map(day => {
          const key = format(day, 'yyyy-MM-dd')
          const dayBookings = bookingsByDay[key] || []
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isSelected = selectedDay && isSameDay(day, selectedDay)
          const isTodayDay = isToday(day)

          return (
            <div
              key={key}
              onClick={() => setSelectedDay(isSelected ? null : day)}
              style={{
                minHeight: 72,
                borderRadius: 8,
                padding: '6px 6px 4px',
                background: isSelected
                  ? 'rgba(94,92,230,0.18)'
                  : isTodayDay
                    ? 'rgba(10,132,255,0.1)'
                    : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isSelected ? 'rgba(94,92,230,0.5)' : isTodayDay ? 'rgba(10,132,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
                cursor: 'pointer',
                transition: 'all 0.15s',
                opacity: isCurrentMonth ? 1 : 0.3,
              }}
            >
              <div style={{
                fontSize: 12, fontWeight: isTodayDay ? 800 : 500,
                color: isTodayDay ? '#0a84ff' : isSelected ? '#5e5ce6' : 'var(--color-text-secondary)',
                marginBottom: 4,
                width: 20, height: 20, borderRadius: '50%',
                background: isTodayDay ? 'rgba(10,132,255,0.2)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {format(day, 'd')}
              </div>
              {dayBookings.slice(0, 3).map(b => <BookingDot key={b.id} booking={b} />)}
              {dayBookings.length > 3 && (
                <div style={{ fontSize: 9, color: 'var(--color-text-muted)', marginTop: 1 }}>+{dayBookings.length - 3} more</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
        {Object.entries(STATUS_COLORS).map(([s, c]) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
            <span style={{ color: 'var(--color-text-muted)' }}>{s}</span>
          </div>
        ))}
      </div>

      {/* Day detail panel */}
      {selectedDay && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{ marginTop: 16, padding: 20 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700 }}>
              {format(selectedDay, 'EEEE, MMMM d, yyyy')}
            </h4>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{selectedBookings.length} booking{selectedBookings.length !== 1 ? 's' : ''}</span>
          </div>
          {selectedBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>No bookings on this day.</p>
              {onNewBooking && (
                <button className="btn-primary btn-sm" style={{ marginTop: 10 }} onClick={() => onNewBooking(selectedDay)}>
                  <Plus size={12} /> Book this day
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedBookings.map(b => (
                <div key={b.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8,
                  background: `${STATUS_COLORS[b.status] || '#5e5ce6'}10`,
                  border: `1px solid ${STATUS_COLORS[b.status] || '#5e5ce6'}25`,
                }}>
                  <div style={{ width: 3, height: 36, borderRadius: 2, background: STATUS_COLORS[b.status] || '#5e5ce6', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{b.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                      {b.resourceName} · {b.startDatetime ? format(parseISO(b.startDatetime), 'HH:mm') : ''} – {b.endDatetime ? format(parseISO(b.endDatetime), 'HH:mm') : ''}
                    </div>
                  </div>
                  <span className={`badge badge-${b.status === 'UPCOMING' ? 'allocated' : b.status === 'COMPLETED' ? 'available' : 'retired'}`} style={{ fontSize: 10 }}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
