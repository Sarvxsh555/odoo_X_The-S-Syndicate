import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { X, Camera, QrCode, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function QrScanner({ onScan, onClose }) {
  const scannerRef = useRef(null)
  const [error, setError] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [cameras, setCameras] = useState([])
  const [selectedCamera, setSelectedCamera] = useState(null)
  const qrRef = useRef(null)

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then(devices => {
        if (devices && devices.length) {
          setCameras(devices)
          setSelectedCamera(devices[0].id)
        } else {
          setError('No cameras found on this device.')
        }
      })
      .catch(() => setError('Camera access denied. Please allow camera permissions.'))
  }, [])

  useEffect(() => {
    if (!selectedCamera) return

    const html5QrCode = new Html5Qrcode('qr-reader')
    qrRef.current = html5QrCode
    setScanning(true)
    setError(null)

    html5QrCode.start(
      selectedCamera,
      { fps: 10, qrbox: { width: 220, height: 220 } },
      (decodedText) => {
        html5QrCode.stop().then(() => {
          setScanning(false)
          onScan(decodedText)
        }).catch(() => {})
      },
      () => {}
    ).catch(err => {
      setError('Failed to start camera: ' + (err?.message || err))
      setScanning(false)
    })

    return () => {
      html5QrCode.isScanning && html5QrCode.stop().catch(() => {})
    }
  }, [selectedCamera])

  const handleClose = () => {
    if (qrRef.current?.isScanning) {
      qrRef.current.stop().catch(() => {}).finally(onClose)
    } else {
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <motion.div
        className="modal-content"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        style={{ maxWidth: 420 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(94,92,230,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QrCode size={18} color="#5e5ce6" />
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>Scan QR Code</h3>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>Point camera at asset QR code</p>
            </div>
          </div>
          <button onClick={handleClose} className="btn-ghost btn-sm" style={{ padding: '6px 8px' }}>
            <X size={16} />
          </button>
        </div>

        {cameras.length > 1 && (
          <div style={{ marginBottom: 12 }}>
            <select
              className="input"
              value={selectedCamera || ''}
              onChange={e => setSelectedCamera(e.target.value)}
              style={{ fontSize: 12 }}
            >
              {cameras.map(c => <option key={c.id} value={c.id}>{c.label || `Camera ${c.id}`}</option>)}
            </select>
          </div>
        )}

        {error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px', gap: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,69,58,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={24} color="#ff453a" />
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center' }}>{error}</p>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <div
              id="qr-reader"
              style={{
                width: '100%',
                borderRadius: 10,
                overflow: 'hidden',
                background: '#000',
                minHeight: 280,
              }}
            />
            {/* Corner markers */}
            {scanning && (
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 220, height: 220, position: 'relative' }}>
                  {[['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right']].map(([v, h]) => (
                    <div key={`${v}${h}`} style={{
                      position: 'absolute', [v]: 0, [h]: 0,
                      width: 24, height: 24,
                      borderTop: v === 'top' ? '3px solid #5e5ce6' : 'none',
                      borderBottom: v === 'bottom' ? '3px solid #5e5ce6' : 'none',
                      borderLeft: h === 'left' ? '3px solid #5e5ce6' : 'none',
                      borderRight: h === 'right' ? '3px solid #5e5ce6' : 'none',
                    }} />
                  ))}
                  {/* Scanning line */}
                  <motion.div
                    animate={{ top: ['10%', '90%', '10%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    style={{
                      position: 'absolute', left: 0, right: 0, height: 2,
                      background: 'linear-gradient(90deg, transparent, #5e5ce6, transparent)',
                      borderRadius: 1,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <p style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 12 }}>
          <Camera size={11} style={{ display: 'inline', marginRight: 4 }} />
          Camera will auto-detect and navigate to asset
        </p>
      </motion.div>
    </div>
  )
}
