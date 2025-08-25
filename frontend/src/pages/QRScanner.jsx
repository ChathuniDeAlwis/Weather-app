import { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { api } from '../api';

export default function QRScanner() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const onResult = async (data, err) => {
    if (data?.text) {
      try {
        setError('');
        const assetId = data.text.trim();
        const resp = await api.get(`/api/assets/${encodeURIComponent(assetId)}`);
        setResult(resp.data);
      } catch (e) {
        setError(e?.response?.data?.error || e.message);
      }
    }
    if (err) {
      // ignore continuous camera decode errors
    }
  };

  return (
    <div style={{ padding: 8 }}>
      <h2>QR Code Scanner</h2>
      <div style={{ height: 300 }}>
        <QrReader onResult={onResult} constraints={{ facingMode: 'environment' }} />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {result && (
        <div style={{ marginTop: 12 }}>
          <p><strong>Asset:</strong> {result.name}</p>
          <p>Price: ${result.price}</p>
          <p>Usage: {result.usage_info}</p>
        </div>
      )}
    </div>
  );
}

