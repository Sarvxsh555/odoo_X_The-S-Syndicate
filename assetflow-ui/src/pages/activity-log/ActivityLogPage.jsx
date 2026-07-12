import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { activityLogApi, employeeApi } from '../../api/services'
import {
  History, Search, Filter, Calendar, ChevronDown, ChevronUp,
  User, Globe, Cpu, RotateCcw, ArrowRight, Eye
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const ACTION_COLORS = {
  CREATE: 'var(--color-accent-emerald, #10b981)',
  LOGIN: 'var(--color-accent-emerald, #10b981)',
  UPDATE: 'var(--color-accent-blue, #3b82f6)',
  DELETE: 'var(--color-accent-rose, #f43f5e)',
  LOGOUT: 'var(--color-text-muted, #6b7280)',
}

const ENTITY_TYPES = [
  'Asset',
  'Allocation',
  'Booking',
  'MaintenanceRequest',
  'AuditCycle',
  'ApprovalRequest',
  'Department',
  'EmployeeProfile',
  'User'
]

export default function ActivityLogPage() {
  const [page, setPage] = useState(0)
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedEntity, setSelectedEntity] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [expandedLog, setExpandedLog] = useState(null)

  // Fetch employees to populate the user filter dropdown
  const { data: employeesData } = useQuery({
    queryKey: ['employees-list-logs'],
    queryFn: () => employeeApi.getAll({ page: 0, size: 100 }),
  })

  const employees = employeesData?.data?.content || []

  // Fetch logs with API filters
  const { data: logsData, isLoading, refetch } = useQuery({
    queryKey: ['activity-logs', { page, selectedUser, selectedEntity }],
    queryFn: () => {
      const params = { page, size: 20 }
      if (selectedUser) params.userId = selectedUser
      if (selectedEntity) params.entityType = selectedEntity
      return activityLogApi.getAll(params)
    },
    keepPreviousData: true,
  })

  const logs = logsData?.data?.content || []
  const totalPages = logsData?.data?.totalPages || 0

  // Filter logs by date range on client-side
  const filteredLogs = logs.filter(log => {
    if (!log.createdAt) return true
    const logDate = new Date(log.createdAt)
    
    // Normalize log date to date string (YYYY-MM-DD)
    const logDateStr = logDate.toISOString().split('T')[0]
    
    if (startDate && logDateStr < startDate) return false
    if (endDate && logDateStr > endDate) return false
    return true
  })

  const handleResetFilters = () => {
    setSelectedUser('')
    setSelectedEntity('')
    setStartDate('')
    setEndDate('')
    setPage(0)
  }

  const formatTimestamp = (isoString) => {
    if (!isoString) return '—'
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  // Parse User ID from Employee Code (EMP-XXXX -> XXXX)
  const getUserIdFromEmp = (emp) => {
    if (!emp.empCode) return null
    const parts = emp.empCode.split('-')
    if (parts.length < 2) return null
    const parsed = parseInt(parts[1], 10)
    return isNaN(parsed) ? null : parsed
  }

  const toggleExpandLog = (id) => {
    setExpandedLog(expandedLog === id ? null : id)
  }

  return (
    <div className="page-header page-body" style={{ paddingTop: 32 }}>
      {/* Title Header */}
      <div className="section-header" style={{ marginBottom: 24 }}>
        <div>
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <History size={24} className="text-violet" />
            Activity Log
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 2 }}>
            Real-time audit trail of all system transactions and administrative events
          </p>
        </div>
      </div>

      {/* Filters Card */}
      <div className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Filter size={16} color="var(--color-text-secondary)" />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)' }}>Filter Audit Trail</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          alignItems: 'end'
        }}>
          {/* User Filter */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6 }}>
              Performed By (User)
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedUser}
                onChange={(e) => { setSelectedUser(e.target.value); setPage(0); }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg-elevated)',
                  color: 'var(--color-text-primary)',
                  fontSize: 13,
                  outline: 'none',
                  appearance: 'none',
                }}
              >
                <option value="">All Users</option>
                {employees.map(emp => {
                  const uId = getUserIdFromEmp(emp);
                  if (!uId) return null;
                  return (
                    <option key={emp.id} value={uId}>
                      {emp.fullName} ({emp.email})
                    </option>
                  )
                })}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: 13, pointerEvents: 'none', color: 'var(--color-text-muted)' }} />
            </div>
          </div>

          {/* Entity Type Filter */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6 }}>
              Entity Type
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedEntity}
                onChange={(e) => { setSelectedEntity(e.target.value); setPage(0); }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg-elevated)',
                  color: 'var(--color-text-primary)',
                  fontSize: 13,
                  outline: 'none',
                  appearance: 'none',
                }}
              >
                <option value="">All Entities</option>
                {ENTITY_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: 13, pointerEvents: 'none', color: 'var(--color-text-muted)' }} />
            </div>
          </div>

          {/* Start Date Filter */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6 }}>
              Start Date
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg-elevated)',
                  color: 'var(--color-text-primary)',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* End Date Filter */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6 }}>
              End Date
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg-elevated)',
                  color: 'var(--color-text-primary)',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Reset Filters */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleResetFilters}
              className="btn-secondary"
              style={{
                width: '100%',
                padding: '9px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table Card */}
      <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
        {isLoading ? (
          <div style={{ padding: 32 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 52, marginBottom: 10, borderRadius: 8 }} />
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 32px' }}>
            <History size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ color: 'var(--color-text-secondary)', marginBottom: 8, fontWeight: 600 }}>No activities found</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13, maxWidth: 400, margin: '0 auto' }}>
              There are no activity logs matching your selected filters in the system.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Timestamp</th>
                  <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Action</th>
                  <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Entity</th>
                  <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>User</th>
                  <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Description</th>
                  <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => {
                  const isExpanded = expandedLog === log.id;
                  const borderLeftColor = ACTION_COLORS[log.action] || 'var(--color-border)';
                  
                  return (
                    <>
                      <tr
                        key={log.id}
                        style={{
                          borderBottom: '1px solid var(--color-border-subtle)',
                          cursor: 'pointer',
                          background: isExpanded ? 'var(--color-bg-hover)' : 'transparent',
                          transition: 'background 0.2s',
                          borderLeft: `3px solid ${borderLeftColor}`
                        }}
                        onClick={() => toggleExpandLog(log.id)}
                        onMouseEnter={e => !isExpanded && (e.currentTarget.style.background = 'var(--color-bg-hover)')}
                        onMouseLeave={e => !isExpanded && (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '16px 20px', fontSize: 12.5, whiteSpace: 'nowrap', color: 'var(--color-text-primary)' }}>
                          {formatTimestamp(log.createdAt)}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.02em',
                            background: `${ACTION_COLORS[log.action] || 'var(--color-text-muted)'}15`,
                            color: ACTION_COLORS[log.action] || 'var(--color-text-muted)',
                            border: `1px solid ${ACTION_COLORS[log.action] || 'var(--color-text-muted)'}25`
                          }}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 600 }}>
                          {log.entityType || '—'}
                          {log.entityId && (
                            <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 400, marginLeft: 6 }}>
                              #{log.entityId}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <User size={13} color="var(--color-text-muted)" />
                            <span>{log.userEmail}</span>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--color-text-primary)' }}>
                          {log.description}
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <button
                            className="btn-ghost btn-sm"
                            style={{
                              padding: '5px 8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <Eye size={12} />
                            {isExpanded ? 'Hide' : 'View'}
                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                        </td>
                      </tr>

                      {/* Collapsible Detail Section */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <tr style={{ background: 'var(--color-bg-hover)' }}>
                            <td colSpan={6} style={{ padding: '0 24px 20px 24px' }}>
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                style={{ overflow: 'hidden' }}
                              >
                                <div style={{
                                  border: '1px solid var(--color-border)',
                                  borderRadius: 10,
                                  background: 'var(--color-bg-elevated)',
                                  padding: 16,
                                  marginTop: 4,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 12
                                }}>
                                  {/* Network Details */}
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, paddingBottom: 12, borderBottom: '1px solid var(--color-border-subtle)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-text-muted)' }}>
                                      <Globe size={13} />
                                      <strong>IP Address:</strong>
                                      <span style={{ fontFamily: 'monospace', color: 'var(--color-text-primary)' }}>{log.ipAddress || 'Unknown'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-text-muted)' }}>
                                      <Cpu size={13} />
                                      <strong>User Agent:</strong>
                                      <span style={{ color: 'var(--color-text-primary)', maxWidth: 400, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={log.userAgent}>
                                        {log.userAgent || 'Unknown'}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Before/After Differences */}
                                  {(log.oldValue || log.newValue) && (
                                    <div>
                                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                                        State Modifications
                                      </div>
                                      <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: log.oldValue && log.newValue ? '1fr 1fr' : '1fr',
                                        gap: 16
                                      }}>
                                        {log.oldValue && (
                                          <div>
                                            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-accent-rose)', marginBottom: 4, textTransform: 'uppercase' }}>
                                              Previous State
                                            </div>
                                            <pre style={{
                                              padding: 12,
                                              background: 'rgba(244,63,94,0.05)',
                                              border: '1px solid rgba(244,63,94,0.15)',
                                              borderRadius: 8,
                                              fontSize: 11.5,
                                              fontFamily: 'SFMono-Regular, Consolas, Monaco, monospace',
                                              color: 'var(--color-text-primary)',
                                              whiteSpace: 'pre-wrap',
                                              margin: 0,
                                              maxHeight: 180,
                                              overflowY: 'auto'
                                            }}>
                                              {log.oldValue}
                                            </pre>
                                          </div>
                                        )}

                                        {log.newValue && (
                                          <div>
                                            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-accent-emerald)', marginBottom: 4, textTransform: 'uppercase' }}>
                                              New State
                                            </div>
                                            <pre style={{
                                              padding: 12,
                                              background: 'rgba(16,185,129,0.05)',
                                              border: '1px solid rgba(16,185,129,0.15)',
                                              borderRadius: 8,
                                              fontSize: 11.5,
                                              fontFamily: 'SFMono-Regular, Consolas, Monaco, monospace',
                                              color: 'var(--color-text-primary)',
                                              whiteSpace: 'pre-wrap',
                                              margin: 0,
                                              maxHeight: 180,
                                              overflowY: 'auto'
                                            }}>
                                              {log.newValue}
                                            </pre>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderTop: '1px solid var(--color-border)',
            background: 'var(--color-bg-elevated)'
          }}>
            <button
              disabled={page === 0}
              onClick={() => { setPage(p => Math.max(0, p - 1)); setExpandedLog(null); }}
              className="btn-ghost btn-sm"
              style={{ padding: '6px 12px', fontSize: 13, cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.5 : 1 }}
            >
              Previous
            </button>
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Page {page + 1} of {totalPages}
            </span>
            <button
              disabled={page === totalPages - 1}
              onClick={() => { setPage(p => Math.min(totalPages - 1, p + 1)); setExpandedLog(null); }}
              className="btn-ghost btn-sm"
              style={{ padding: '6px 12px', fontSize: 13, cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer', opacity: page === totalPages - 1 ? 0.5 : 1 }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
