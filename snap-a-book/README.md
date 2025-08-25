## Snap-a-Book

Mobile-friendly web app with Flask backend, MySQL database, and React frontend.

### Features
- Book Cover Scanner: Capture/upload cover image, OCR with Tesseract, search `books`
- QR Code Scanner: Scan asset QR, lookup `/api/assets/{asset_id}`
- Rare Books Search: Search `rare_books`, show abstract and mock PDF download
- Donations: Submit a donation with pref-filled title

### Prerequisites
- Python 3.10+
- Node.js 20+
- MySQL Server 8+
- Tesseract OCR

Install Tesseract (Debian/Ubuntu):
```bash
sudo apt-get update && sudo apt-get install -y tesseract-ocr libtesseract-dev
```

### 1) Backend setup
```bash
cd /workspace/snap-a-book/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Create .env (edit password as needed)
cat > .env << 'EOF'
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=snapabook
EOF

# Initialize database
mysql -u root -pyourpassword < sample_data.sql

# Run backend
python app.py  # serves at http://localhost:5001
```

If Tesseract is installed in a non-standard path, optionally set `pytesseract.pytesseract.tesseract_cmd` in `backend/app.py` or export PATH accordingly.

### 2) Frontend setup
```bash
cd /workspace/snap-a-book/frontend
npm install

# Create .env for API base (optional; defaults to http://localhost:5001)
cat > .env << 'EOF'
VITE_API_BASE=http://localhost:5001
EOF

# Start dev server
npm run dev  # http://localhost:5173
```

- Allow camera and microphone permissions in the browser for scanning
- On mobile, use HTTPS or localhost for camera access due to browser security

### 3) Testing the flows
- Book Cover Scanner: Click Scan, capture/upload an image of seeded titles (e.g., "The Great Gatsby"). If matched, details show with Donate button.
- QR Scanner: Scan an asset QR text like `BOOK123` to see details.
- Rare Books: Search for "Principia" and click Download (shows success alert).

### Project Structure
- `backend/`: Flask app, MySQL access, OCR endpoint, sample SQL
- `frontend/`: Vite React app with mobile UI and scanners