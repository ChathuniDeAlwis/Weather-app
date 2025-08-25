import { useRef, useState } from 'react'
import axios from 'axios'
import { Camera } from 'react-camera-pro'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function ScanBook() {
  const cameraRef = useRef(null)
  const [imageDataUrl, setImageDataUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [showDonate, setShowDonate] = useState(false)
  const [donation, setDonation] = useState({ donor_name: '', contact_number: '', email: '' })

  const takePhoto = async () => {
    try {
      const photo = cameraRef.current?.takePhoto()
      if (!photo) return
      setImageDataUrl(photo)
    } catch {}
  }

  const onFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImageDataUrl(String(reader.result))
    reader.readAsDataURL(file)
  }

  const submitForOCR = async () => {
    if (!imageDataUrl) return
    setLoading(true)
    setResult(null)
    try {
      const blob = await (await fetch(imageDataUrl)).blob()
      const form = new FormData()
      form.append('image', blob, 'capture.jpg')
      const res = await axios.post(`${API_BASE}/api/scan_book`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(res.data)
      if (!res.data.found) setShowDonate(true)
      else setShowDonate(false)
    } catch (err) {
      setResult({ error: err?.response?.data?.error || err.message })
    } finally {
      setLoading(false)
    }
  }

  const submitDonation = async () => {
    if (!result) return
    const book_title = (result.book?.title) || 'Unknown'
    try {
      await axios.post(`${API_BASE}/api/donations`, {
        book_title,
        ...donation,
      })
      alert('Thank you! Donation submitted.')
      setShowDonate(false)
    } catch (e) {
      alert('Failed to submit donation.')
    }
  }

  return (
    <div>
      <h2>Book Cover Scanner</h2>
      <div className="card" style={{ marginBottom: 12 }}>
        <Camera ref={cameraRef} aspectRatio={3/4} facingMode="environment" errorMessages={{ noCameraAccessible: 'Camera not accessible' }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className="button" onClick={takePhoto}>Scan Book Cover</button>
          <label className="button secondary" htmlFor="upload">Upload</label>
          <input id="upload" type="file" accept="image/*" capture="environment" onChange={onFileChange} style={{ display: 'none' }} />
        </div>
      </div>

      {imageDataUrl && (
        <div className="card" style={{ marginBottom: 12 }}>
          <img src={imageDataUrl} alt="preview" style={{ width: '100%', borderRadius: 8 }} />
          <div style={{ marginTop: 8 }}>
            <button className="button" onClick={submitForOCR} disabled={loading}>{loading ? 'Scanning…' : 'Submit for OCR'}</button>
          </div>
        </div>
      )}

      {result && !result.error && (
        <div className="card">
          {result.found ? (
            <>
              <strong>Book is available</strong>
              <p style={{ marginTop: 6 }}>{result.book.title} by {result.book.author}</p>
              <p>{result.book.publisher} — ${result.book.price} — {result.book.availability}</p>
            </>
          ) : (
            <>
              <strong>Book not available</strong>
              <p style={{ marginTop: 6 }}>Would you like to donate this book?</p>
            </>
          )}
        </div>
      )}

      {result?.error && (
        <div className="card">
          <strong>Error</strong>
          <p style={{ marginTop: 6 }}>{result.error}</p>
        </div>
      )}

      {!result?.found && showDonate && (
        <div className="card" style={{ marginTop: 12 }}>
          <h3>Donate This Book</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            <input placeholder="Your Name" value={donation.donor_name} onChange={(e) => setDonation({ ...donation, donor_name: e.target.value })} />
            <input placeholder="Phone" value={donation.contact_number} onChange={(e) => setDonation({ ...donation, contact_number: e.target.value })} />
            <input placeholder="Email" type="email" value={donation.email} onChange={(e) => setDonation({ ...donation, email: e.target.value })} />
            <button className="button" onClick={submitDonation}>Submit Donation</button>
          </div>
        </div>
      )}
    </div>
  )
}