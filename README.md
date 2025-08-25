# Snap-a-Book

Mobile-first web app to scan book covers (OCR), scan QR codes for assets, and search rare books.

## Tech Stack
- Backend: Python Flask, pytesseract OCR, MySQL (mysql-connector-python), CORS
- Frontend: React (Vite), react-router-dom, react-qr-reader, react-camera-pro
- DB: MySQL with seed data

## Quick Start (Docker Compose)
1. Create and run services:
```
docker compose up --build
```
2. Backend API: http://localhost:5000
3. Frontend (dev):
```
cd frontend
npm install
# set API base URL for dev
echo "VITE_API_BASE_URL=http://localhost:5000" > .env
npm run dev
```
Visit the shown URL (e.g., http://localhost:5173).

## Manual Setup (no Docker)
- Install Tesseract OCR:
```
sudo apt-get update -y
sudo apt-get install -y tesseract-ocr libtesseract-dev
```
- Python env and packages:
```
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
```
- MySQL database:
```
# ensure MySQL is running and accessible
mysql -u root -p < db/schema.sql
```
- Run backend:
```
export MYSQL_HOST=127.0.0.1 MYSQL_USER=root MYSQL_PASSWORD=yourpass MYSQL_DATABASE=snapabook
python backend/app.py
```
- Frontend dev:
```
cd frontend
npm install
echo "VITE_API_BASE_URL=http://localhost:5000" > .env
npm run dev
```

## Features
- Book Cover Scanner
  - Big "Scan Book Cover" button opens camera
  - Upload image alternative
  - Sends image to /api/scan -> OCR -> book match
  - If found: show details and availability
  - If not: prompt donation with pre-filled title text
- QR Code Scanner
  - Uses device camera via `react-qr-reader`
  - Calls GET /api/assets/<asset_id> and displays details
- Rare Books Search
  - Search titles -> /api/rare-books
  - Show title, author, abstract, and Download action (simulated)

## Sample Data
Seeded via `db/schema.sql`:
- Book: Clean Code (available)
- Assets: BOOK123, BOOK456, BOOK789
- Rare Books: 3 classic works (PDF paths in `/workspace/assets/rare/*.pdf`)

## Notes
- On mobile, allow camera permissions for both scanners.
- OCR works best with clear, well-lit cover photos.
- For production, secure CORS and validate inputs more strictly.