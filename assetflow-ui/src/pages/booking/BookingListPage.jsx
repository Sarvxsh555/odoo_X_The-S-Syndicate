import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingApi } from '../../api/services'
import { useAuth } from '../../context/AuthContext'
import { Plus, Calendar, X, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const STATUS_COLORS = { UPCOMING: 'allocated', IN_PROGRESS: 'medium', COMPLETED: 'available', CANCELLED: 'retired' }

function CreateBookingModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ resourceId: '', title: '', description: '', startDatetime: '', endDatetime: '', notes: '' })
  const { data: resourcesData } = useQuery({ queryKey: ['resources'], queryFn: () => bookingApi.getResources() })
  const mutation = useMutation({
    mutationFn: bookingApi.create,
    onSuccess: () => { toast.success('Booking created!'); onSuccess(); onClose() },
    onError: e => toast.error(e?.message || 'Booking failed — slot may be taken'),
  })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, fontSize: 18 }}>New Booking</h3>
          <button onClick={onClose} className="btn-ghost btn-sm" style={{ padding: '6px 8px' }}><X size={16} /></button>
        </div>
        <div className="form-group">
          <label className="form-label">Resource *</label>
          <select className="input" value={form.resourceId} onChange={e => setForm(f => ({ ...f, resourceId: e.target.value }))}>
            <option value="">Select a resource</option>
            {(resourcesData?.data || []).map(r => <option key={r.id} value={r.id}>{r.name} ({r.type})</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Title *</label>
          <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Meeting / Event name" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group"><label className="form-label">Start *</label><input type="datetime-local" className="input" value={form.startDatetime} onChange={e => setForm(f => ({ ...f, startDatetime: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">End *</label><input type="datetime-local" className="input" value={form.endDatetime} onChange={e => setForm(f => ({ ...f, endDatetime: e.target.value }))} /></div>
        </div>
        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="input" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes..." />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!form.resourceId || !form.title || !form.startDatetime || !form.endDatetime || mutation.isPending}
            onClick={() => mutation.mutate({ resourceId: Number(form.resourceId), title: form.title, description: form.description, startDatetime: new Date(form.startDatetime).toISOString(), endDatetime: new Date(form.endDatetime).toISOString(), notes: form.notes })}>
            {mutation.isPending ? 'Booking...' : 'Book'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BookingListPage() {
  const { isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState({ status: '', page: 0, size: 20 })
  const [showCreate, setShowCreate] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['bookings', filters],
    queryFn: () => bookingApi.getAll({ ...filters, status: filters.status || undefined }),
    keepPreviousData: true,
  })

  const cancelMutation = useMutation({
    mutationFn: (id) => bookingApi.cancel(id, 'Cancelled by admin'),
    onSuccess: () => { queryClient.invalidateQueries(['bookings']); toast.success('Booking cancelled') },
    onError: e => toast.error(e?.message || 'Failed'),
  })

  const bookings = data?.data?.content || []
  const totalPages = data?.data?.totalPages || 0

  return (
    <div className="page-header page-body" style={{ paddingTop: 32 }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">Bookings</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 2 }}>{data?.data?.totalElements || 0} bookings</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select className="input" style={{ width: 160 }} value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 0 }))}>
            <option value="">All Statuses</option>
            {['UPCOMING','IN_PROGRESS','COMPLETED','CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn-primary btn-sm" onClick={() => setShowCreate(true)}>
            <Plus size={14} /> New Booking
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 32 }}>{[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 48, marginBottom: 8 }} />)}</div>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 32px' }}>
            <Calendar size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ color: 'var(--color-text-secondary)' }}>No bookings yet</h3>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Title</th>
                  <th>Booked By</th>
                  <th>Status</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary)' }}>{b.resourceName}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{b.resourceType}</div>
                    </td>
                    <td style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', maxWidth: 200 }}>{b.title}</td>
                    <td style={{ fontSize: 12 }}>{b.bookedByName}</td>
                    <td><span className={`badge badge-${STATUS_COLORS[b.status] || 'pending'}`}>{b.status}</span></td>
                    <td style={{ fontSize: 12 }}>{b.startDatetime ? format(new Date(b.startDatetime), 'MMM d, HH:mm') : '—'}</td>
                    <td style={{ fontSize: 12 }}>{b.endDatetime ? format(new Date(b.endDatetime), 'MMM d, HH:mm') : '—'}</td>
                    <td>
                      {b.status === 'UPCOMING' && (
                        <button className="btn-danger btn-sm" style={{ fontSize: 11 }} onClick={() => cancelMutation.mutate(b.id)}>Cancel</button>
                      )}
                    </td>
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

      {showCreate && <CreateBookingModal onClose={() => setShowCreate(false)} onSuccess={() => queryClient.invalidateQueries(['bookings'])} />}
    </div>
  )
}
