import { useState, useRef, useCallback } from 'react'
import { Upload, X, FileText, Image, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function DragDropUpload({
  onFilesSelected,
  accept = 'image/*',
  multiple = false,
  maxSizeMB = 10,
  label = 'Drop files here or click to browse',
  uploading = false,
  uploaded = [],
  onRemoveUploaded,
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [previews, setPreviews] = useState([])
  const inputRef = useRef(null)

  const handleFiles = useCallback((files) => {
    const valid = Array.from(files).filter(f => {
      if (f.size > maxSizeMB * 1024 * 1024) return false
      return true
    })
    if (!valid.length) return

    const newPreviews = valid.map(file => ({
      file,
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      name: file.name,
      size: file.size,
      isImage: file.type.startsWith('image/'),
    }))
    setPreviews(prev => multiple ? [...prev, ...newPreviews] : newPreviews)
    onFilesSelected(multiple ? valid : valid[0])
  }, [maxSizeMB, multiple, onFilesSelected])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const onDragLeave = () => setIsDragging(false)

  const removePreview = (idx) => {
    setPreviews(prev => {
      const next = [...prev]
      if (next[idx].url) URL.revokeObjectURL(next[idx].url)
      next.splice(idx, 1)
      return next
    })
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        style={{
          border: `2px dashed ${isDragging ? 'var(--color-accent-violet)' : 'var(--color-border)'}`,
          borderRadius: 10,
          padding: '24px 16px',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragging ? 'rgba(94,92,230,0.07)' : 'rgba(255,255,255,0.02)',
          transition: 'all 0.2s ease',
          userSelect: 'none',
        }}
      >
        <motion.div animate={{ scale: isDragging ? 1.08 : 1 }} transition={{ duration: 0.2 }}>
          <Upload size={28} color={isDragging ? '#5e5ce6' : 'var(--color-text-muted)'} style={{ margin: '0 auto 10px' }} />
        </motion.div>
        <p style={{ fontSize: 13, color: isDragging ? '#5e5ce6' : 'var(--color-text-secondary)', fontWeight: 500, marginBottom: 4 }}>
          {uploading ? 'Uploading...' : label}
        </p>
        <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
          Max {maxSizeMB}MB · {accept}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {/* New file previews */}
      <AnimatePresence>
        {previews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}
          >
            {previews.map((p, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--color-border)', aspectRatio: '1' }}
              >
                {p.isImage ? (
                  <img src={p.url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-elevated)', padding: 8 }}>
                    <FileText size={20} color="var(--color-text-muted)" />
                    <span style={{ fontSize: 9, color: 'var(--color-text-muted)', marginTop: 4, textAlign: 'center', wordBreak: 'break-all' }}>{p.name}</span>
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); removePreview(idx) }}
                  style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: 4, padding: 2, cursor: 'pointer', color: '#ff453a', display: 'flex', lineHeight: 1 }}
                >
                  <X size={10} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Already uploaded files */}
      {uploaded.length > 0 && (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {uploaded.map((f, i) => (
            <div key={f.id || i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'rgba(48,209,88,0.07)', borderRadius: 7, border: '1px solid rgba(48,209,88,0.15)' }}>
              <CheckCircle size={13} color="#30d158" />
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', flex: 1 }}>{f.filename || f.name}</span>
              {onRemoveUploaded && (
                <button onClick={() => onRemoveUploaded(f)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 2, display: 'flex' }}>
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
