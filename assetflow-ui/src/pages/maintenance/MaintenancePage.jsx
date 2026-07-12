import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { maintenanceApi, assetApi } from '../../api/services'
import { useAuth } from '../../context/AuthContext'
import { Plus, Wrench, X, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

const PRIORITY_COLORS = { LOW: 'low', MEDIUM: 'medium', HIGH: 'high', CRITICAL: 'critical' }
const STATUS_COLORS = { PENDING: 'pending', APPROVED: 'approved', ASSIGNED: 'medium', IN_PROGRESS: 'allocated', RESOLVED: 'resolved', CANCELLED: 'retired' }

function CreateModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ assetId: '', title: '', description: '', priority: 'MEDIUM', scheduledDate: '', estimatedCost: '' })
  const { data: assetsData } = useQuery({ queryKey: ['assets', 'maint'], queryFn: () => assetApi.getAll({ size: 100 }) })
  const mutation = useMutation({
    mutationFn: maintenanceApi.create,
    onSuccess: () => { toast.success('Maintenance request submitted'); onSuccess(); onClose() },
    onError: e => toast.error(e?.message || 'Failed'),
  })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, fontSize: 18 }}>New Maintenance Request</h3>
          <button onClick={onClose} className="btn-ghost btn-sm" style={{ padding: '6px 8px' }}><X size={16} /></button>
        </div>
        <div className="form-group">
          <label className="form-label">Asset *</label>
          <select className="input" value={form.assetId} onChange={e => setForm(f => ({ ...f, assetId: e.target.value }))}>
            <option value="">Select asset</option>
            {(assetsData?.data?.content || []).map(a => <option key={a.id} value={a.id}>{a.name} — {a.assetTag}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Title *</label>
          <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Brief issue description" />
        </div>
        <div className="form-group">
          <label className="form-label">Priority</label>
          <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
            {['LOW','MEDIUM','HIGH','CRITICAL'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Detailed description..." />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group"><label className="form-label">Scheduled Date</label><input type="date" className="input" value={form.scheduledDate} onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Estimated Cost ($)</label><input type="number" className="input" value={form.estimatedCost} onChange={e => setForm(f => ({ ...f, estimatedCost: e.target.value }))} placeholder="0.00" /></div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!form.assetId || !form.title || mutation.isPending}
            onClick={() => mutation.mutate({ assetId: Number(form.assetId), title: form.title, description: form.description, priority: form.priority, scheduledDate: form.scheduledDate || undefined, estimatedCost: form.estimatedCost ? Number(form.estimatedCost) : undefined })}>
            {mutation.isPending ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MaintenancePage() {
  const { isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState({ status: '', priority: '', page: 0, size: 20 })
  const [showCreate, setShowCreate] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['maintenance', filters],
    queryFn: () => maintenanceApi.getAll({ ...filters, status: filters.status || undefined, priority: filters.priority || undefined }),
    keepPreviousData: true,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => maintenanceApi.updateStatus(id, { status }),
    onSuccess: () => { queryClient.invalidateQueries(['maintenance']); toast.success('Status updated') },
    onError: e => toast.error(e?.message || 'Failed'),
  })

  const requests = data?.data?.content || []
  const totalPages = data?.data?.totalPages || 0

  return (
    <div className="page-header page-body" style={{ paddingTop: 32 }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">Maintenance</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 2 }}>{data?.data?.totalElements || 0} requests</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select className="input" style={{ width: 160 }} value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 0 }))}>
            <option value="">All Statuses</option>
            {['PENDING','APPROVED','ASSIGNED','IN_PROGRESS','RESOLVED','CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input" style={{ width: 130 }} value={filters.priority}
            onChange={e => setFilters(f => ({ ...f, priority: e.target.value, page: 0 }))}>
            <option value="">All Priorities</option>
            {['LOW','MEDIUM','HIGH','CRITICAL'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <button className="btn-primary btn-sm" onClick={() => setShowCreate(true)}>
            <Plus size={14} /> New Request
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 32 }}>{[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 48, marginBottom: 8 }} />)}</div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 32px' }}>
            <Wrench size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ marginBottom: 8, color: 'var(--color-text-secondary)' }}>No maintenance requests</h3>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Requested By</th>
                  <th>Scheduled</th>
                  <th>Est. Cost</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary)' }}>{r.assetName}</div>
                      <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--color-accent-violet-light)' }}>{r.assetTag}</div>
                    </td>
                    <td style={{ fontSize: 13, maxWidth: 200 }}>
                      <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{r.title}</div>
                      {r.description && <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }} className="truncate-2">{r.description}</div>}
                    </td>
                    <td><span className={`badge badge-${PRIORITY_COLORS[r.priority]}`}>{r.priority}</span></td>
                    <td><span className={`badge badge-${STATUS_COLORS[r.status] || 'pending'}`}>{r.status}</span></td>
                    <td style={{ fontSize: 12 }}>{r.requestedByName}</td>
                    <td style={{ fontSize: 12 }}>{r.scheduledDate || '—'}</td>
                    <td style={{ fontSize: 12 }}>{r.estimatedCost ? `$${r.estimatedCost.toLocaleString()}` : '—'}</td>
                    {isAdmin && (
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {r.status === 'PENDING' && (
                            <button className="btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => updateMutation.mutate({ id: r.id, status: 'APPROVED' })}>Approve</button>
                          )}
                          {r.status === 'APPROVED' && (
                            <button className="btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => updateMutation.mutate({ id: r.id, status: 'IN_PROGRESS' })}>Start</button>
                          )}
                          {r.status === 'IN_PROGRESS' && (
                            <button className="btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => updateMutation.mutate({ id: r.id, status: 'RESOLVED' })}>Resolve</button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: 16, borderTop: '1px solid var(--color-border-subtle)' }}>
                <button className="btn-ghost btn-sm" disabled={filters.page === 0} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>Previous</button>
                <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Page {filters.page + 1} of {totalPages}</span>
                <button className="btn-ghost btn-sm" disabled={filters.page >= totalPages - 1} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Next</button>
              </div>
            )}
          </>
        )}
      </div>

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onSuccess={() => queryClient.invalidateQueries(['maintenance'])} />}
    </div>
  )
}
