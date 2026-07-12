import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { searchApi } from '../../api/services'
import { Package, Users, Wrench, ArrowLeftRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['search', q],
    queryFn: () => searchApi.search(q),
    enabled: q.length > 1,
  })

  const results = data?.data || {}

  return (
    <div className="page-header page-body" style={{ paddingTop: 32, maxWidth: 900, margin: '0 auto' }}>
      <h2 className="section-title" style={{ marginBottom: 8 }}>
        Search Results
      </h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 24 }}>
        {q ? `Showing results for "${q}"` : 'Enter a search term'}
      </p>

      {!q && (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>Use the search bar at the top to search assets, employees, and more.</p>
        </div>
      )}

      {isLoading && (
        <div>{[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 60, marginBottom: 12 }} />)}</div>
      )}

      {q && !isLoading && data && (
        <div>
          {(results.assets?.length > 0) && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: 10 }}>
                <Package size={14} style={{ display: 'inline', marginRight: 6 }} />Assets ({results.assets.length})
              </h4>
              {results.assets.map(a => (
                <div key={a.id} className="glass-card" style={{ padding: '12px 16px', marginBottom: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
                  onClick={() => navigate(`/assets/${a.id}`)}>
                  <Package size={16} color="var(--color-accent-violet-light)" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary)' }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{a.assetTag} · {a.categoryName}</div>
                  </div>
                  <span className={`badge badge-${a.status?.toLowerCase()}`} style={{ marginLeft: 'auto' }}>{a.status}</span>
                </div>
              ))}
            </div>
          )}

          {(results.employees?.length > 0) && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: 10 }}>
                <Users size={14} style={{ display: 'inline', marginRight: 6 }} />Employees ({results.employees.length})
              </h4>
              {results.employees.map(e => (
                <div key={e.id} className="glass-card" style={{ padding: '12px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="avatar avatar-sm">{e.firstName?.[0]}{e.lastName?.[0]}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary)' }}>{e.fullName}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{e.email} · {e.departmentName}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!results.assets?.length && !results.employees?.length && (
            <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
              <p style={{ color: 'var(--color-text-muted)' }}>No results found for "{q}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
