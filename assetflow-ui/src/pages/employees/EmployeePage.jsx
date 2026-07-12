import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeeApi, departmentApi } from '../../api/services'
import { useAuth } from '../../context/AuthContext'
import { Plus, Users, Search, X, Pencil, Trash2, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

function CreateEmployeeModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', departmentId: '', designation: '', password: 'TempPass@123' })
  const { data: deptsData } = useQuery({ queryKey: ['departments', 'all'], queryFn: () => departmentApi.getAll({ size: 100 }) })
  const mutation = useMutation({
    mutationFn: employeeApi.create,
    onSuccess: () => { toast.success('Employee created'); onSuccess(); onClose() },
    onError: e => toast.error(e?.message || 'Failed'),
  })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, fontSize: 18 }}>Add Employee</h3>
          <button onClick={onClose} className="btn-ghost btn-sm" style={{ padding: '6px 8px' }}><X size={16} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group"><label className="form-label">First Name *</label><input className="input" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="John" /></div>
          <div className="form-group"><label className="form-label">Last Name *</label><input className="input" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Doe" /></div>
        </div>
        <div className="form-group"><label className="form-label">Email *</label><input type="email" className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john.doe@company.com" /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group"><label className="form-label">Phone</label><input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Designation</label><input className="input" value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} placeholder="Software Engineer" /></div>
        </div>
        <div className="form-group">
          <label className="form-label">Department</label>
          <select className="input" value={form.departmentId} onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))}>
            <option value="">No department</option>
            {(deptsData?.data?.content || []).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Temp Password</label><input className="input" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!form.firstName || !form.lastName || !form.email || mutation.isPending}
            onClick={() => mutation.mutate({ ...form, departmentId: form.departmentId ? Number(form.departmentId) : undefined })}>
            {mutation.isPending ? 'Creating...' : 'Create Employee'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function EmployeePage() {
  const { isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [page, setPage] = useState(0)
  const [showCreate, setShowCreate] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['employees', { search, departmentId, page }],
    queryFn: () => employeeApi.getAll({ search: search || undefined, departmentId: departmentId || undefined, page, size: 20 }),
    keepPreviousData: true,
  })
  const { data: deptsData } = useQuery({ queryKey: ['departments', 'all'], queryFn: () => departmentApi.getAll({ size: 100 }) })

  const deleteMutation = useMutation({
    mutationFn: employeeApi.delete,
    onSuccess: () => { queryClient.invalidateQueries(['employees']); toast.success('Employee deleted') },
    onError: e => toast.error(e?.message || 'Cannot delete this employee'),
  })

  const promoteMutation = useMutation({
    mutationFn: employeeApi.promote,
    onSuccess: () => { queryClient.invalidateQueries(['employees']); toast.success('Employee promoted to Admin!') },
    onError: e => toast.error(e?.message || 'Failed'),
  })

  const employees = data?.data?.content || []
  const totalPages = data?.data?.totalPages || 0
  const departments = deptsData?.data?.content || []

  return (
    <div className="page-header page-body" style={{ paddingTop: 32 }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">Employees</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 2 }}>{data?.data?.totalElements || 0} employees</p>
        </div>
        {isAdmin && (
          <button className="btn-primary btn-sm" onClick={() => setShowCreate(true)}>
            <Plus size={14} /> Add Employee
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div className="search-wrapper" style={{ flex: 1, maxWidth: 380 }}>
          <Search size={14} />
          <input className="search-input" placeholder="Search employees..." value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
          {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex' }}><X size={12} /></button>}
        </div>
        <select className="input" style={{ width: 200 }} value={departmentId} onChange={e => { setDepartmentId(e.target.value); setPage(0) }}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 32 }}>{[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 64, marginBottom: 8 }} />)}</div>
        ) : employees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 32px' }}>
            <Users size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ color: 'var(--color-text-secondary)' }}>No employees found</h3>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Code</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Role</th>
                  <th>Status</th>
                  {isAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar avatar-sm">{emp.firstName?.[0]}{emp.lastName?.[0]}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary)' }}>{emp.fullName}</div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--color-accent-violet-light)' }}>{emp.empCode}</span></td>
                    <td style={{ fontSize: 12 }}>{emp.departmentName || '—'}</td>
                    <td style={{ fontSize: 12 }}>{emp.designation || '—'}</td>
                    <td>
                      <span className={`badge badge-${emp.role === 'ROLE_ADMIN' ? 'admin' : 'employee'}`}>
                        {emp.role === 'ROLE_ADMIN' ? 'Admin' : 'Employee'}
                      </span>
                    </td>
                    <td><span className={`badge badge-${emp.active ? 'available' : 'retired'}`}>{emp.active ? 'Active' : 'Inactive'}</span></td>
                    {isAdmin && (
                      <td>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          {emp.role !== 'ROLE_ADMIN' && (
                            <button className="btn-ghost btn-sm" style={{ padding: '5px 8px', fontSize: 11 }} onClick={() => { if (confirm(`Promote ${emp.fullName} to Admin?`)) promoteMutation.mutate(emp.id) }}>
                              <Shield size={11} /> Promote
                            </button>
                          )}
                          <button className="btn-danger btn-sm" style={{ padding: '5px 8px' }} onClick={() => { if (confirm(`Delete ${emp.fullName}?`)) deleteMutation.mutate(emp.id) }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: 16, borderTop: '1px solid var(--color-border-subtle)' }}>
                <button className="btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
                <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Page {page + 1} of {totalPages}</span>
                <button className="btn-ghost btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
              </div>
            )}
          </>
        )}
      </div>

      {showCreate && <CreateEmployeeModal onClose={() => setShowCreate(false)} onSuccess={() => queryClient.invalidateQueries(['employees'])} />}
    </div>
  )
}
