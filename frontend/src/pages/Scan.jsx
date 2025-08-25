import { useRef, useState } from 'react';
import { Camera } from 'react-camera-pro';
import { api } from '../api';

export default function Scan() {
  const camera = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const capture = async () => {
    try {
      setError('');
      const photo = camera.current?.takePhoto();
      if (!photo) return;
      setImageSrc(photo);
      await sendToBackend(photo);
    } catch (e) {
      setError(String(e));
    }
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      setImageSrc(reader.result);
      await sendToBackend(file);
    };
    reader.readAsDataURL(file);
  };

  const sendToBackend = async (photoOrFile) => {
    setLoading(true);
    setResult(null);
    try {
      const form = new FormData();
      if (typeof photoOrFile === 'string') {
        // data URL -> blob
        const res = await fetch(photoOrFile);
        const blob = await res.blob();
        form.append('image', blob, 'capture.jpg');
      } else {
        form.append('image', photoOrFile);
      }
      const resp = await api.post('/api/scan', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(resp.data);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  const donate = async (bookTitle) => {
    const donor_name = prompt('Your name');
    const contact_number = prompt('Phone number');
    const email = prompt('Email');
    if (!donor_name || !contact_number || !email) return;
    try {
      await api.post('/api/donations', { book_title: bookTitle, donor_name, contact_number, email });
      alert('Thanks! Donation recorded.');
    } catch (e) {
      alert('Donation failed: ' + (e?.response?.data?.error || e.message));
    }
  };

  return (
    <div style={{ padding: 8 }}>
      <h2>Book Cover Scanner</h2>
      <div style={{ height: 300, borderRadius: 8, overflow: 'hidden', background: '#000' }}>
        <Camera ref={camera} facingMode='environment' aspectRatio={3/4} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button onClick={capture} style={{ flex: 1, padding: 12, fontSize: 16 }}>Scan Book Cover</button>
        <label style={{ flex: 1 }}>
          <span style={{ display: 'inline-block', width: '100%', padding: 12, textAlign: 'center', background: '#eee', borderRadius: 8 }}>Upload Image</span>
          <input type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />
        </label>
      </div>
      {imageSrc && (
        <div style={{ marginTop: 12 }}>
          <img src={imageSrc} alt="preview" style={{ width: '100%', maxHeight: 240, objectFit: 'contain' }} />
        </div>
      )}
      {loading && <p>Processing...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {result && (
        <div style={{ marginTop: 12 }}>
          <p><strong>Extracted:</strong> {result.extracted_text}</p>
          {result.matched ? (
            <div>
              <p><strong>Match:</strong> {result.book.title} by {result.book.author}</p>
              <p>Publisher: {result.book.publisher} | Price: ${result.book.price} | Availability: {result.book.availability}</p>
              <div style={{ background: '#dfffe0', padding: 10, borderRadius: 8 }}>Book is available</div>
            </div>
          ) : (
            <div>
              <div style={{ background: '#ffe0e0', padding: 10, borderRadius: 8 }}>Book not available</div>
              <button onClick={() => donate(result.extracted_text)} style={{ marginTop: 8 }}>Donate this book</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

