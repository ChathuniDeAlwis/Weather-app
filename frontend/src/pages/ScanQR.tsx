import { useState } from 'react'
import { QrReader } from 'react-qr-reader'
import axios from 'axios'

export default function ScanQR() {
  const [assetId, setAssetId] = useState('')
  const [asset, setAsset] = useState<any>(null)

  const onResult = async (result: any) => {
    const text = result?.text
    if (text && text !== assetId) {
      setAssetId(text)
      try {
        const { data } = await axios.get(`/api/assets/${encodeURIComponent(text)}`)
        setAsset(data)
      } catch (e) {
        setAsset({ error: 'Not found' })
      }
    }
  }

  return (
    <div className="container">
      <h2>Scan QR</h2>
      <div className="card">
        <QrReader constraints={{ facingMode: 'environment' }} onResult={(res, err)=>{ if(res) onResult(res) }} containerStyle={{ width: '100%' }} />
      </div>
      {assetId && <div className="card">Scanned: {assetId}</div>}
      {asset && (
        <div className="card">
          {asset.error ? <div>{asset.error}</div> : (
            <div>
              <p><b>Name:</b> {asset.name}</p>
              <p><b>Price:</b> ${asset.price}</p>
              <p><b>Usage:</b> {asset.usage_info}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
