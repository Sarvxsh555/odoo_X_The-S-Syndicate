import { useQuery } from '@tanstack/react-query'
import { dashboardApi, activityApi, maintenanceApi, assetApi, allocationApi } from '../../api/services'
import { Wrench, ArrowLeftRight, Clock, AlertCircle, Laptop, Calendar, Activity, Zap, CheckCircle2, FileText, Send } from 'lucide-react'
import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { format, subDays } from 'date-fns'

function StatCard({ title, value, total, icon: Icon, color, progressColor, statusText, statusColor, delay }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 1, 0.5, 1] }}
      style={{
        background: 'rgba(31, 25, 46, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: '24px 32px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--color-text-muted)', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 12 }}>
            {title}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 42, fontWeight: 800, color: 'white', lineHeight: 1 }}>{value}</span>
            <span style={{ fontSize: 14, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>/ {total}</span>
          </div>
        </div>
        <div style={{
          width: 48, height: 48, borderRadius: 12, background: color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 20px ${color}40`
        }}>
          <Icon size={24} color={color === '#FFFFFF' ? '#1A1525' : 'white'} strokeWidth={2.5} />
        </div>
      </div>
      
      {/* Progress Bar */}
      <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, marginBottom: 12, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${percentage}%`, background: progressColor, borderRadius: 2 }} />
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.05em', fontWeight: 600 }}>
        <span style={{ color: 'var(--color-text-muted)' }}>CAPACITY PROFILE</span>
        <span style={{ color: statusColor }}>{statusText}</span>
      </div>
    </motion.div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Queries
  const { data: statsData } = useQuery({ queryKey: ['dashboard', 'stats'], queryFn: dashboardApi.getStats })
  const { data: upcomingMaintData } = useQuery({ queryKey: ['dashboard', 'upcomingMaint'], queryFn: () => maintenanceApi.getAll({ status: 'PENDING', size: 4 }) })
  const { data: activityData } = useQuery({ queryKey: ['dashboard', 'activity'], queryFn: () => activityApi.getRecent(5) })
  const { data: pendingTransfersData } = useQuery({ queryKey: ['dashboard', 'pendingTransfers'], queryFn: allocationApi.getPendingTransfers })
  
  // Mock data for charts since backend might not have this fully wired yet
  const maintTrendData = Array.from({ length: 7 }).map((_, i) => ({
    name: format(subDays(new Date(), 6 - i), 'EEE'),
    requests: Math.floor(Math.random() * 10) + 1
  }))

  const heatmapData = Array.from({ length: 7 }).map((_, d) => 
    Array.from({ length: 10 }).map((_, h) => ({
      day: d, hour: h + 8, value: Math.floor(Math.random() * 100)
    }))
  ).flat()

  const stats = statsData?.data || { totalAssets: 0, availableAssets: 0, activeAllocations: 0, maintenanceRequests: 0 }
  const upcomingMaint = upcomingMaintData?.data?.content || []
  const activities = activityData?.data?.content || []
  const pendingTransfersCount = pendingTransfersData?.data?.totalElements || 0
  const hasOverdue = upcomingMaint.length > 0 // Mocking overdue based on pending maint

  return (
    <div className="page-body" style={{ padding: '40px' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', letterSpacing: '-0.02em', marginBottom: 12 }}>
            Operational Matrix Control
          </h1>
          <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--color-text-secondary)', letterSpacing: '0.05em' }}>
            SECURE ACCESS CLEARANCE LEVEL: <span style={{ color: 'var(--color-accent-emerald)' }}>ADMIN</span> // DEPLOYED CLUSTER: OREGON-W2
          </div>
        </div>
        
        <div style={{
          background: 'rgba(31, 25, 46, 0.8)', border: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '12px 20px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent-emerald)', boxShadow: '0 0 10px var(--color-accent-emerald)' }} />
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--color-accent-emerald)', fontWeight: 700, letterSpacing: '0.05em' }}>
            LEDGER ENGINE: SECURED & SYNCHRONIZED
          </span>
        </div>
      </div>

      {/* Alert Box */}
      {hasOverdue && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          style={{
            background: 'rgba(255, 51, 102, 0.1)', border: '1px solid rgba(255, 51, 102, 0.2)',
            borderRadius: 16, padding: '24px 32px', marginBottom: 32,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255, 51, 102, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={20} color="var(--color-accent-rose)" />
            </div>
            <div>
              <h4 style={{ fontFamily: 'monospace', fontSize: 14, color: 'white', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 6 }}>
                OVERDUE HARDWARE DETECTED
              </h4>
              <p style={{ color: 'var(--color-accent-rose)', fontSize: 13, margin: 0 }}>
                {upcomingMaint.length} asset allocation tags are past their return threshold limits. Compliance action required immediately.
              </p>
            </div>
          </div>
          <button style={{
            background: 'rgba(255, 51, 102, 0.2)', color: 'var(--color-accent-rose)',
            border: '1px solid rgba(255, 51, 102, 0.4)', borderRadius: 8,
            padding: '10px 20px', fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.2s'
          }} onClick={() => navigate('/allocations')}>
            AUDIT OVERDUES
          </button>
        </motion.div>
      )}

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 24, marginBottom: 32 }}>
        <StatCard 
          title="ASSETS AVAILABLE" 
          value={stats.availableAssets} 
          total={stats.totalAssets || 8} 
          icon={Laptop} 
          color="var(--color-accent-cyan)" 
          progressColor="linear-gradient(90deg, var(--color-accent-cyan), var(--color-accent-violet))"
          statusText="Optimal"
          statusColor="var(--color-accent-cyan)"
          delay={0.1} 
        />
        <StatCard 
          title="ASSETS ALLOCATED" 
          value={stats.activeAllocations} 
          total={stats.totalAssets || 8} 
          icon={ArrowLeftRight} 
          color="var(--color-accent-violet)" 
          progressColor="var(--color-accent-violet)"
          statusText={`${Math.round((stats.activeAllocations / (stats.totalAssets || 1)) * 100)}% Usage`}
          statusColor="var(--color-accent-cyan)"
          delay={0.2} 
        />
        <StatCard 
          title="MAINTENANCE STREAM" 
          value={stats.maintenanceRequests} 
          total={stats.totalAssets || 8} 
          icon={Wrench} 
          color="var(--color-accent-amber)" 
          progressColor="rgba(255,255,255,0.1)"
          statusText={`${stats.maintenanceRequests} Urgent Tasks`}
          statusColor="var(--color-accent-cyan)"
          delay={0.3} 
        />
        <StatCard 
          title="ACTIVE BOOKINGS" 
          value={2} 
          total={4} 
          icon={Calendar} 
          color="var(--color-accent-emerald)" 
          progressColor="linear-gradient(90deg, var(--color-accent-emerald), var(--color-accent-cyan))"
          statusText="Fully Cleared"
          statusColor="var(--color-accent-cyan)"
          delay={0.4} 
        />
        <StatCard 
          title="PENDING TRANSFERS" 
          value={pendingTransfersCount} 
          total={stats.totalAssets || 8} 
          icon={Send} 
          color="var(--color-accent-rose)" 
          progressColor="rgba(255,255,255,0.1)"
          statusText={pendingTransfersCount > 0 ? "Action Required" : "All Clear"}
          statusColor="var(--color-accent-rose)"
          delay={0.5} 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 32, marginBottom: 120 }}>
        {/* Left Column: Quick Actions & Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Quick Actions */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 13, color: 'var(--color-text-muted)', fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 16 }}>QUICK ACTIONS</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => navigate('/assets/register')}>
                <Zap size={16} /> Register New Asset
              </button>
              <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => navigate('/allocations')}>
                <ArrowLeftRight size={16} /> Allocate Asset
              </button>
              <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => navigate('/maintenance')}>
                <AlertCircle size={16} /> Report Issue
              </button>
            </div>
          </div>

          {/* Real Activity Feed */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 13, color: 'var(--color-text-muted)', fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 16 }}>SYSTEM ACTIVITY</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {activities.length > 0 ? activities.map((activity, i) => (
                <div key={activity.id || i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <Activity size={14} color="var(--color-accent-violet-light)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: 'white', lineHeight: 1.4 }}>
                      <span style={{ fontWeight: 600, color: 'var(--color-accent-cyan)' }}>{activity.userName}</span> {activity.action} <span style={{ fontWeight: 600 }}>{activity.entityType}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                      {new Date(activity.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>No recent activity.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Maintenance Trend Area Chart */}
          <div className="glass-card" style={{ padding: 24, height: 300 }}>
            <h3 style={{ fontSize: 13, color: 'var(--color-text-muted)', fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 16 }}>MAINTENANCE TREND (7 DAYS)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={maintTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent-amber)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-accent-amber)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#1A1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                  itemStyle={{ color: 'var(--color-accent-amber)' }}
                />
                <Area type="monotone" dataKey="requests" stroke="var(--color-accent-amber)" strokeWidth={3} fillOpacity={1} fill="url(#colorRequests)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Booking Heatmap (Custom Grid) */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 13, color: 'var(--color-text-muted)', fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 16 }}>RESOURCE BOOKING DENSITY</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '40px repeat(10, 1fr)', gap: 4 }}>
              {/* Header Row (Hours) */}
              <div />
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} style={{ fontSize: 10, color: 'var(--color-text-muted)', textAlign: 'center' }}>{i + 8}h</div>
              ))}
              
              {/* Grid Body */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, d) => (
                <React.Fragment key={day}>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', alignSelf: 'center' }}>{day}</div>
                  {Array.from({ length: 10 }).map((_, h) => {
                    const val = heatmapData.find(x => x.day === d && x.hour === h + 8)?.value || 0
                    const opacity = Math.max(0.1, val / 100)
                    return (
                      <div 
                        key={h} 
                        style={{ 
                          height: 24, 
                          background: `rgba(99, 102, 241, ${opacity})`, 
                          borderRadius: 4,
                          border: '1px solid rgba(255,255,255,0.02)' 
                        }} 
                        title={`${day} ${h+8}h: ${val} bookings`}
                      />
                    )
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
