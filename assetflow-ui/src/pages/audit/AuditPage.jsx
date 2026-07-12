import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { auditApi } from '../../api/services'
import { ClipboardCheck, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_COLORS = { PLANNED: 'pending', IN_PROGRESS: 'allocated', COMPLETED: 'resolved', CANCELLED: 'retired' }

export default function AuditPage() {
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['audits', { page }],
    queryFn: () => auditApi.getAll({ page, size: 20 }),
    keepPreviousData: true,
    onError: () => {}, // endpoint may not be available yet
  })

  const audits = data?.data?.content || []
  const totalPages = data?.data?.totalPages || 0

  return (
    <div className="page-header page-body" style={{ paddingTop: 32 }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">Audit Center</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 2 }}>Asset verification cycles</p>
        </div>
        <button className="btn-primary btn-sm" onClick={() => toast('Audit cycle creation — coming soon!')}>
          <Plus size={14} /> New Audit Cycle
        </button>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 32 }}>{[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 48, marginBottom: 8 }} />)}</div>
        ) : audits.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 32px' }}>
            <ClipboardCheck size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ color: 'var(--color-text-secondary)', marginBottom: 8 }}>No audit cycles yet</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Create your first audit cycle to start verifying assets.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {audits.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: 13 }}>{a.name}</td>
                  <td><span className={`badge badge-${STATUS_COLORS[a.status] || 'pending'}`}>{a.status}</span></td>
                  <td style={{ fontSize: 12 }}>{a.startDate}</td>
                  <td style={{ fontSize: 12 }}>{a.endDate || '—'}</td>
                  <td style={{ fontSize: 12 }}>{a.createdByName}</td>
                  <td><button className="btn-ghost btn-sm">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
