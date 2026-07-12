import { BarChart3, Download, FileText, Shield, Calendar, ArrowLeftRight, Wrench } from 'lucide-react'
import { reportApi } from '../../api/services'
import toast from 'react-hot-toast'

const REPORTS = [
  { id: 'assets', label: 'Asset Inventory', description: 'Complete asset register with status, category, and financial data', icon: BarChart3, color: '#6366f1' },
  { id: 'allocations', label: 'Allocation Report', description: 'All asset allocations including active, returned, and transferred', icon: ArrowLeftRight, color: '#10b981' },
  { id: 'maintenance', label: 'Maintenance Report', description: 'Maintenance requests with status, costs, and resolution notes', icon: Wrench, color: '#f59e0b' },
  { id: 'warranty', label: 'Warranty Report', description: 'Assets with warranty expiry details and upcoming expirations', icon: Shield, color: '#f43f5e' },
  { id: 'bookings', label: 'Booking Report', description: 'Resource bookings and utilization data', icon: Calendar, color: '#06b6d4' },
]

export default function ReportsPage() {
  const downloadReport = async (reportId, format) => {
    try {
      const fn = reportApi[`download${reportId.charAt(0).toUpperCase() + reportId.slice(1)}`]
      if (!fn) { toast.error('Report not available'); return }
      const blob = await fn(format)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${reportId}-report.${format}`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`${format.toUpperCase()} downloaded!`)
    } catch (e) {
      toast.error('Export failed — please try again')
    }
  }

  return (
    <div className="page-header page-body" style={{ paddingTop: 32 }}>
      <div style={{ marginBottom: 32 }}>
        <h2 className="section-title">Reports & Exports</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 4 }}>
          Download comprehensive reports in PDF or Excel format
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {REPORTS.map(report => (
          <div key={report.id} className="glass-card" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${report.color}20`, border: `1px solid ${report.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <report.icon size={20} color={report.color} />
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: 15, fontFamily: 'Outfit', marginBottom: 4 }}>{report.label}</h4>
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{report.description}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn-secondary btn-sm"
                onClick={() => downloadReport(report.id, 'xlsx')}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <Download size={13} /> Excel
              </button>
              <button
                className="btn-secondary btn-sm"
                onClick={() => downloadReport(report.id, 'pdf')}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <FileText size={13} /> PDF
              </button>
            </div>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: report.color, filter: 'blur(40px)', opacity: 0.06, pointerEvents: 'none' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
