import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { assetApi, categoryApi, departmentApi } from '../../api/services'
import { ArrowLeft, Save } from 'lucide-react'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  condition: z.string().optional(),
  location: z.string().optional(),
  departmentId: z.string().optional(),
  serialNumber: z.string().optional(),
  model: z.string().optional(),
  manufacturer: z.string().optional(),
  vendor: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.string().optional(),
  warrantyExpiry: z.string().optional(),
  notes: z.string().optional(),
})

export default function AssetRegisterPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: categoriesData } = useQuery({ queryKey: ['categories', 'all'], queryFn: () => categoryApi.getAll({}) })
  const { data: deptsData } = useQuery({ queryKey: ['departments', 'all'], queryFn: () => departmentApi.getAll({}) })

  const { register, handleSubmit, formState: { errors }, control } = useForm({ resolver: zodResolver(schema) })

  const createMutation = useMutation({
    mutationFn: (data) => assetApi.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['assets'])
      toast.success('Asset registered successfully!')
      navigate(`/assets/${res.data.id}`)
    },
    onError: (e) => toast.error(e?.message || 'Failed to register asset'),
  })

  const onSubmit = (data) => {
    createMutation.mutate({
      ...data,
      categoryId: Number(data.categoryId),
      departmentId: data.departmentId ? Number(data.departmentId) : undefined,
      purchasePrice: data.purchasePrice ? Number(data.purchasePrice) : undefined,
    })
  }

  const categories = categoriesData?.data?.content || []
  const departments = deptsData?.data?.content || []

  return (
    <div className="page-header page-body" style={{ paddingTop: 24, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <button className="btn-ghost btn-sm" onClick={() => navigate('/assets')}>
          <ArrowLeft size={14} /> Back
        </button>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Register New Asset</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 2 }}>A QR code will be auto-generated upon creation</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          {/* Basic Info */}
          <div className="glass-card" style={{ padding: 24, gridColumn: '1 / -1' }}>
            <h4 style={{ marginBottom: 20, color: 'var(--color-text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Basic Information</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Asset Name *</label>
                <input {...register('name')} className={`input ${errors.name ? 'error' : ''}`} placeholder="e.g. MacBook Pro 16-inch" />
                {errors.name && <div className="form-error">{errors.name.message}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select {...register('categoryId')} className={`input ${errors.categoryId ? 'error' : ''}`}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.categoryId && <div className="form-error">{errors.categoryId.message}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select {...register('departmentId')} className="input">
                  <option value="">No department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Condition</label>
                <select {...register('condition')} className="input">
                  <option value="GOOD">Good</option>
                  <option value="EXCELLENT">Excellent</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Poor</option>
                  <option value="DAMAGED">Damaged</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input {...register('location')} className="input" placeholder="e.g. Floor 3, Desk A12" />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Description</label>
                <textarea {...register('description')} className="input" rows={3} placeholder="Optional asset description..." style={{ resize: 'vertical' }} />
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h4 style={{ marginBottom: 20, color: 'var(--color-text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Technical Details</h4>
            <div className="form-group"><label className="form-label">Model</label><input {...register('model')} className="input" placeholder="e.g. M3 Pro" /></div>
            <div className="form-group"><label className="form-label">Manufacturer</label><input {...register('manufacturer')} className="input" placeholder="e.g. Apple" /></div>
            <div className="form-group"><label className="form-label">Serial Number</label><input {...register('serialNumber')} className="input" placeholder="Unique serial" /></div>
            <div className="form-group"><label className="form-label">Vendor</label><input {...register('vendor')} className="input" placeholder="Supplier name" /></div>
          </div>

          {/* Financial Details */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h4 style={{ marginBottom: 20, color: 'var(--color-text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Financial & Warranty</h4>
            <div className="form-group"><label className="form-label">Purchase Date</label><input type="date" {...register('purchaseDate')} className="input" /></div>
            <div className="form-group"><label className="form-label">Purchase Price ($)</label><input type="number" {...register('purchasePrice')} className="input" placeholder="0.00" step="0.01" /></div>
            <div className="form-group"><label className="form-label">Warranty Expiry</label><input type="date" {...register('warrantyExpiry')} className="input" /></div>
            <div className="form-group"><label className="form-label">Notes</label><textarea {...register('notes')} className="input" rows={3} placeholder="Internal notes..." style={{ resize: 'vertical' }} /></div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" className="btn-secondary" onClick={() => navigate('/assets')}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
            <Save size={15} />
            {createMutation.isPending ? 'Registering...' : 'Register Asset'}
          </button>
        </div>
      </form>
    </div>
  )
}
