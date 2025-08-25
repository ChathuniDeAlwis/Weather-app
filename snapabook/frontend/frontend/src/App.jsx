import { useRef, useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Camera } from 'react-camera-pro'
import './App.css'

const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5001'

function Layout({ children }) {
	return (
		<div style={{ maxWidth: 600, margin: '0 auto', paddingBottom: 72 }}>
			<header style={{ padding: 12, textAlign: 'center', fontWeight: 700 }}>Snap-a-Book</header>
			{children}
			<nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 56, display: 'flex', justifyContent: 'space-around', alignItems: 'center', background: '#111', color: '#fff' }}>
				<Link to="/" style={{ color: '#fff' }}>Scan Cover</Link>
				<Link to="/qr" style={{ color: '#fff' }}>Scan QR</Link>
				<Link to="/rare" style={{ color: '#fff' }}>Rare Books</Link>
			</nav>
		</div>
	)
}

function HomeScan() {
	const [imageFile, setImageFile] = useState(null)
	const [result, setResult] = useState(null)
	const [loading, setLoading] = useState(false)
	const [useCamera, setUseCamera] = useState(false)
	const cameraRef = useRef(null)

	async function onSubmit(e) {
		e.preventDefault()
		if (!imageFile) return
		setLoading(true)
		try {
			const form = new FormData()
			form.append('image', imageFile)
			const res = await fetch(`${apiBase}/api/scan-cover`, { method: 'POST', body: form })
			const data = await res.json()
			setResult(data)
		} finally {
			setLoading(false)
		}
	}

	async function captureAndUpload() {
		if (!cameraRef.current) return
		const photoDataUrl = cameraRef.current.takePhoto()
		const blob = await (await fetch(photoDataUrl)).blob()
		setImageFile(new File([blob], 'capture.jpg', { type: blob.type }))
	}

	return (
		<Layout>
			<div style={{ padding: 16 }}>
				<h2>Book Cover Scanner</h2>
				<div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
					<button type="button" onClick={()=> setUseCamera(v=>!v)}>{useCamera ? 'Use Upload' : 'Use Camera'}</button>
					<button type="button" onClick={captureAndUpload} disabled={!useCamera}>Capture</button>
				</div>
				{useCamera ? (
					<div style={{ width: '100%', maxWidth: 480, aspectRatio: '3 / 4', background: '#000', marginBottom: 8 }}>
						<Camera ref={cameraRef} facingMode="environment" errorMessages={{ noCameraAccessible: 'No camera', permissionDenied: 'Permission denied' }} />
					</div>
				) : null}
				<form onSubmit={onSubmit}>
					{!useCamera && (
						<input type="file" accept="image/*" capture="environment" onChange={(e)=> setImageFile(e.target.files?.[0] || null)} />
					)}
					<div style={{ marginTop: 12 }}>
						<button type="submit" disabled={!imageFile || loading} style={{ width: '100%' }}>{loading ? 'Scanning...' : 'Scan Book Cover'}</button>
					</div>
				</form>

				{result && (
					<div style={{ marginTop: 16 }}>
						<div style={{ fontSize: 12, opacity: 0.7 }}>OCR Text:</div>
						<pre style={{ whiteSpace: 'pre-wrap' }}>{result.ocr_text}</pre>
						{result.found ? (
							<div style={{ marginTop: 12 }}>
								<div><b>{result.book.title}</b> by {result.book.author}</div>
								<div>Publisher: {result.book.publisher}</div>
								<div>Price: ${result.book.price}</div>
								<div style={{ color: 'lime' }}>Book is available ({result.book.availability})</div>
							</div>
						) : (
							<DonatePrompt suggestedTitle={guessTitleFromOcr(result.ocr_text)} />
						)}
					</div>
				)}
			</div>
		</Layout>
	)
}

function guessTitleFromOcr(text) {
	const firstLine = (text || '').split(/\n/).map(s=>s.trim()).filter(Boolean)[0] || ''
	return firstLine.length > 3 ? firstLine : ''
}

function DonatePrompt({ suggestedTitle }) {
	const [open, setOpen] = useState(true)
	const [title, setTitle] = useState(suggestedTitle || '')
	const [name, setName] = useState('')
	const [phone, setPhone] = useState('')
	const [email, setEmail] = useState('')
	const [submitted, setSubmitted] = useState(false)

	async function submitDonation(e) {
		e.preventDefault()
		const res = await fetch(`${apiBase}/api/donations`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ book_title: title, donor_name: name, contact_number: phone, email })
		})
		if (res.ok) setSubmitted(true)
	}

	if (!open) return null
	if (submitted) return <div style={{ marginTop: 12, color: 'orange' }}>Thanks! We received your donation intent.</div>
	return (
		<div style={{ marginTop: 12, border: '1px solid #333', padding: 12, borderRadius: 8 }}>
			<div style={{ marginBottom: 8 }}><b>Book not available.</b> Would you like to donate?</div>
			<form onSubmit={submitDonation}>
				<input placeholder="Book title" value={title} onChange={(e)=> setTitle(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />
				<input placeholder="Your name" value={name} onChange={(e)=> setName(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />
				<input placeholder="Phone" value={phone} onChange={(e)=> setPhone(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />
				<input placeholder="Email" value={email} onChange={(e)=> setEmail(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />
				<button type="submit">Submit Donation</button>
				<button type="button" onClick={()=> setOpen(false)} style={{ marginLeft: 8 }}>Close</button>
			</form>
		</div>
	)
}

import { QrReader } from 'react-qr-reader'
function QRScan() {
	const [result, setResult] = useState(null)
	const [error, setError] = useState('')

	return (
		<Layout>
			<div style={{ padding: 16 }}>
				<h2>QR Code Scanner</h2>
				<div style={{ width: '100%', maxWidth: 400 }}>
					<QrReader
						delay={300}
						onResult={async (scanResult, err) => {
							if (!!scanResult) {
								const text = scanResult?.text
								if (text) {
									try {
										const r = await fetch(`${apiBase}/api/assets/${encodeURIComponent(text)}`)
										const data = await r.json()
										setResult({ input: text, data, ok: r.ok })
									} catch (e) {
										setError('Failed to fetch asset')
									}
								}
							}
							if (!!err) setError(String(err))
						}}
						constraints={{ facingMode: 'environment' }}
					/>
				</div>
				{result && (
					<div style={{ marginTop: 12 }}>
						<div>Scanned: <b>{result.input}</b></div>
						{result.ok ? (
							<div>
								<div>Name: {result.data.name}</div>
								<div>Price: ${result.data.price}</div>
								<div>Usage: {result.data.usage_info}</div>
							</div>
						) : (
							<div style={{ color: 'tomato' }}>Asset not found</div>
						)}
					</div>
				)}
				{error && <div style={{ color: 'tomato', marginTop: 8 }}>{error}</div>}
			</div>
		</Layout>
	)
}

function RareBooks() {
	const [q, setQ] = useState('')
	const [results, setResults] = useState([])
	async function doSearch(e) {
		e.preventDefault()
		const r = await fetch(`${apiBase}/api/rare-books?q=${encodeURIComponent(q)}`)
		const data = await r.json()
		setResults(data)
	}
	return (
		<Layout>
			<div style={{ padding: 16 }}>
				<h2>Rare Books</h2>
				<form onSubmit={doSearch}>
					<input placeholder="Type a title" value={q} onChange={(e)=> setQ(e.target.value)} style={{ width: '100%' }} />
					<button type="submit" style={{ marginTop: 8 }}>Search</button>
				</form>
				<div style={{ marginTop: 12 }}>
					{results.map(r => (
						<div key={r.id} style={{ border: '1px solid #333', borderRadius: 8, padding: 12, marginBottom: 8 }}>
							<div><b>{r.title}</b> — {r.author}</div>
							<div style={{ fontSize: 14, opacity: 0.85 }}>{r.abstract}</div>
							<button onClick={()=> alert('PDF download started (mock)')}>Download PDF</button>
						</div>
					))}
				</div>
			</div>
		</Layout>
	)
}

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<HomeScan />} />
				<Route path="/qr" element={<QRScan />} />
				<Route path="/rare" element={<RareBooks />} />
			</Routes>
		</BrowserRouter>
	)
}
