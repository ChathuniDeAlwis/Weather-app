import { useEffect, useState } from 'react'
import { searchRareBooks } from '../api'

export default function RareBooks() {
	const [q, setQ] = useState('')
	const [results, setResults] = useState([])

	useEffect(() => {
		load()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	async function load() {
		const res = await searchRareBooks(q)
		setResults(res.results || [])
	}

	return (
		<div style={{ paddingBottom: 72 }}>
			<h2>Rare Books</h2>
			<div style={{ display: 'flex', gap: 8 }}>
				<input value={q} onChange={(e) => setQ(e.target.value)} placeholder='Search title' style={{ flex: 1, padding: 8 }} />
				<button onClick={load}>Search</button>
			</div>
			<div style={{ marginTop: 12 }}>
				{results.map((rb) => (
					<div key={rb.id} style={card}>
						<div><strong>{rb.title}</strong> — {rb.author}</div>
						<p style={{ margin: '6px 0' }}>{rb.abstract}</p>
						<button onClick={() => alert('Download started (demo)')}>Download PDF</button>
					</div>
				))}
			</div>
		</div>
	)
}

const card = { padding: 12, border: '1px solid #eee', borderRadius: 8, marginBottom: 8 }