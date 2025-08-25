import { useState } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function RareBooks() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const search = async (e) => {
    e?.preventDefault()
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/api/rare_books/search`, { params: { q } })
      setResults(res.data.results || [])
    } finally {
      setLoading(false)
    }
  }

  const downloadPdf = (item) => {
    alert(`Pretend downloading: ${item.pdf_file_path}`)
  }

  return (
    <div>
      <h2>Rare Books</h2>
      <form onSubmit={search} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search titles..." style={{ flex: 1 }} />
        <button className="button" type="submit" disabled={loading}>{loading ? 'Searching…' : 'Search'}</button>
      </form>
      <div style={{ display: 'grid', gap: 8 }}>
        {results.map((r) => (
          <div key={r.id} className="card">
            <strong>{r.title}</strong>
            <p style={{ marginTop: 6 }}>{r.abstract}</p>
            <button className="button" onClick={() => downloadPdf(r)}>Download PDF</button>
          </div>
        ))}
        {!loading && results.length === 0 && (
          <p style={{ opacity: 0.7 }}>No results</p>
        )}
      </div>
    </div>
  )
}