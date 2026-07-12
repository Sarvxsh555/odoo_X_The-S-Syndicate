import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { dashboardApi } from '../../api/services'
import {
  Package, Users, Wrench, Calendar, AlertTriangle, TrendingUp,
  CheckCircle, Clock, Activity, ArrowUpRight, RotateCcw, Shield
} from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#f43f5e', '#6b7280', '#374151', '#06b6d4']

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
}

const StatCard = ({ title, value, icon: Icon, color, change, onClick }) => (
  <motion.div
    className="stat-card glass-card-hover"
    variants={fadeUp}
    initial="hidden"
    animate="show"
    whileHover={{ scale: 1.01 }}
    onClick={onClick}
    style={{ cursor: onClick ? 'pointer' : 'default' }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${color}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${color}30`,
      }}>
        <Icon size={20} color={color} />
      </div>
      {change !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: change >= 0 ? '#10b981' : '#f43f5e' }}>
          <ArrowUpRight size={12} style={{ transform: change < 0 ? 'rotate(90deg)' : 'none' }} />
          {Math.abs(change)}%
        </div>
      )}
    </div>
    <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-primary)', fontFamily: 'Outfit', marginBottom: 4 }}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </div>
    <div style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 500 }}>{title}</div>
    <div style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, borderRadius: '50%', background: color, filter: 'blur(40px)', opacity: 0.06, pointerEvents: 'none' }} />
  </motion.div>
)

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: statsData, isLoading: statsLoading } = useQuery({ queryKey: ['dashboard', 'stats'], queryFn: dashboardApi.getStats })
  const { data: statusData } = useQuery({ queryKey: ['dashboard', 'status'], queryFn: dashboardApi.getAssetStatus })
  const { data: deptData } = useQuery({ queryKey: ['dashboard', 'dept'], queryFn: dashboardApi.getDeptDistribution })
  const { data: maintenanceData } = useQuery({ queryKey: ['dashboard', 'maintenance'], queryFn: dashboardApi.getMaintenanceTrends })
  const { data: warrantiesData } = useQuery({ queryKey: ['dashboard', 'warranties'], queryFn: dashboardApi.getExpiringWarranties })
  const { data: returnsData } = useQuery({ queryKey: ['dashboard', 'returns'], queryFn: dashboardApi.getUpcomingReturns })

  const stats = statsData?.data || {}
  const statusChartData = (statusData?.data || []).map(d => ({ name: d.status, value: Number(d.count) }))
  const deptChartData = (deptData?.data || []).slice(0, 8).map(d => ({ name: d.department, count: Number(d.count) }))
  const warranties = warrantiesData?.data || []
  const upcomingReturns = returnsData?.data || []

  return (
    <div className="page-header page-body" style={{ paddingTop: 32 }}>
      {/* Welcome Banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, fontFamily: 'Outfit', marginBottom: 4 }}>
          Good morning, {user?.firstName} 👋
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 15 }}>
          Here's what's happening across your asset ecosystem today.
        </p>
      </motion.div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard title="Total Assets" value={stats.totalAssets || 0} icon={Package} color="#6366f1" onClick={() => navigate('/assets')} />
        <StatCard title="Available" value={stats.availableAssets || 0} icon={CheckCircle} color="#10b981" onClick={() => navigate('/assets?status=AVAILABLE')} />
        <StatCard title="Allocated" value={stats.allocatedAssets || 0} icon={ArrowUpRight} color="#3b82f6" onClick={() => navigate('/allocations')} />
        <StatCard title="In Maintenance" value={stats.maintenanceAssets || 0} icon={Wrench} color="#f59e0b" onClick={() => navigate('/maintenance')} />
        <StatCard title="Active Allocations" value={stats.activeAllocations || 0} icon={Activity} color="#06b6d4" />
        <StatCard title="Overdue Returns" value={stats.overdueAllocations || 0} icon={Clock} color="#f43f5e" />
        <StatCard title="Employees" value={stats.totalEmployees || 0} icon={Users} color="#8b5cf6" onClick={() => navigate('/employees')} />
        <StatCard title="Expiring Warranties" value={stats.expiringWarranties30Days || 0} icon={Shield} color="#f97316" />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Asset Status Pie */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div className="section-header" style={{ marginBottom: 20 }}>
            <h3 className="section-title" style={{ fontSize: 16 }}>Asset Status Distribution</h3>
          </div>
          {statusChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                  {statusChartData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>No data yet</div>
          )}
        </div>

        {/* Department Distribution Bar */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div className="section-header" style={{ marginBottom: 20 }}>
            <h3 className="section-title" style={{ fontSize: 16 }}>Assets by Department</h3>
          </div>
          {deptChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={deptChartData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} width={90} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>No data yet</div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Expiring Warranties */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div className="section-header">
            <h3 className="section-title" style={{ fontSize: 16 }}>⚠️ Expiring Warranties</h3>
            <button className="btn-ghost btn-sm" onClick={() => navigate('/assets')}>View all</button>
          </div>
          {warranties.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>No warranties expiring soon</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {warranties.map(w => (
                <div key={w.id} onClick={() => navigate(`/assets/${w.id}`)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, background: 'var(--color-bg-elevated)', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--color-bg-elevated)'}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{w.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{w.assetTag}</div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-accent-amber)', fontWeight: 600 }}>{w.warrantyExpiry}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Returns */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div className="section-header">
            <h3 className="section-title" style={{ fontSize: 16 }}>📦 Upcoming Returns</h3>
            <button className="btn-ghost btn-sm" onClick={() => navigate('/allocations')}>View all</button>
          </div>
          {upcomingReturns.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>No upcoming returns in next 14 days</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcomingReturns.map(r => (
                <div key={r.id} onClick={() => navigate('/allocations')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, background: 'var(--color-bg-elevated)', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--color-bg-elevated)'}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{r.assetName}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{r.assetTag}</div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-accent-blue)', fontWeight: 600 }}>{r.expectedReturnDate}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
