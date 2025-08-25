import { useState } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import { fetchAsset } from '../api'

export default function QRScanner() {
	const [assetId, setAssetId] = useState('')
	const [asset, setAsset] = useState(null)
	const [error, setError] = useState('')

	async function handleScan(results) {
		const val = Array.isArray(results) ? results[0]?.rawValue : results?.text || ''
		if (!val) return
		setAssetId(val)
		const res = await fetchAsset(val)
		if (res && !res.error) {
			setAsset(res)
			setError('')
		} else {
			setAsset(null)
			setError(res?.error || 'Not found')
		}
	}

	return (
		<div style={{ paddingBottom: 72 }}>
			<h2>Scan QR</h2>
			<Scanner onScan={handleScan} constraints={{ facingMode: 'environment' }} styles={{ container: { width: '100%', height: 320 } }} />
			{assetId && <p>Scanned: {assetId}</p>}
			{asset && (
				<div style={card}>
					<div><strong>{asset.name}</strong></div>
					<div>ID: {asset.asset_id}</div>
					<div>Price: ${asset.price}</div>
					<div>{asset.usage_info}</div>
				</div>
			)}
			{error && <div style={{ color: 'red' }}>{error}</div>}
		</div>
	)
}

const card = { padding: 12, border: '1px solid #eee', borderRadius: 8, marginTop: 12 }