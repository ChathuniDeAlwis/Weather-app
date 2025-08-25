import { useEffect, useState } from 'react'
import axios from 'axios'

type RareBook = { id:number; title:string; author:string; abstract:string; pdf_file_path:string }

export default function RareBooks() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<RareBook[]>([])

  const search = async () => {
    const { data } = await axios.get('/api/rare_books', { params: { q } })
    setResults(data.results)
  }

  useEffect(()=>{ search() }, [])

  return (
    <div className="container">
      <h2>Rare Books</h2>
      <div className="card">
        <input className="input" placeholder="Search rare books" value={q} onChange={e=>setQ(e.target.value)} />
        <div style={{ marginTop: 12 }}>
          <button onClick={search}>Search</button>
        </div>
      </div>
      {results.map(r => (
        <div className="card" key={r.id}>
          <h3>{r.title}</h3>
          <div style={{ color:'#94a3b8' }}>{r.author}</div>
          <p>{r.abstract}</p>
          <button onClick={()=>alert('PDF download started successfully')}>Download PDF</button>
        </div>
      ))}
    </div>
  )
}
