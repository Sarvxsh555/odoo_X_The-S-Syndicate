import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { allocationApi, assetApi, employeeApi } from '../../api/services'
import { useAuth } from '../../context/AuthContext'
import { Plus, Search, ArrowLeftRight, RotateCcw, Share2, X, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_COLORS = { ACTIVE: 'allocated', RETURNED: 'available', TRANSFERRED: 'reserved', OVERDUE: 'lost' }

function AllocateModal({ onClose, onSuccess }) {
  const [assetId, setAssetId] = useState('')
  const [userId, setUserId] = useState('')
  const [expectedReturn, setExpectedReturn] = useState('')
  const [notes, setNotes] = useState('')
  const { data: assetsData } = useQuery({ queryKey: ['assets', { status: 'AVAILABLE' }], queryFn: () => assetApi.getAll({ status: 'AVAILABLE', size: 100 }) })
  const { data: employeesData } = useQuery({ queryKey: ['employees', 'all'], queryFn: () => employeeApi.getAll({ size: 100 }) })
  const mutation = useMutation({
    mutationFn: allocationApi.allocate,
    onSuccess: () => { toast.success('Asset allocated!'); onSuccess(); onClose() },
    onError: e => toast.error(e?.message || 'Allocation failed'),
  })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, fontSize: 18 }}>Allocate Asset</h3>
          <button onClick={onClose} className="btn-ghost btn-sm" style={{ padding: '6px 8px' }}><X size={16} /></button>
        </div>
        <div className="form-group">
          <label className="form-label">Asset (Available Only) *</label>
          <select className="input" value={assetId} onChange={e => setAssetId(e.target.value)}>
            <option value="">Select asset</option>
            {(assetsData?.data?.content || []).map(a => <option key={a.id} value={a.id}>{a.name} — {a.assetTag}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Employee *</label>
          <select className="input" value={userId} onChange={e => setUserId(e.target.value)}>
            <option value="">Select employee</option>
            {(employeesData?.data?.content || []).map(e => <option key={e.id} value={e.id}>{e.fullName} — {e.email}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Expected Return Date</label>
          <input type="date" className="input" value={expectedReturn} onChange={e => setExpectedReturn(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="input" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..." />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!assetId || !userId || mutation.isPending}
            onClick={() => mutation.mutate({ assetId: Number(assetId), allocatedToUserId: Number(userId), expectedReturnDate: expectedReturn || undefined, notes })}>
            <ArrowLeftRight size={14} /> {mutation.isPending ? 'Allocating...' : 'Allocate'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ReturnModal({ allocation, onClose, onSuccess }) {
  const [condition, setCondition] = useState('GOOD')
  const [notes, setNotes] = useState('')
  const mutation = useMutation({
    mutationFn: ({ id, data }) => allocationApi.return(id, data),
    onSuccess: () => { toast.success('Asset returned!'); onSuccess(); onClose() },
    onError: e => toast.error(e?.message || 'Return failed'),
  })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, fontSize: 18 }}>Return Asset</h3>
          <button onClick={onClose} className="btn-ghost btn-sm" style={{ padding: '6px 8px' }}><X size={16} /></button>
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 20 }}>
          Returning: <strong style={{ color: 'var(--color-text-primary)' }}>{allocation.assetName}</strong> from {allocation.allocatedToName}
        </p>
        <div className="form-group">
          <label className="form-label">Condition at Return</label>
          <select className="input" value={condition} onChange={e => setCondition(e.target.value)}>
            {['EXCELLENT','GOOD','FAIR','POOR','DAMAGED'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="input" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Return notes..." />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={mutation.isPending}
            onClick={() => mutation.mutate({ id: allocation.id, data: { conditionAtReturn: condition, notes } })}>
            <RotateCcw size={14} /> {mutation.isPending ? 'Returning...' : 'Confirm Return'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AllocationListPage() {
  const { isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState({ status: '', page: 0, size: 20 })
  const [showAllocate, setShowAllocate] = useState(false)
  const [returnTarget, setReturnTarget] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['allocations', filters],
    queryFn: () => allocationApi.getAll({ ...filters, status: filters.status || undefined }),
    keepPreviousData: true,
  })

  const allocations = data?.data?.content || []
  const totalPages = data?.data?.totalPages || 0

  const onMutationSuccess = () => queryClient.invalidateQueries(['allocations'])

  return (
    <div className="page-header page-body" style={{ paddingTop: 32 }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">Allocations</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 2 }}>{data?.data?.totalElements || 0} records</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select className="input" style={{ width: 160 }} value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 0 }))}>
            <option value="">All Statuses</option>
            {['ACTIVE','RETURNED','TRANSFERRED','OVERDUE'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {isAdmin && (
            <button className="btn-primary btn-sm" onClick={() => setShowAllocate(true)}>
              <Plus size={14} /> Allocate Asset
            </button>
          )}
        </div>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 32 }}>{[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 48, marginBottom: 8 }} />)}</div>
        ) : allocations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 32px' }}>
            <ArrowLeftRight size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ marginBottom: 8, color: 'var(--color-text-secondary)' }}>No allocations found</h3>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Allocated To</th>
                  <th>Allocated By</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Allocation Date</th>
                  <th>Expected Return</th>
                  {isAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {allocations.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary)' }}>{a.assetName}</div>
                      <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--color-accent-violet-light)' }}>{a.assetTag}</div>
                    </td>
                    <td><span style={{ fontSize: 13 }}>{a.allocatedToName}</span></td>
                    <td><span style={{ fontSize: 13 }}>{a.allocatedByName}</span></td>
                    <td><span style={{ fontSize: 12 }}>{a.departmentName || '—'}</span></td>
                    <td><span className={`badge badge-${STATUS_COLORS[a.status] || 'pending'}`}>{a.status}</span></td>
                    <td style={{ fontSize: 12 }}>{a.allocationDate ? new Date(a.allocationDate).toLocaleDateString() : '—'}</td>
                    <td style={{ fontSize: 12 }}>{a.expectedReturnDate || '—'}</td>
                    {isAdmin && (
                      <td>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          {a.status === 'ACTIVE' && (
                            <button className="btn-ghost btn-sm" onClick={() => setReturnTarget(a)}>
                              <RotateCcw size={13} /> Return
                            </button>
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

      {showAllocate && <AllocateModal onClose={() => setShowAllocate(false)} onSuccess={onMutationSuccess} />}
      {returnTarget && <ReturnModal allocation={returnTarget} onClose={() => setReturnTarget(null)} onSuccess={onMutationSuccess} />}
    </div>
  )
}
