import { useState } from 'react';
import { api } from '../api';

export default function RareBooks() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const search = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const resp = await api.get('/api/rare-books', { params: { query } });
      setResults(resp.data);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    }
  };

  const download = async (id) => {
    const resp = await api.get(`/api/rare-books/${id}/download`);
    if (resp.data?.success) alert('Download started (simulated).');
  };

  return (
    <div style={{ padding: 8 }}>
      <h2>Rare Books</h2>
      <form onSubmit={search} style={{ display: 'flex', gap: 8 }}>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search titles" style={{ flex: 1, padding: 8 }} />
        <button type="submit">Search</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {results.map((r) => (
          <li key={r.id} style={{ marginTop: 8 }}>
            <strong>{r.title}</strong> by {r.author}
            <p style={{ margin: '4px 0' }}>{r.abstract}</p>
            <button onClick={() => download(r.id)}>Download PDF</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

