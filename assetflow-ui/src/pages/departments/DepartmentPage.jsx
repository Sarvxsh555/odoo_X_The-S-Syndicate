import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { departmentApi } from '../../api/services'
import { useAuth } from '../../context/AuthContext'
import { Plus, Building2, X, Trash2, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

function CreateDeptModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', code: '', description: '', parentId: '' })
  const { data: deptsData } = useQuery({ queryKey: ['departments', 'hierarchy'], queryFn: departmentApi.getHierarchy })
  const mutation = useMutation({
    mutationFn: departmentApi.create,
    onSuccess: () => { toast.success('Department created'); onSuccess(); onClose() },
    onError: e => toast.error(e?.message || 'Failed'),
  })

  const allDepts = deptsData?.data || []

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18 }}>Create Department</h3>
          <button onClick={onClose} className="btn-ghost btn-sm" style={{ padding: '6px 8px' }}><X size={16} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group"><label className="form-label">Name *</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Engineering" /></div>
          <div className="form-group"><label className="form-label">Code *</label><input className="input" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="ENG" /></div>
        </div>
        <div className="form-group">
          <label className="form-label">Parent Department</label>
          <select className="input" value={form.parentId} onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))}>
            <option value="">Root department (none)</option>
            {allDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Description</label><textarea className="input" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional..." /></div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!form.name || !form.code || mutation.isPending}
            onClick={() => mutation.mutate({ ...form, parentId: form.parentId ? Number(form.parentId) : undefined, active: true })}>
            {mutation.isPending ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DeptTreeItem({ dept, depth = 0 }) {
  const { isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [expanded, setExpanded] = useState(true)

  const deleteMutation = useMutation({
    mutationFn: departmentApi.delete,
    onSuccess: () => { queryClient.invalidateQueries(['departments']); toast.success('Department deleted') },
    onError: e => toast.error(e?.message || 'Cannot delete — has active employees'),
  })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', paddingLeft: 16 + depth * 24, borderBottom: '1px solid var(--color-border-subtle)', gap: 8, transition: 'background 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-elevated)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        {dept.children?.length > 0 && (
          <button onClick={() => setExpanded(!expanded)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 0, display: 'flex' }}>
            <ChevronRight size={14} style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
        )}
        {dept.children?.length === 0 && <div style={{ width: 14 }} />}

        <Building2 size={16} color="var(--color-accent-violet-light)" />

        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary)' }}>{dept.name}</span>
          <span style={{ marginLeft: 8, fontFamily: 'monospace', fontSize: 11, color: 'var(--color-text-muted)' }}>{dept.code}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{dept.employeeCount} employees</span>
          {dept.headName && <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Head: {dept.headName}</span>}
          <span className={`badge badge-${dept.active ? 'available' : 'retired'}`} style={{ fontSize: 10 }}>{dept.active ? 'Active' : 'Inactive'}</span>
          {isAdmin && (
            <button className="btn-danger btn-sm" style={{ padding: '4px 8px', opacity: 0 }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onClick={() => { if (confirm(`Delete ${dept.name}?`)) deleteMutation.mutate(dept.id) }}
              id={`dept-delete-${dept.id}`}
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {expanded && dept.children?.map(child => (
        <DeptTreeItem key={child.id} dept={child} depth={depth + 1} />
      ))}
    </div>
  )
}

export default function DepartmentPage() {
  const { isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)

  const { data: hierarchyData, isLoading } = useQuery({
    queryKey: ['departments', 'hierarchy'],
    queryFn: departmentApi.getHierarchy,
  })

  const hierarchy = hierarchyData?.data || []

  return (
    <div className="page-header page-body" style={{ paddingTop: 32 }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">Departments</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 2 }}>Organization hierarchy</p>
        </div>
        {isAdmin && (
          <button className="btn-primary btn-sm" onClick={() => setShowCreate(true)}>
            <Plus size={14} /> Add Department
          </button>
        )}
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 32 }}>{[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 48, marginBottom: 8 }} />)}</div>
        ) : hierarchy.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 32px' }}>
            <Building2 size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ color: 'var(--color-text-secondary)' }}>No departments yet</h3>
          </div>
        ) : (
          hierarchy.map(dept => <DeptTreeItem key={dept.id} dept={dept} />)
        )}
      </div>

      {showCreate && <CreateDeptModal onClose={() => setShowCreate(false)} onSuccess={() => queryClient.invalidateQueries(['departments'])} />}
    </div>
  )
}
