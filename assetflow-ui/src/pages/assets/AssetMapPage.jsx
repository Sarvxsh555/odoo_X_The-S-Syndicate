import { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { assetApi } from '../../api/services'
import { motion } from 'framer-motion'
import { MapPin, Wifi, Radio, Satellite, Navigation, X, Package, Activity } from 'lucide-react'
import toast from 'react-hot-toast'

// Simulated GPS coordinates for demo (real assets will get from backend)
const DEMO_LOCATIONS = [
  { id: 1, name: 'MacBook Pro M3', assetTag: 'LAP-001', status: 'ALLOCATED', lat: 28.6139, lng: 77.2090, location: 'Head Office - Floor 3' },
  { id: 2, name: 'Dell XPS 15', assetTag: 'LAP-002', status: 'AVAILABLE', lat: 28.6145, lng: 77.2095, location: 'IT Department' },
  { id: 3, name: 'Company Van #1', assetTag: 'VEH-001', status: 'ALLOCATED', lat: 28.6120, lng: 77.2110, location: 'En Route - Client Visit' },
  { id: 4, name: 'iPad Air', assetTag: 'TAB-001', status: 'MAINTENANCE', lat: 28.6150, lng: 77.2080, location: 'Tech Lab' },
  { id: 5, name: 'Server Unit A', assetTag: 'SRV-001', status: 'AVAILABLE', lat: 28.6135, lng: 77.2075, location: 'Data Center' },
]

const STATUS_COLORS = {
  AVAILABLE: '#00FF9D',
  ALLOCATED: '#00F0FF',
  MAINTENANCE: '#FFB800',
  LOST: '#FF3366',
  RETIRED: '#6B667A',
}

function AssetMarker({ asset, onClick, selected }) {
  const color = STATUS_COLORS[asset.status] || '#FFFFFF'
  return (
    <div
      onClick={() => onClick(asset)}
      title={asset.name}
      style={{
        position: 'absolute',
        cursor: 'pointer',
        transform: 'translate(-50%, -100%)',
        zIndex: selected ? 10 : 1
      }}
    >
      <motion.div
        animate={selected ? { scale: 1.3 } : { scale: 1 }}
        whileHover={{ scale: 1.2 }}
        style={{
          width: 36, height: 36, borderRadius: '50% 50% 50% 0',
          background: color, transform: 'rotate(-45deg)',
          boxShadow: `0 0 16px ${color}60, 0 2px 8px rgba(0,0,0,0.4)`,
          border: selected ? '2px solid white' : '2px solid rgba(255,255,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s'
        }}
      >
        <Package size={14} color="#1A1525" strokeWidth={2.5} style={{ transform: 'rotate(45deg)' }} />
      </motion.div>
      {selected && (
        <div style={{
          position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%) translateY(-4px)',
          background: 'rgba(26, 21, 37, 0.95)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, padding: '4px 10px', whiteSpace: 'nowrap', fontSize: 11, fontWeight: 700, color: 'white',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
        }}>
          {asset.name}
        </div>
      )}
    </div>
  )
}

export default function AssetMapPage() {
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [mapAssets, setMapAssets] = useState(DEMO_LOCATIONS)
  const queryClient = useQueryClient()
  const simIntervalRef = useRef(null)

  const { data: liveMapData } = useQuery({
    queryKey: ['assets', 'map'],
    queryFn: assetApi.getMapAssets,
    refetchInterval: 10000,
  })

  // Merge real data over demos
  useEffect(() => {
    const real = liveMapData?.data || []
    if (real.length > 0) {
      setMapAssets(prev => {
        const realIds = real.map(r => r.id)
        return [...prev.filter(p => !realIds.includes(p.id)), ...real]
      })
    }
  }, [liveMapData])

  const updateLocationMutation = useMutation({
    mutationFn: ({ id, lat, lng }) => assetApi.updateLocation(id, lat, lng),
    onSuccess: () => queryClient.invalidateQueries(['assets', 'map'])
  })

  // GPS simulation for vehicle assets
  const startSimulation = () => {
    setIsSimulating(true)
    toast.success('🛰️ GPS simulation started for vehicle assets')
    simIntervalRef.current = setInterval(() => {
      setMapAssets(prev => prev.map(a => {
        if (!a.name.toLowerCase().includes('van') && !a.name.toLowerCase().includes('vehicle')) return a
        return {
          ...a,
          lat: a.lat + (Math.random() - 0.5) * 0.002,
          lng: a.lng + (Math.random() - 0.5) * 0.002,
          location: 'Live GPS Tracking'
        }
      }))
    }, 2000)
  }

  const stopSimulation = () => {
    setIsSimulating(false)
    if (simIntervalRef.current) clearInterval(simIntervalRef.current)
    toast.success('GPS simulation stopped')
  }

  useEffect(() => () => { if (simIntervalRef.current) clearInterval(simIntervalRef.current) }, [])

  // Calculate map bounds for positioning
  const lats = mapAssets.map(a => a.lat)
  const lngs = mapAssets.map(a => a.lng)
  const minLat = Math.min(...lats), maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs)
  const latRange = (maxLat - minLat) || 0.02
  const lngRange = (maxLng - minLng) || 0.02

  // Convert geo coords to % positions in the container
  const toPos = (lat, lng) => ({
    left: `${((lng - minLng) / lngRange) * 80 + 10}%`,
    top: `${(1 - (lat - minLat) / latRange) * 80 + 10}%`
  })

  return (
    <div className="page-body" style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 }}>
            Live Asset Map
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-text-secondary)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent-emerald)', boxShadow: '0 0 6px var(--color-accent-emerald)', animation: 'pulse 2s infinite' }} />
            Live tracking with {mapAssets.length} assets detected
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={isSimulating ? stopSimulation : startSimulation}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10,
              border: `1px solid ${isSimulating ? 'rgba(255,51,102,0.4)' : 'rgba(0,240,255,0.3)'}`,
              background: isSimulating ? 'rgba(255,51,102,0.1)' : 'rgba(0,240,255,0.1)',
              color: isSimulating ? 'var(--color-accent-rose)' : 'var(--color-accent-cyan)',
              cursor: 'pointer', fontWeight: 700, fontSize: 13, transition: 'all 0.2s'
            }}
          >
            {isSimulating ? <><Radio size={14} /> Stop GPS Sim</> : <><Satellite size={14} /> Simulate GPS</>}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        {/* Map Container */}
        <div style={{
          position: 'relative', background: 'rgba(20, 16, 30, 0.9)',
          border: '1px solid rgba(0, 240, 255, 0.1)',
          borderRadius: 20, minHeight: 560, overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 0 80px rgba(0,240,255,0.02)'
        }}>
          {/* Grid lines (simulated map) */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.05 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{ position: 'absolute', left: `${i * 10}%`, top: 0, bottom: 0, width: 1, background: 'var(--color-accent-cyan)' }} />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{ position: 'absolute', top: `${i * 10}%`, left: 0, right: 0, height: 1, background: 'var(--color-accent-cyan)' }} />
            ))}
          </div>

          {/* Map branding */}
          <div style={{ position: 'absolute', top: 16, left: 16, fontFamily: 'monospace', fontSize: 10, color: 'rgba(0,240,255,0.4)', letterSpacing: '0.1em' }}>
            AETHER ERP // GPS MATRIX v2.1 // LIVE
          </div>
          <div style={{ position: 'absolute', bottom: 16, right: 16, fontFamily: 'monospace', fontSize: 10, color: 'rgba(0,240,255,0.3)' }}>
            {minLat.toFixed(4)}°N, {minLng.toFixed(4)}°E
          </div>

          {/* Asset Markers */}
          {mapAssets.map(asset => {
            const pos = toPos(asset.lat, asset.lng)
            return (
              <div key={asset.id} style={{ position: 'absolute', ...pos, transition: isSimulating ? 'left 2s ease, top 2s ease' : 'none' }}>
                <AssetMarker
                  asset={asset}
                  onClick={setSelectedAsset}
                  selected={selectedAsset?.id === asset.id}
                />
              </div>
            )
          })}

          {/* NFC/RFID Scan Zone indicators */}
          <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
              <Wifi size={10} /> NFC ZONES: 3
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
              <Radio size={10} /> RFID: ACTIVE
            </div>
          </div>
        </div>

        {/* Asset List Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Asset Locations
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 520, overflowY: 'auto' }} className="no-scrollbar">
            {mapAssets.map(asset => {
              const color = STATUS_COLORS[asset.status] || '#FFFFFF'
              const isSelected = selectedAsset?.id === asset.id
              return (
                <motion.div
                  key={asset.id}
                  onClick={() => setSelectedAsset(isSelected ? null : asset)}
                  whileHover={{ x: 4 }}
                  style={{
                    padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
                    background: isSelected ? 'rgba(0, 240, 255, 0.08)' : 'rgba(31, 25, 46, 0.8)',
                    border: `1px solid ${isSelected ? 'rgba(0, 240, 255, 0.3)' : 'rgba(255,255,255,0.05)'}`,
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}`, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 700, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--color-text-muted)' }}>
                    <MapPin size={10} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.location || 'Unknown'}</span>
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--color-text-disabled)', marginTop: 4 }}>
                    {asset.lat?.toFixed(4)}°N, {asset.lng?.toFixed(4)}°E
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{ padding: 16, background: 'rgba(31, 25, 46, 0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace', color: 'var(--color-text-muted)', marginBottom: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Legend</div>
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 600 }}>{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
