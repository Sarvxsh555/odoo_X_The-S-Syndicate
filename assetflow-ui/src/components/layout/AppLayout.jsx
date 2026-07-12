import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import SpotlightSearch from '../ui/SpotlightSearch'
import Dock from './Dock'

export default function AppLayout() {
  const [spotlightOpen, setSpotlightOpen] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSpotlightOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      <Sidebar />
      <div className="page-content" style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <Topbar onSearchClick={() => setSpotlightOpen(true)} />
        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
        >
          <Outlet />
        </motion.main>
      </div>
      <SpotlightSearch isOpen={spotlightOpen} onClose={() => setSpotlightOpen(false)} />
      <Dock />
    </div>
  )
}
