import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Package, Users, Building2, Calendar, Wrench, ArrowRight, Command, Mic, MicOff, Clock, X, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const QUICK_LINKS = [
  { label: 'Asset Directory', path: '/assets', icon: Package, category: 'Navigate' },
  { label: 'Employees', path: '/employees', icon: Users, category: 'Navigate' },
  { label: 'Departments', path: '/departments', icon: Building2, category: 'Navigate' },
  { label: 'Bookings', path: '/bookings', icon: Calendar, category: 'Navigate' },
  { label: 'Maintenance', path: '/maintenance', icon: Wrench, category: 'Navigate' },
  { label: 'Reports & Analytics', path: '/reports', icon: Zap, category: 'Navigate' },
]

const MAX_RECENT = 6

function getRecentSearches() {
  try { return JSON.parse(localStorage.getItem('recentSearches') || '[]') } catch { return [] }
}
function addRecentSearch(query) {
  const recents = getRecentSearches().filter(r => r !== query)
  recents.unshift(query)
  localStorage.setItem('recentSearches', JSON.stringify(recents.slice(0, MAX_RECENT)))
}

export default function SpotlightSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [voiceError, setVoiceError] = useState(null)
  const [recentSearches, setRecentSearches] = useState([])
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)
  const navigate = useNavigate()

  // Build filtered results
  const quickFiltered = query.trim().length === 0
    ? QUICK_LINKS
    : QUICK_LINKS.filter(l => l.label.toLowerCase().includes(query.toLowerCase()))

  const allResults = [...quickFiltered]
  if (query.trim().length > 0 && !QUICK_LINKS.some(l => l.label.toLowerCase().includes(query.toLowerCase()))) {
    allResults.push({ label: `Search assets for "${query}"`, path: `/search?q=${encodeURIComponent(query)}`, icon: Search, category: 'Search' })
  }

  const go = useCallback((path, searchQuery = null) => {
    if (searchQuery) addRecentSearch(searchQuery)
    navigate(path)
    onClose()
    setQuery('')
    setIsListening(false)
    if (recognitionRef.current) recognitionRef.current.stop()
  }, [navigate, onClose])

  // Focus on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setActiveIndex(0)
      setRecentSearches(getRecentSearches())
    } else {
      setIsListening(false)
      if (recognitionRef.current) recognitionRef.current.stop()
    }
  }, [isOpen])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return
      if (e.key === 'Escape') { onClose(); setIsListening(false) }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, allResults.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)) }
      if (e.key === 'Enter' && allResults[activeIndex]) {
        const item = allResults[activeIndex]
        if (item.category === 'Search') go(item.path, query)
        else go(item.path)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, activeIndex, allResults, go, query, onClose])

  // Voice search
  const startVoiceSearch = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setVoiceError('Voice search is not supported in your browser.')
      return
    }
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = (event) => {
      setIsListening(false)
      if (event.error !== 'no-speech') setVoiceError('Voice recognition failed. Try again.')
    }
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setQuery(transcript)
      setVoiceError(null)
      // Auto-search after voice input
      setTimeout(() => go(`/search?q=${encodeURIComponent(transcript)}`, transcript), 400)
    }
    recognition.start()
  }, [go])

  const stopVoice = useCallback(() => {
    setIsListening(false)
    if (recognitionRef.current) recognitionRef.current.stop()
  }, [])

  const clearRecent = (term, e) => {
    e.stopPropagation()
    const updated = getRecentSearches().filter(r => r !== term)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
    setRecentSearches(updated)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          paddingTop: '10vh'
        }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)'
            }}
            onClick={onClose}
          />

          {/* Search Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            style={{
              position: 'relative',
              width: '100%', maxWidth: 680,
              background: 'rgba(26, 21, 37, 0.95)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              borderRadius: 20,
              boxShadow: '0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08), 0 0 40px rgba(0, 240, 255, 0.05)',
              overflow: 'hidden',
              display: 'flex', flexDirection: 'column'
            }}
          >
            {/* Input Header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)'
            }}>
              {isListening
                ? <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                    <Mic size={24} color="var(--color-accent-rose)" strokeWidth={2.5} />
                  </motion.div>
                : <Search size={24} color="var(--color-accent-cyan)" strokeWidth={2.5} />
              }
              <input
                ref={inputRef}
                value={query}
                onChange={e => { setQuery(e.target.value); setActiveIndex(0) }}
                placeholder={isListening ? 'Listening...' : 'Search assets, people, departments...'}
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  fontSize: 20, fontWeight: 500, color: isListening ? 'var(--color-accent-rose)' : 'var(--color-text-primary)'
                }}
              />
              {/* Voice search button */}
              <button
                onClick={isListening ? stopVoice : startVoiceSearch}
                title={isListening ? 'Stop listening' : 'Voice search'}
                style={{
                  width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: isListening ? 'rgba(255, 51, 102, 0.15)' : 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                  boxShadow: isListening ? '0 0 20px rgba(255,51,102,0.3)' : 'none'
                }}
              >
                {isListening
                  ? <MicOff size={16} color="var(--color-accent-rose)" />
                  : <Mic size={16} color="var(--color-text-muted)" />
                }
              </button>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: 6,
                color: 'var(--color-text-muted)', fontSize: 12, fontWeight: 600
              }}>
                <Command size={12} strokeWidth={2.5} /> K
              </div>
            </div>

            {voiceError && (
              <div style={{ padding: '8px 24px', background: 'rgba(255,51,102,0.1)', color: 'var(--color-accent-rose)', fontSize: 12 }}>
                {voiceError}
              </div>
            )}

            {/* Results */}
            <div style={{ maxHeight: 480, overflowY: 'auto', padding: '12px' }} className="no-scrollbar">

              {/* Recent Searches - only show when no query */}
              {query.trim().length === 0 && recentSearches.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ padding: '4px 8px 8px', fontSize: 11, fontWeight: 700, color: 'var(--color-text-disabled)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Recent
                  </div>
                  {recentSearches.map((term, i) => (
                    <div
                      key={i}
                      onClick={() => go(`/search?q=${encodeURIComponent(term)}`, term)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                        borderRadius: 10, cursor: 'pointer', transition: 'all 0.1s',
                        color: 'var(--color-text-secondary)'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Clock size={14} color="var(--color-text-muted)" />
                      <span style={{ flex: 1, fontSize: 14 }}>{term}</span>
                      <button onClick={e => clearRecent(term, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                        <X size={12} color="var(--color-text-muted)" />
                      </button>
                    </div>
                  ))}
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '8px 0' }} />
                </div>
              )}

              {/* Quick Links / Search Results */}
              <div>
                <div style={{ padding: '4px 8px 8px', fontSize: 11, fontWeight: 700, color: 'var(--color-text-disabled)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {query.trim().length === 0 ? 'Quick Navigation' : 'Results'}
                </div>
                {allResults.length === 0 ? (
                  <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 14 }}>
                    No results found. Press Enter to search.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {allResults.map((item, i) => {
                      const isSelected = i === activeIndex
                      return (
                        <div
                          key={i}
                          onMouseEnter={() => setActiveIndex(i)}
                          onClick={() => item.category === 'Search' ? go(item.path, query) : go(item.path)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 14,
                            padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
                            background: isSelected ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                            border: isSelected ? '1px solid rgba(0, 240, 255, 0.2)' : '1px solid transparent',
                            color: isSelected ? 'var(--color-accent-cyan)' : 'var(--color-text-primary)',
                            transition: 'all 0.1s'
                          }}
                        >
                          <div style={{
                            width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: isSelected ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255,255,255,0.05)'
                          }}>
                            <item.icon size={16} strokeWidth={2.5} color={isSelected ? 'var(--color-accent-cyan)' : 'var(--color-text-muted)'} />
                          </div>
                          <div style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>
                            {item.label}
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--color-text-disabled)', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.05em' }}>
                            {item.category?.toUpperCase()}
                          </span>
                          {isSelected && <ArrowRight size={14} strokeWidth={2} color="var(--color-accent-cyan)" />}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '10px 24px', borderTop: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', gap: 16, fontSize: 11, color: 'var(--color-text-disabled)'
            }}>
              <span>↑↓ navigate</span>
              <span>↵ open</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Mic size={10} /> voice search
              </span>
              <span style={{ marginLeft: 'auto' }}>ESC close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
