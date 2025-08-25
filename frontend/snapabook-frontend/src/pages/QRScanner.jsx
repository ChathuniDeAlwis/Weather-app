import { useState } from 'react'
import { QrReader } from 'react-qr-reader'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function QRScanner() {
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const onScan = async (data) => {
    if (!data) return
    try {
      const text = typeof data === 'string' ? data : data?.text
      if (!text) return
      // Expect asset_id like BOOK123
      const assetId = String(text).trim()
      const res = await axios.get(`${API_BASE}/api/assets/${encodeURIComponent(assetId)}`)
      setResult(res.data.asset)
      setError('')
    } catch (e) {
      setError('Asset not found')
      setResult(null)
    }
  }

  return (
    <div>
      <h2>QR Code Scanner</h2>
      <div className="card" style={{ marginBottom: 12 }}>
        <QrReader
          constraints={{ facingMode: 'environment' }}
          onResult={(res, err) => {
            if (res) onScan(res.getText ? res.getText() : res?.text)
          }}
          scanDelay={500}
          containerStyle={{ width: '100%' }}
          videoContainerStyle={{ paddingTop: '0' }}
        />
      </div>

      {result && (
        <div className="card">
          <strong>{result.name}</strong>
          <p style={{ marginTop: 6 }}>Asset ID: {result.asset_id}</p>
          <p>Price: ${result.price}</p>
          <p>{result.usage_info}</p>
        </div>
      )}

      {error && (
        <div className="card">
          <strong>Error</strong>
          <p style={{ marginTop: 6 }}>{error}</p>
        </div>
      )}
    </div>
  )
}