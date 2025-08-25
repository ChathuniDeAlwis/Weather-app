const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001';

export async function scanCover(formData) {
	const res = await fetch(`${API_BASE}/api/scan`, {
		method: 'POST',
		body: formData,
	});
	return res.json();
}

export async function fetchAsset(assetId) {
	const res = await fetch(`${API_BASE}/api/assets/${encodeURIComponent(assetId)}`);
	return res.json();
}

export async function searchRareBooks(query) {
	const url = new URL(`${API_BASE}/api/rare-books`);
	if (query) url.searchParams.set('q', query);
	const res = await fetch(url);
	return res.json();
}

export async function submitDonation(payload) {
	const res = await fetch(`${API_BASE}/api/donations`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});
	return res.json();
}