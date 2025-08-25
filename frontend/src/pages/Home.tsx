import { useRef, useState } from 'react'
import axios from 'axios'
import { Camera } from 'react-camera-pro'

export default function Home() {
  const cameraRef = useRef<Camera | null>(null)
  const [imgDataUrl, setImgDataUrl] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showDonate, setShowDonate] = useState(false)
  const [donation, setDonation] = useState({ donor_name: '', contact_number: '', email: '' })

  const capture = async () => {
    if (!cameraRef.current) return
    const photo = cameraRef.current.takePhoto()
    setImgDataUrl(photo)
    setLoading(true)
    try {
      const { data } = await axios.post('/api/scan_cover', { image: photo })
      setResult(data)
      if (!data.found) setShowDonate(true)
    } finally {
      setLoading(false)
    }
  }

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('image', file)
    setLoading(true)
    try {
      const { data } = await axios.post('/api/scan_cover', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResult(data)
      if (!data.found) setShowDonate(true)
    } finally { setLoading(false) }
  }

  const submitDonation = async (title: string) => {
    await axios.post('/api/donations', { book_title: title, ...donation })
    alert('Thank you! Donation info submitted.')
    setShowDonate(false)
  }

  const titlePrefill = result?.found ? result.book.title : (result?.ocr_text?.split('\n')?.[0] || '')

  return (
    <div className="container">
      <h2>Snap-a-Book</h2>
      <div className="card">
        <div className="row">
          <button onClick={capture}>Scan Book Cover</button>
          <label>
            <input type="file" accept="image/*" capture="environment" onChange={onUpload} style={{ display: 'none' }} />
            <span className="input" style={{ display:'inline-block', padding:'12px', cursor:'pointer' }}>Upload Image</span>
          </label>
        </div>
        <div className="card">
          <Camera ref={cameraRef} facingMode="environment" aspectRatio={3/4} />
        </div>
      </div>

      {loading && <div className="card">Scanning...</div>}

      {result && (
        <div className="card">
          {result.found ? (
            <div>
              <h3>Book Found</h3>
              <p><b>Title:</b> {result.book.title}</p>
              <p><b>Author:</b> {result.book.author}</p>
              <p><b>Publisher:</b> {result.book.publisher}</p>
              <p><b>Price:</b> ${result.book.price}</p>
              <p><b>Availability:</b> {result.book.availability}</p>
            </div>
          ) : (
            <div>
              <h3>Book not available</h3>
              <p>We couldn't find this book. Would you like to donate it?</p>
            </div>
          )}
        </div>
      )}

      {showDonate && (
        <div className="card">
          <h3>Donate this book</h3>
          <div className="label">Book title</div>
          <input className="input" value={titlePrefill} readOnly />
          <div className="label">Your name</div>
          <input className="input" value={donation.donor_name} onChange={e=>setDonation({...donation, donor_name:e.target.value})} />
          <div className="label">Phone</div>
          <input className="input" value={donation.contact_number} onChange={e=>setDonation({...donation, contact_number:e.target.value})} />
          <div className="label">Email</div>
          <input className="input" value={donation.email} onChange={e=>setDonation({...donation, email:e.target.value})} />
          <div style={{ marginTop:12 }}>
            <button onClick={()=>submitDonation(titlePrefill || '')}>Submit Donation</button>
          </div>
        </div>
      )}
    </div>
  )
}
