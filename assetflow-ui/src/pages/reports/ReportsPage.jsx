import { useState } from 'react'
import { Download, FileText, FileSpreadsheet, PieChart as PieChartIcon, Activity, ChevronRight, DollarSign } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi, assetApi } from '../../api/services'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, AreaChart, Area, CartesianGrid
} from 'recharts'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const COLORS = ['#30d158', '#5e5ce6', '#ff9f0a', '#ff453a', '#8e8e93', '#0a84ff', '#32ade6']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 10, padding: '10px 14px', fontSize: 13, backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color, fontWeight: 600, margin: 0 }}>{p.name}: {p.value}</p>)}
    </div>
  )
}

const ReportCard = ({ title, description, onPdf, onExcel }) => (
  <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{title}</h3>
      <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{description}</p>
    </div>
    <div style={{ display: 'flex', gap: 12, marginTop: 'auto' }}>
      <button className="btn-secondary" style={{ flex: 1, padding: '8px 0', fontSize: 12 }} onClick={onPdf}>
        <FileText size={14} /> Export PDF
      </button>
      <button className="btn-secondary" style={{ flex: 1, padding: '8px 0', fontSize: 12 }} onClick={onExcel}>
        <FileSpreadsheet size={14} /> Export Excel
      </button>
    </div>
  </div>
)

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('analytics')

  // Fetch Analytics Data
  const { data: statusData } = useQuery({ queryKey: ['reports', 'status'], queryFn: dashboardApi.getAssetStatus })
  const { data: deptData } = useQuery({ queryKey: ['reports', 'dept'], queryFn: dashboardApi.getDeptDistribution })
  const { data: maintenanceData } = useQuery({ queryKey: ['reports', 'maintenance'], queryFn: dashboardApi.getMaintenanceTrends })
  const { data: valuationData } = useQuery({ queryKey: ['reports', 'valuation'], queryFn: dashboardApi.getValuationSummary })

  const statusChartData = (statusData?.data || []).map(d => ({ name: d.status, value: Number(d.count) }))
  const deptChartData = (deptData?.data || []).map(d => ({ name: d.department, count: Number(d.count) }))
  const maintenanceTrendData = (maintenanceData?.data || []).map(d => ({ month: d.month, open: Number(d.open || 0), resolved: Number(d.resolved || 0) }))
  const valuation = valuationData?.data || { totalPurchaseValue: 0, totalCurrentValue: 0, totalDepreciation: 0 }

  const handleExport = async (type, format) => {
    toast.success(`Generating ${type} report as ${format.toUpperCase()}...`)
    try {
      // Fetch fresh data for the report
      let data = []
      let headers = []
      let title = ''

      if (type === 'Inventory') {
        const res = await assetApi.getAll({ size: 1000 }) // fetch all
        data = res.data?.content || []
        headers = ['Asset Tag', 'Name', 'Category', 'Status', 'Department', 'Current Value']
        data = data.map(a => [a.assetTag, a.name, a.category, a.status, a.departmentName || 'N/A', a.currentValue || a.acquisitionCost])
        title = 'Complete Asset Inventory Report'
      } else if (type === 'Allocations') {
        toast.error('Allocation export requires backend endpoint updates.')
        return
      } else if (type === 'Maintenance') {
        const res = await dashboardApi.getMaintenanceTrends()
        data = res.data || []
        headers = ['Month', 'Open Tickets', 'Resolved Tickets']
        data = data.map(m => [m.month, m.open, m.resolved])
        title = 'Maintenance Trends Report'
      } else if (type === 'Depreciation') {
        const res = await assetApi.getAll({ size: 1000 })
        data = res.data?.content || []
        headers = ['Asset Tag', 'Name', 'Acquisition Date', 'Purchase Cost', 'Current Value', 'Depreciation']
        data = data.map(a => [
          a.assetTag, a.name, 
          a.acquisitionDate ? new Date(a.acquisitionDate).toLocaleDateString() : 'N/A', 
          `$${a.acquisitionCost || 0}`, 
          `$${a.currentValue || a.acquisitionCost}`, 
          `$${(a.acquisitionCost || 0) - (a.currentValue || a.acquisitionCost)}`
        ])
        title = 'Asset Depreciation Report'
      }

      if (format === 'pdf') {
        const doc = new jsPDF()
        doc.text(title, 14, 15)
        doc.setFontSize(10)
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22)
        
        doc.autoTable({
          head: [headers],
          body: data,
          startY: 28,
          theme: 'grid',
          headStyles: { fillColor: [40, 33, 56] },
        })
        doc.save(`${type.toLowerCase()}_report.pdf`)
      } else if (format === 'excel') {
        const ws = XLSX.utils.aoa_to_sheet([headers, ...data])
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Report")
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
        const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        saveAs(dataBlob, `${type.toLowerCase()}_report.xlsx`)
      }
      toast.success('Download complete')
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate report')
    }
  }

  return (
    <div className="page-header page-body" style={{ paddingTop: 32 }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">Reports & Analytics</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 2 }}>System insights and data exports</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 2, marginBottom: 24, borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: 0 }}>
        <button onClick={() => setActiveTab('analytics')} style={{
          padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, color: activeTab === 'analytics' ? 'var(--color-accent-violet-light)' : 'var(--color-text-muted)',
          borderBottom: activeTab === 'analytics' ? '2px solid var(--color-accent-violet)' : '2px solid transparent',
          transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8
        }}>
          <PieChartIcon size={14} /> Analytics Dashboard
        </button>
        <button onClick={() => setActiveTab('exports')} style={{
          padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, color: activeTab === 'exports' ? 'var(--color-accent-violet-light)' : 'var(--color-text-muted)',
          borderBottom: activeTab === 'exports' ? '2px solid var(--color-accent-violet)' : '2px solid transparent',
          transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8
        }}>
          <Download size={14} /> Data Exports
        </button>
      </div>

      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Valuation Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                <DollarSign size={16} /> Total Acquisition Cost
              </div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>${valuation.totalPurchaseValue.toLocaleString()}</div>
            </div>
            <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                <Activity size={16} color="var(--color-accent-emerald)" /> Current Portfolio Value
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-accent-emerald)' }}>${valuation.totalCurrentValue.toLocaleString()}</div>
            </div>
            <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                <Activity size={16} color="var(--color-accent-rose)" /> Total Depreciation
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-accent-rose)' }}>${valuation.totalDepreciation.toLocaleString()}</div>
            </div>
          </div>

          {/* Top Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="responsive-grid">
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Asset Status Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value">
                    {statusChartData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Department Allocation</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={deptChartData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} width={90} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                  <Bar dataKey="count" fill="var(--color-accent-blue)" radius={[0, 4, 4, 0]} barSize={16}>
                    {deptChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index+1) % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Full Width Chart */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 24 }}>Maintenance Volume Trend (6 Months)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={maintenanceTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="openGradR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff9f0a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ff9f0a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="resolvedGradR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#30d158" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#30d158" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{v}</span>} />
                <Area type="monotone" dataKey="open" stroke="#ff9f0a" strokeWidth={2} fill="url(#openGradR)" name="Open Tickets" />
                <Area type="monotone" dataKey="resolved" stroke="#30d158" strokeWidth={2} fill="url(#resolvedGradR)" name="Resolved Tickets" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'exports' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          <ReportCard
            title="Complete Asset Inventory"
            description="Full dump of all registered assets including current status, location, value, and warranty details."
            onPdf={() => handleExport('Inventory', 'pdf')}
            onExcel={() => handleExport('Inventory', 'excel')}
          />
          <ReportCard
            title="Allocation History"
            description="Historical record of all asset assignments and returns within a specified date range."
            onPdf={() => handleExport('Allocations', 'pdf')}
            onExcel={() => handleExport('Allocations', 'excel')}
          />
          <ReportCard
            title="Maintenance & Repairs"
            description="Summary of all maintenance requests, costs, and resolution times by category."
            onPdf={() => handleExport('Maintenance', 'pdf')}
            onExcel={() => handleExport('Maintenance', 'excel')}
          />
          <ReportCard
            title="Depreciation Schedule"
            description="Financial report outlining the current value and depreciation of capital assets."
            onPdf={() => handleExport('Depreciation', 'pdf')}
            onExcel={() => handleExport('Depreciation', 'excel')}
          />
        </div>
      )}
    </div>
  )
}
