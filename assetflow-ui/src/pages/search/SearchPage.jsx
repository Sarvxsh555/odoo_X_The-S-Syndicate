import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchApi, assetApi, categoryApi, departmentApi } from '../../api/services'
import { Search as SearchIcon, Tag, Package, User, Wrench, X, Filter, ScanLine, Mic, MicOff, Clock, Bookmark, BookmarkCheck, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import QrScanner from '../../components/ui/QrScanner'
import { motion, AnimatePresence } from 'framer-motion'

const TYPE_ICONS = { ASSET: Package, ALLOCATION: User, MAINTENANCE: Wrench }
const TYPE_PATHS = { ASSET: '/assets/', ALLOCATION: '/allocations', MAINTENANCE: '/maintenance' }
const TYPE_COLORS = { ASSET: 'var(--color-accent-cyan)', ALLOCATION: 'var(--color-accent-violet)', MAINTENANCE: 'var(--color-accent-amber)' }

function getSavedSearches() {
  try { return JSON.parse(localStorage.getItem('savedSearches') || '[]') } catch { return [] }
}
function getRecentSearches() {
  try { return JSON.parse(localStorage.getItem('recentSearches') || '[]') } catch { return [] }
}
function addRecentSearch(q) {
  const r = getRecentSearches().filter(x => x !== q)
  r.unshift(q)
  localStorage.setItem('recentSearches', JSON.stringify(r.slice(0, 8)))
}

export default function SearchPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [debouncedQuery, setDebouncedQuery] = useState(searchParams.get('q') || '')
  const [showFilters, setShowFilters] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [savedSearches, setSavedSearches] = useState(getSavedSearches())
  const [recentSearches, setRecentSearches] = useState(getRecentSearches())
  const [filters, setFilters] = useState({ type: '', status: '', categoryId: '', departmentId: '' })
  const recognitionRef = useRef(null)
  const inputRef = useRef(null)

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
      if (query.trim().length > 1) addRecentSearch(query.trim())
    }, 350)
    return () => clearTimeout(timer)
  }, [query])

  // Sync URL param
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) { setQuery(q); setDebouncedQuery(q) }
  }, [searchParams])

  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: () => categoryApi.getAll({ size: 100 }) })
  const { data: departmentsData } = useQuery({ queryKey: ['departments'], queryFn: () => departmentApi.getAll({ size: 100 }) })

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery, filters],
    queryFn: () => searchApi.search(debouncedQuery, filters.type ? [filters.type] : undefined),
    enabled: debouncedQuery.length > 1,
  })

  // Also search assets directly for richer results
  const { data: assetData } = useQuery({
    queryKey: ['search', 'assets', debouncedQuery, filters],
    queryFn: () => assetApi.getAll({
      search: debouncedQuery,
      status: filters.status || undefined,
      categoryId: filters.categoryId || undefined,
      departmentId: filters.departmentId || undefined,
      size: 20
    }),
    enabled: debouncedQuery.length > 1 && (!filters.type || filters.type === 'ASSET'),
  })

  const handleResultClick = (result) => {
    if (result.type === 'ASSET') navigate(`${TYPE_PATHS[result.type]}${result.entityId}`)
    else navigate(TYPE_PATHS[result.type])
  }

  const handleScan = (decodedText) => {
    setShowScanner(false)
    let q = decodedText
    if (decodedText.includes('ASSETFLOW|')) q = decodedText.split('|')[1] || decodedText
    setQuery(q)
  }

  // Voice Search
  const startVoice = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const rec = new SR()
    recognitionRef.current = rec
    rec.lang = 'en-US'
    rec.onstart = () => setIsListening(true)
    rec.onend = () => setIsListening(false)
    rec.onresult = (e) => { setQuery(e.results[0][0].transcript); setIsListening(false) }
    rec.start()
  }, [])

  const saveSearch = () => {
    if (!query.trim()) return
    const updated = [...new Set([query.trim(), ...savedSearches])].slice(0, 10)
    setSavedSearches(updated)
    localStorage.setItem('savedSearches', JSON.stringify(updated))
  }

  const removeSaved = (term) => {
    const updated = savedSearches.filter(s => s !== term)
    setSavedSearches(updated)
    localStorage.setItem('savedSearches', JSON.stringify(updated))
  }

  const isSaved = savedSearches.includes(query.trim())
  const globalResults = data?.data?.content || []
  const assetResults = (assetData?.data?.content || []).map(a => ({
    entityId: a.id, type: 'ASSET', title: a.name, description: `${a.assetTag} • ${a.status} • ${a.category || ''}`
  }))

  // Merge: prefer global search, fallback to direct asset search
  const results = globalResults.length > 0 ? globalResults : assetResults

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="page-body" style={{ padding: '32px', maxWidth: 840, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>Advanced Search</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
          Find assets, allocations, and records. Use voice or QR scan.
        </p>
      </div>

      {/* Search Bar */}
      <div style={{
        background: 'rgba(31, 25, 46, 0.8)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)'
      }}>
        {isListening
          ? <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}><Mic size={20} color="var(--color-accent-rose)" /></motion.div>
          : <SearchIcon size={20} color="var(--color-accent-cyan)" />
        }
        <input
          ref={inputRef}
          autoFocus
          style={{ border: 'none', background: 'transparent', flex: 1, fontSize: 16, padding: '8px 0', outline: 'none', color: 'white' }}
          placeholder={isListening ? 'Listening... speak now' : 'Search by name, tag, serial number, employee...'}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query && (
          <>
            <button
              onClick={isSaved ? () => removeSaved(query.trim()) : saveSearch}
              title={isSaved ? 'Remove saved search' : 'Save this search'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: isSaved ? 'var(--color-accent-cyan)' : 'var(--color-text-muted)', padding: 4 }}
            >
              {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            </button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4 }} onClick={() => setQuery('')}>
              <X size={16} />
            </button>
          </>
        )}
        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.08)' }} />
        {/* Voice search */}
        <button
          onClick={isListening ? () => { setIsListening(false); recognitionRef.current?.stop() } : startVoice}
          style={{ background: isListening ? 'rgba(255,51,102,0.15)' : 'rgba(255,255,255,0.05)', border: 'none', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          {isListening ? <MicOff size={15} color="var(--color-accent-rose)" /> : <Mic size={15} color="var(--color-text-muted)" />}
        </button>
        {/* QR scan */}
        <button
          onClick={() => setShowScanner(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.2)', color: 'var(--color-accent-cyan)', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          <ScanLine size={14} /> Scan QR
        </button>
      </div>

      {/* Advanced Filters Panel */}
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: activeFilterCount > 0 ? 'var(--color-accent-cyan)' : 'var(--color-text-secondary)',
            transition: 'all 0.2s'
          }}
        >
          <Filter size={14} />
          Advanced Filters
          {activeFilterCount > 0 && (
            <span style={{ background: 'var(--color-accent-cyan)', color: '#1A1525', width: 16, height: 16, borderRadius: '50%', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeFilterCount}
            </span>
          )}
          {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 12, marginTop: 12, padding: 20,
                background: 'rgba(31, 25, 46, 0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12
              }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: 10 }}>Type</label>
                  <select className="input" style={{ padding: '6px 10px', fontSize: 12 }} value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
                    <option value="">All Types</option>
                    <option value="ASSET">Assets</option>
                    <option value="ALLOCATION">Allocations</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: 10 }}>Status</label>
                  <select className="input" style={{ padding: '6px 10px', fontSize: 12 }} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                    <option value="">All Statuses</option>
                    {['AVAILABLE', 'ALLOCATED', 'MAINTENANCE', 'LOST', 'RETIRED'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: 10 }}>Category</label>
                  <select className="input" style={{ padding: '6px 10px', fontSize: 12 }} value={filters.categoryId} onChange={e => setFilters(f => ({ ...f, categoryId: e.target.value }))}>
                    <option value="">All Categories</option>
                    {(categoriesData?.data?.content || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: 10 }}>Department</label>
                  <select className="input" style={{ padding: '6px 10px', fontSize: 12 }} value={filters.departmentId} onChange={e => setFilters(f => ({ ...f, departmentId: e.target.value }))}>
                    <option value="">All Departments</option>
                    {(departmentsData?.data?.content || []).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button onClick={() => setFilters({ type: '', status: '', categoryId: '', departmentId: '' })} className="btn-ghost btn-sm" style={{ width: '100%' }}>
                    Clear Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recent & Saved Searches (when no query) */}
      {debouncedQuery.length <= 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {recentSearches.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace', color: 'var(--color-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Recent</div>
              {recentSearches.map((term, i) => (
                <div key={i} onClick={() => setQuery(term)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, cursor: 'pointer', color: 'var(--color-text-secondary)', marginBottom: 4 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Clock size={13} color="var(--color-text-muted)" />
                  <span style={{ flex: 1, fontSize: 13 }}>{term}</span>
                  <ArrowRight size={12} color="var(--color-text-disabled)" />
                </div>
              ))}
            </div>
          )}
          {savedSearches.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace', color: 'var(--color-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Saved Searches</div>
              {savedSearches.map((term, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, cursor: 'pointer', color: 'var(--color-text-secondary)', marginBottom: 4 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Bookmark size={13} color="var(--color-accent-cyan)" onClick={() => setQuery(term)} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, cursor: 'pointer' }} onClick={() => setQuery(term)}>{term}</span>
                  <X size={12} color="var(--color-text-disabled)" style={{ cursor: 'pointer', flexShrink: 0 }} onClick={() => removeSaved(term)} />
                </div>
              ))}
            </div>
          )}
          {recentSearches.length === 0 && savedSearches.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '64px 0', color: 'var(--color-text-muted)', fontSize: 14 }}>
              <SearchIcon size={40} color="rgba(255,255,255,0.06)" style={{ marginBottom: 16, display: 'block', margin: '0 auto 16px' }} />
              Start typing to search across all records. Use 🎤 for voice search or 📷 to scan a QR code.
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {debouncedQuery.length > 1 && (
        <div>
          {isLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12 }} />)}
            </div>
          )}

          {!isLoading && results.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--color-text-muted)' }}>
              No results found for "<strong>{debouncedQuery}</strong>"
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12, fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {results.length} result{results.length !== 1 ? 's' : ''} for "{debouncedQuery}"
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {results.map(result => {
                  const Icon = TYPE_ICONS[result.type] || Tag
                  const color = TYPE_COLORS[result.type] || 'var(--color-accent-cyan)'
                  return (
                    <motion.div
                      key={`${result.type}-${result.entityId}`}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      whileHover={{ x: 4 }}
                      style={{
                        padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer',
                        background: 'rgba(31, 25, 46, 0.8)', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 12, transition: 'all 0.15s'
                      }}
                      onClick={() => handleResultClick(result)}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,240,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(0,240,255,0.15)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(31, 25, 46, 0.8)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={20} color={color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <span style={{ fontSize: 15, fontWeight: 600 }}>{result.title}</span>
                          <span style={{ fontSize: 9, fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.06em', color, background: `${color}15`, padding: '2px 8px', borderRadius: 4 }}>
                            {result.type}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{result.description}</div>
                      </div>
                      <ArrowRight size={16} color="var(--color-text-disabled)" />
                    </motion.div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}

      {showScanner && <QrScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
    </div>
  )
}
