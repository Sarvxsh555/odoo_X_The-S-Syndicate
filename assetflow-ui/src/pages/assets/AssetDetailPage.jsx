import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { assetApi, allocationApi, maintenanceApi } from '../../api/services'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import {
  ArrowLeft, Tag, Package, Calendar, DollarSign, FileText,
  QrCode, Upload, Trash2, ChevronRight, Shield, AlertTriangle,
  Building2, User, RefreshCw, ScanLine
} from 'lucide-react'
import toast from 'react-hot-toast'
import AssetTimeline from '../../components/ui/AssetTimeline'
import QrScanner from '../../components/ui/QrScanner'
import DragDropUpload from '../../components/ui/DragDropUpload'

const DetailRow = ({ label, value, accent }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
    <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', marginRight: 16 }}>{label}</span>
    <span style={{ fontSize: 13, color: accent || 'var(--color-text-secondary)', fontWeight: 500, textAlign: 'right' }}>{value || '—'}</span>
  </div>
)

export default function AssetDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('overview')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showScanner, setShowScanner] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => assetApi.getById(id),
  })

  const { data: qrData } = useQuery({
    queryKey: ['asset', id, 'qr'],
    queryFn: () => assetApi.getQr(id),
    enabled: activeTab === 'qr',
  })

  const { data: allocData } = useQuery({
    queryKey: ['allocations', { assetId: id, status: 'ACTIVE' }],
    queryFn: () => allocationApi.getAll({ assetId: id, status: 'ACTIVE' }),
  })

  const { data: historyAllocData } = useQuery({
    queryKey: ['allocations', 'history', id],
    queryFn: () => allocationApi.getAll({ assetId: id, size: 100 }),
    enabled: activeTab === 'timeline',
  })

  const { data: historyMaintData } = useQuery({
    queryKey: ['maintenance', 'history', id],
    queryFn: () => maintenanceApi.getAll({ assetId: id, size: 100 }),
    enabled: activeTab === 'timeline',
  })

  const deleteImageMutation = useMutation({
    mutationFn: ({ imageId }) => assetApi.deleteImage(id, imageId),
    onSuccess: () => { queryClient.invalidateQueries(['asset', id]); toast.success('Image deleted') },
  })

  const regenerateQrMutation = useMutation({
    mutationFn: () => assetApi.regenerateQr(id),
    onSuccess: () => { queryClient.invalidateQueries(['asset', id, 'qr']); toast.success('QR regenerated') },
  })

  const handleImageUpload = async (file) => {
    if (!file) return
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      await assetApi.uploadImage(id, formData, false)
      queryClient.invalidateQueries(['asset', id])
      toast.success('Image uploaded')
    } catch (err) {
      toast.error(err?.message || 'Upload failed')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleScan = (decodedText) => {
    setShowScanner(false)
    // Extract ID if URL
    let scannedId = decodedText
    if (decodedText.includes('/assets/')) {
      scannedId = decodedText.split('/assets/').pop()
    }
    if (scannedId && scannedId !== id) {
      navigate(`/assets/${scannedId}`)
    } else {
      toast.success('Current asset verified')
    }
  }

  const asset = data?.data
  const activeAllocation = allocData?.data?.content?.[0]
  const qr = qrData?.data
  const allocationsHistory = historyAllocData?.data?.content || []
  const maintenanceHistory = historyMaintData?.data?.content || []

  if (isLoading) return (
    <div className="page-header page-body" style={{ paddingTop: 32 }}>
      {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 48, marginBottom: 12 }} />)}
    </div>
  )

  if (!asset) return (
    <div className="page-header page-body" style={{ paddingTop: 32, textAlign: 'center' }}>
      <p>Asset not found</p>
    </div>
  )

  const tabs = ['overview', 'timeline', 'images', 'documents', 'allocation', 'qr']
  const STATUS = asset.status?.toLowerCase()

  return (
    <div className="page-header page-body" style={{ paddingTop: 24 }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        <button className="btn-ghost btn-sm" style={{ padding: '6px 10px' }} onClick={() => navigate('/assets')}>
          <ArrowLeft size={14} /> Assets
        </button>
        <ChevronRight size={14} color="var(--color-text-muted)" />
        <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>{asset.assetTag}</span>
      </div>

      {/* Hero */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, marginBottom: 24 }} className="responsive-grid">
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }} className="responsive-flex-col">
            {/* Primary Image */}
            {asset.primaryImageUrl ? (
              <img src={asset.primaryImageUrl} alt={asset.name} style={{ width: 100, height: 100, borderRadius: 12, objectFit: 'cover', border: '1px solid var(--color-border)', flexShrink: 0 }} />
            ) : (
              <div style={{ width: 100, height: 100, borderRadius: 12, background: 'var(--color-bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)', flexShrink: 0 }}>
                <Package size={36} color="var(--color-text-muted)" />
              </div>
            )}

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{asset.name}</h1>
                <span className={`badge badge-${STATUS}`}>{asset.status}</span>
                <span className="badge" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)' }}>
                  {asset.condition}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Tag size={13} color="var(--color-text-muted)" />
                <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--color-accent-violet-light)', fontWeight: 600 }}>{asset.assetTag}</span>
              </div>

              {asset.description && (
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{asset.description}</p>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, padding: '4px 10px', background: 'var(--color-bg-elevated)', borderRadius: 20, color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
                  {asset.categoryName}
                </span>
                {asset.departmentName && (
                  <span style={{ fontSize: 12, padding: '4px 10px', background: 'var(--color-bg-elevated)', borderRadius: 20, color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
                    {asset.departmentName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {asset.purchasePrice && (
            <div className="glass-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={16} color="#10b981" />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Purchase Price</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>${asset.purchasePrice?.toLocaleString()}</div>
              </div>
            </div>
          )}
          {asset.warrantyExpiry && (
            <div className="glass-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: asset.warrantyExpired ? 'rgba(244,63,94,0.15)' : 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={16} color={asset.warrantyExpired ? '#f43f5e' : '#f59e0b'} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Warranty Expiry</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: asset.warrantyExpired ? '#f43f5e' : 'var(--color-text-primary)' }}>
                  {asset.warrantyExpiry}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  {asset.warrantyExpired ? 'Expired' : `${asset.warrantyDaysLeft} days left`}
                </div>
              </div>
            </div>
          )}
          {activeAllocation && (
            <div className="glass-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={16} color="#6366f1" />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Assigned To</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>{activeAllocation.allocatedToName}</div>
              </div>
            </div>
          )}
          {asset.healthScore !== undefined && (
            <div className="glass-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `rgba(${asset.healthScore > 75 ? '16,185,129' : asset.healthScore > 50 ? '245,158,11' : '244,63,94'}, 0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={16} color={asset.healthScore > 75 ? '#10b981' : asset.healthScore > 50 ? '#f59e0b' : '#f43f5e'} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Health Score</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: asset.healthScore > 75 ? '#10b981' : asset.healthScore > 50 ? '#f59e0b' : '#f43f5e' }}>{asset.healthScore}/100</div>
                  <div style={{ flex: 1, height: 4, background: 'var(--color-border)', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${asset.healthScore}%`, background: asset.healthScore > 75 ? '#10b981' : asset.healthScore > 50 ? '#f59e0b' : '#f43f5e', borderRadius: 2 }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 20, borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: 0, overflowX: 'auto' }} className="no-scrollbar">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
            color: activeTab === tab ? 'var(--color-accent-violet-light)' : 'var(--color-text-muted)',
            borderBottom: activeTab === tab ? '2px solid var(--color-accent-violet)' : '2px solid transparent',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
          }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            <div className="glass-card" style={{ padding: 24 }}>
              <h4 style={{ marginBottom: 16, color: 'var(--color-text-secondary)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Asset Details</h4>
              <DetailRow label="Model" value={asset.model} />
              <DetailRow label="Manufacturer" value={asset.manufacturer} />
              <DetailRow label="Serial Number" value={asset.serialNumber} />
              <DetailRow label="Vendor" value={asset.vendor} />
              <DetailRow label="Location" value={asset.location} />
              <DetailRow label="Purchase Date" value={asset.purchaseDate} />
              <DetailRow label="Current Value" value={asset.currentValue ? `$${asset.currentValue?.toLocaleString()}` : undefined} />
            </div>
            <div className="glass-card" style={{ padding: 24 }}>
              <h4 style={{ marginBottom: 16, color: 'var(--color-text-secondary)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Notes</h4>
              {asset.notes ? (
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{asset.notes}</p>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>No notes added.</p>
              )}
            </div>
            {asset.customFields && Object.keys(asset.customFields).length > 0 && (
              <div className="glass-card" style={{ padding: 24, gridColumn: '1 / -1' }}>
                <h4 style={{ marginBottom: 16, color: 'var(--color-text-secondary)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Custom Attributes</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0 32px' }}>
                  {Object.entries(asset.customFields).map(([key, value]) => (
                    <DetailRow key={key} label={key} value={value} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="glass-card" style={{ padding: 32, maxWidth: 600 }}>
            <h4 style={{ marginBottom: 24, fontSize: 16, fontWeight: 700 }}>Asset Lifecycle Timeline</h4>
            <AssetTimeline 
              asset={asset} 
              allocations={allocationsHistory} 
              maintenance={maintenanceHistory} 
            />
          </div>
        )}

        {activeTab === 'images' && (
          <div className="glass-card" style={{ padding: 24 }}>
            <h4 style={{ margin: '0 0 20px 0' }}>Images ({asset.images?.length || 0})</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <DragDropUpload
                  onFilesSelected={handleImageUpload}
                  accept="image/*"
                  label="Drop image here or click"
                  uploading={uploadingImage}
                />
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginTop: 12 }}>
                {(asset.images || []).map(img => (
                  <div key={img.id} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '1', border: '1px solid var(--color-border)' }}>
                    <img src={img.url} alt={img.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {img.primary && <span style={{ position: 'absolute', top: 6, left: 6, background: '#10b981', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>PRIMARY</span>}
                    {isAdmin && (
                      <button onClick={() => deleteImageMutation.mutate({ imageId: img.id })} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: 6, padding: 4, cursor: 'pointer', color: '#f43f5e', display: 'flex' }}>
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="glass-card" style={{ padding: 24 }}>
            <h4 style={{ marginBottom: 16 }}>Documents ({asset.documents?.length || 0})</h4>
            {(asset.documents || []).map(doc => (
              <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                <FileText size={20} color="var(--color-accent-violet-light)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{doc.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{doc.docType} · {doc.sizeBytes ? `${Math.round(doc.sizeBytes / 1024)} KB` : ''}</div>
                </div>
                <a href={doc.url} target="_blank" rel="noreferrer" className="btn-ghost btn-sm">View</a>
              </div>
            ))}
            {asset.documents?.length === 0 && <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>No documents uploaded yet.</p>}
          </div>
        )}

        {activeTab === 'allocation' && (
          <div className="glass-card" style={{ padding: 24, maxWidth: 600 }}>
            {activeAllocation ? (
              <div>
                <h4 style={{ marginBottom: 16 }}>Current Allocation</h4>
                <DetailRow label="Assigned To" value={activeAllocation.allocatedToName} accent="var(--color-text-primary)" />
                <DetailRow label="Allocated By" value={activeAllocation.allocatedByName} />
                <DetailRow label="Allocation Date" value={new Date(activeAllocation.allocationDate).toLocaleDateString()} />
                <DetailRow label="Expected Return" value={activeAllocation.expectedReturnDate || 'Not specified'} />
                <DetailRow label="Department" value={activeAllocation.departmentName} />
                <DetailRow label="Condition at Allocation" value={activeAllocation.conditionAtAllocation} />
                {activeAllocation.notes && <DetailRow label="Notes" value={activeAllocation.notes} />}
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>This asset is not currently allocated.</p>
            )}
          </div>
        )}

        {activeTab === 'qr' && (
          <div className="glass-card" style={{ padding: 40, textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
            <h4 style={{ marginBottom: 24, fontSize: 18 }}>QR Code & Verification</h4>
            {qr?.qrImageUrl ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ padding: 16, background: '#fff', borderRadius: 16, display: 'inline-block', marginBottom: 20 }}>
                  <img src={qr.qrImageUrl} alt="QR Code" style={{ width: 200, height: 200 }} />
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--color-accent-violet-light)', marginBottom: 24, padding: '8px 16px', background: 'rgba(94,92,230,0.1)', borderRadius: 8 }}>{qr.qrData}</div>
                
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button className="btn-primary" onClick={() => setShowScanner(true)}>
                    <ScanLine size={16} /> Scan to Verify
                  </button>
                  <a href={qr.qrImageUrl} download className="btn-secondary">Download PNG</a>
                  {isAdmin && (
                    <button className="btn-ghost" onClick={() => regenerateQrMutation.mutate()}>
                      <RefreshCw size={15} /> Regenerate
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-muted)' }}>QR code not generated yet.</p>
            )}
          </div>
        )}
      </motion.div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QrScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}
    </div>
  )
}
