import { useRef, useState } from 'react'
import { Camera } from 'react-camera-pro'
import { scanCover } from '../api'

export default function ScanCover() {
	const camera = useRef(null)
	const [imgSrc, setImgSrc] = useState(null)
	const [result, setResult] = useState(null)
	const [loading, setLoading] = useState(false)

	async function handleScan(dataUrl) {
		setLoading(true)
		try {
			const formData = new FormData()
			const blob = await (await fetch(dataUrl)).blob()
			formData.append('image', new File([blob], 'capture.jpg', { type: blob.type }))
			const res = await scanCover(formData)
			setResult(res)
		} finally {
			setLoading(false)
		}
	}

	function onTakePhoto() {
		const photo = camera.current?.takePhoto()
		if (photo) {
			setImgSrc(photo)
			handleScan(photo)
		}
	}

	async function onFileChange(e) {
		const file = e.target.files?.[0]
		if (!file) return
		const url = URL.createObjectURL(file)
		setImgSrc(url)
		const formData = new FormData()
		formData.append('image', file)
		setLoading(true)
		try {
			const res = await scanCover(formData)
			setResult(res)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div style={{ paddingBottom: 72 }}>
			<h2>Scan Book Cover</h2>
			<div style={{ height: 320, background: '#000', borderRadius: 8, overflow: 'hidden' }}>
				<Camera ref={camera} facingMode='environment' aspectRatio={4/3} errorMessages={{ noCameraAccessible: 'No camera', permissionDeniedError: 'Permission denied' }} />
			</div>
			<div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
				<button onClick={onTakePhoto}>Capture</button>
				<label style={{ display: 'inline-block' }}>
					<input type='file' accept='image/*' onChange={onFileChange} style={{ display: 'none' }} />
					<span style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: 6 }}>Upload</span>
				</label>
			</div>
			{loading && <p>Processing...</p>}
			{imgSrc && (
				<div style={{ marginTop: 12 }}>
					<img src={imgSrc} alt='preview' style={{ maxWidth: '100%', borderRadius: 8 }} />
				</div>
			)}
			{result && (
				<div style={{ marginTop: 12 }}>
					{result.found ? (
						<div>
							<h3>Matches</h3>
							{result.matches.map((m) => (
								<div key={m.id} style={card}>
									<div><strong>{m.title}</strong></div>
									<div>{m.author} — {m.publisher}</div>
									<div>${m.price} — {m.availability}</div>
									<DonateButton title={m.title} />
								</div>
							))}
						</div>
					) : (
						<div style={card}>Book not recognized</div>
					)}
				</div>
			)}
		</div>
	)
}

function DonateButton({ title }) {
	function openForm() {
		const name = prompt('Your name:')
		if (!name) return
		const phone = prompt('Phone:')
		const email = prompt('Email:')
		fetch(import.meta.env.VITE_API_BASE || 'http://localhost:5001' + '/api/donations', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ book_title: title, donor_name: name, contact_number: phone || '', email: email || '' })
		}).then(r => r.json()).then(() => alert('Thank you!'))
	}
	return <button onClick={openForm}>Want to donate?</button>
}

const card = { padding: 12, border: '1px solid #eee', borderRadius: 8, marginBottom: 8 }