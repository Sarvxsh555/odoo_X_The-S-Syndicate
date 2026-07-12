import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { assetApi, categoryApi, departmentApi } from '../../api/services'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Package, Plus, Search, Filter, Eye, Pencil, Trash2, QrCode, Tag, X } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  AVAILABLE: 'available', ALLOCATED: 'allocated', MAINTENANCE: 'maintenance',
  LOST: 'lost', RETIRED: 'retired', DISPOSED: 'disposed', RESERVED: 'reserved',
}

const CONDITION_COLORS = {
  EXCELLENT: 'resolved', GOOD: 'available', FAIR: 'medium',
  POOR: 'high', DAMAGED: 'critical',
}

export default function AssetListPage() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const queryClient = useQueryClient()

  const [filters, setFilters] = useState({ search: '', status: '', categoryId: '', departmentId: '', page: 0, size: 20 })
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['assets', filters],
    queryFn: () => assetApi.getAll({ ...filters, search: filters.search || undefined }),
    keepPreviousData: true,
  })

  const { data: categoriesData } = useQuery({ queryKey: ['categories', 'dropdown'], queryFn: () => categoryApi.getAll({}) })
  const { data: deptsData } = useQuery({ queryKey: ['departments', 'dropdown'], queryFn: () => departmentApi.getAll({}) })

  const deleteMutation = useMutation({
    mutationFn: assetApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['assets'])
      toast.success('Asset deleted')
    },
    onError: (e) => toast.error(e?.message || 'Delete failed'),
  })

  const assets = data?.data?.content || []
  const totalPages = data?.data?.totalPages || 0
  const categories = categoriesData?.data?.content || []
  const departments = deptsData?.data?.content || []

  const handleDelete = (id, name) => {
    if (confirm(`Delete asset "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="page-header page-body" style={{ paddingTop: 32 }}>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: 24 }}>
        <div>
          <h2 className="section-title">Asset Directory</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 2 }}>
            {data?.data?.totalElements || 0} assets registered
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn-secondary btn-sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={14} /> Filters
            {(filters.status || filters.categoryId || filters.departmentId) && (
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent-violet)', display: 'inline-block', marginLeft: -2 }} />
            )}
          </button>
          {isAdmin && (
            <button className="btn-primary btn-sm" onClick={() => navigate('/assets/register')}>
              <Plus size={14} /> Register Asset
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <div className="search-wrapper" style={{ flex: 1, maxWidth: 400 }}>
          <Search size={14} />
          <input
            className="search-input"
            placeholder="Search by name, tag, serial, model..."
            value={filters.search}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value, page: 0 }))}
          />
          {filters.search && (
            <button onClick={() => setFilters(f => ({ ...f, search: '' }))} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex' }}>
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Row */}
      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
          style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <select className="input" style={{ width: 160 }} value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 0 }))}>
            <option value="">All Statuses</option>
            {['AVAILABLE','ALLOCATED','MAINTENANCE','RESERVED','LOST','RETIRED','DISPOSED'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select className="input" style={{ width: 180 }} value={filters.categoryId}
            onChange={e => setFilters(f => ({ ...f, categoryId: e.target.value, page: 0 }))}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="input" style={{ width: 180 }} value={filters.departmentId}
            onChange={e => setFilters(f => ({ ...f, departmentId: e.target.value, page: 0 }))}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <button className="btn-ghost btn-sm" onClick={() => setFilters({ search: '', status: '', categoryId: '', departmentId: '', page: 0, size: 20 })}>
            <X size={12} /> Clear
          </button>
        </motion.div>
      )}

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 32 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 48, marginBottom: 8 }} />
            ))}
          </div>
        ) : assets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 32px' }}>
            <Package size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ marginBottom: 8, color: 'var(--color-text-secondary)' }}>No assets found</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
              {isAdmin ? 'Register your first asset to get started.' : 'No assets match your search.'}
            </p>
            {isAdmin && (
              <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/assets/register')}>
                <Plus size={14} /> Register Asset
              </button>
            )}
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Tag / Serial</th>
                  <th>Category</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Condition</th>
                  <th>Purchase Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map(asset => (
                  <tr key={asset.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {asset.primaryImageUrl ? (
                          <img src={asset.primaryImageUrl} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--color-border)' }} />
                        ) : (
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)' }}>
                            <Package size={16} color="var(--color-text-muted)" />
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: 13 }}>{asset.name}</div>
                          {asset.model && <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{asset.model}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontFamily: 'monospace', color: 'var(--color-accent-violet-light)' }}>
                        <Tag size={11} /> {asset.assetTag}
                      </div>
                      {asset.serialNumber && <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{asset.serialNumber}</div>}
                    </td>
                    <td><span style={{ fontSize: 12 }}>{asset.categoryName}</span></td>
                    <td><span style={{ fontSize: 12 }}>{asset.departmentName || '—'}</span></td>
                    <td><span className={`badge badge-${asset.status?.toLowerCase()}`}>{asset.status}</span></td>
                    <td><span className={`badge badge-${CONDITION_COLORS[asset.condition] || 'pending'}`} style={{ fontSize: 10 }}>{asset.condition}</span></td>
                    <td style={{ fontSize: 12 }}>{asset.purchaseDate || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button className="btn-ghost btn-sm" style={{ padding: '5px 8px' }} onClick={() => navigate(`/assets/${asset.id}`)}>
                          <Eye size={13} />
                        </button>
                        {isAdmin && (
                          <>
                            <button className="btn-ghost btn-sm" style={{ padding: '5px 8px' }} onClick={() => navigate(`/assets/${asset.id}`)}>
                              <Pencil size={13} />
                            </button>
                            <button className="btn-danger btn-sm" style={{ padding: '5px 8px' }} onClick={() => handleDelete(asset.id, asset.name)}>
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: 16, borderTop: '1px solid var(--color-border-subtle)' }}>
                <button className="btn-ghost btn-sm" disabled={filters.page === 0} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>Previous</button>
                <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Page {filters.page + 1} of {totalPages}</span>
                <button className="btn-ghost btn-sm" disabled={filters.page >= totalPages - 1} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
