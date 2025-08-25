# Snap-a-Book

Mobile-friendly web app with a Python Flask backend, React frontend, and MySQL database.

Features
- Book Cover Scanner: OCR via Tesseract to match against `books`
- QR Code Scanner: fetch asset details by `asset_id`
- Rare Books Search: search `rare_books`, mock PDF download

Tech
- Backend: Flask, pytesseract, Pillow, mysql-connector-python, flask-cors
- Frontend: React (Vite), react-router-dom, react-qr-reader, react-camera-pro
- Database: MySQL 8+

Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL 8+
- Tesseract OCR

Install Tesseract
```bash
# Debian/Ubuntu
sudo apt update && sudo apt install -y tesseract-ocr libtesseract-dev
# macOS
brew install tesseract
```

Database Setup
```bash
mysql -u root -p < /workspace/db/schema.sql
mysql -u root -p < /workspace/db/seed.sql
```

Backend Setup
```bash
cd /workspace/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your DB credentials
python app.py
```
Backend runs on `http://localhost:5000`.

Frontend Setup
```bash
cd /workspace/frontend/snapabook-frontend
cp .env.example .env  # optional; defaults to localhost:5000
npm install
npm run dev -- --host
```
Frontend runs on `http://localhost:5173`.

Environment
- In backend `.env`, set `FRONTEND_ORIGIN=http://localhost:5173`
- In frontend `.env`, `VITE_API_BASE=http://localhost:5000` if non-default
- Allow camera permissions in the browser

API Summary
- POST `/api/scan_book` (form-data `image`): OCR match book
- GET `/api/assets/:asset_id`: fetch asset
- GET `/api/rare_books/search?q=Title`: search rare books
- POST `/api/donations` JSON `{ book_title, donor_name, contact_number, email }`

Notes
- For Feature 1 testing, try a Clean Code cover image; DB is pre-seeded.
