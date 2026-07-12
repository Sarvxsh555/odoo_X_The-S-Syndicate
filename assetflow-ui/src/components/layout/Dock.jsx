import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Package, ArrowLeftRight, Calendar, Wrench, ClipboardCheck, BarChart3, Bell, Settings, CalendarDays, Map } from 'lucide-react'
import { motion } from 'framer-motion'

const DOCK_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, color: '#00F0FF', label: 'Dashboard' },
  { to: '/assets', icon: Package, color: '#A09DB0', label: 'Assets' },
  { to: '/map', icon: Map, color: '#00FF9D', label: 'Live Map' },
  { to: '/allocations', icon: ArrowLeftRight, color: '#A78BFA', label: 'Allocations' },
  { to: '/calendar', icon: CalendarDays, color: '#FFFFFF', bg: '#8B5CF6', label: 'Calendar' },
  { to: '/bookings', icon: Calendar, color: '#FFFFFF', bg: '#FF3366', label: 'Bookings', isCalendar: true },
  { to: '/maintenance', icon: Wrench, color: '#FFB800', label: 'Maintenance' },
  { to: '/audits', icon: ClipboardCheck, color: '#00FF9D', label: 'Audits' },
  { to: '/reports', icon: BarChart3, color: '#FF3366', label: 'Reports' },
  { to: '/notifications', icon: Bell, color: '#FF3366', label: 'Alerts', hasBadge: true },
  { to: '/settings', icon: Settings, color: '#A09DB0', label: 'Settings' }
]

export default function Dock() {
  const currentDay = new Date().getDate()

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: 'calc(50% + 130px)', // offset by half sidebar width
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 12,
      padding: '12px 24px',
      background: 'rgba(31, 25, 46, 0.75)',
      backdropFilter: 'blur(30px)',
      WebkitBackdropFilter: 'blur(30px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 32,
      boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
      zIndex: 1000
    }}>
      {DOCK_ITEMS.map((item, idx) => (
        <NavLink key={item.to} to={item.to} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {({ isActive }) => (
            <>
              <motion.div
                whileHover={{ scale: 1.2, y: -10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: item.bg || `rgba(${isActive ? '255,255,255,0.15' : '255,255,255,0.05'})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isActive ? `0 0 15px ${item.color}40` : 'none',
                  border: isActive ? `1px solid ${item.color}40` : '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  position: 'relative',
                  flexDirection: 'column'
                }}
              >
                {item.isCalendar ? (
                  <>
                    <div style={{ fontSize: 9, fontWeight: 800, color: '#FFFFFF', marginTop: -4 }}>SUN</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF', marginTop: -2 }}>{currentDay}</div>
                  </>
                ) : (
                  <item.icon size={24} color={item.color} strokeWidth={isActive ? 2.5 : 2} />
                )}
                {item.hasBadge && (
                  <div style={{ position: 'absolute', top: -4, right: -4, width: 12, height: 12, borderRadius: '50%', background: '#FF3B30', border: '2px solid #1A1525' }} />
                )}
              </motion.div>
              {isActive && (
                <motion.div layoutId="dock-dot" style={{ width: 4, height: 4, borderRadius: '50%', background: 'white', position: 'absolute', bottom: -8 }} />
              )}
            </>
          )}
        </NavLink>
      ))}
    </div>
  )
}
