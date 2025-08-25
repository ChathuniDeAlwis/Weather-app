# Snap-a-Book
Mobile-friendly web app with Flask backend, React frontend, and MySQL.

## Features
- Book Cover Scanner: camera or upload -> OCR via Tesseract -> fuzzy match in `books`
- QR Code Scanner: scans asset ID -> GET `/api/assets/:id`
- Rare Books Search: query `rare_books`, show abstract and mock PDF download

## Prerequisites
- Node 18+
- Python 3.13+
- MySQL 8.x (or existing MySQL compatible)
- Tesseract OCR binary

Ubuntu install Tesseract:
```bash
sudo apt-get update
sudo apt-get install -y tesseract-ocr libtesseract-dev libleptonica-dev
```

## Backend setup
```bash
cd backend
cp .env.example .env
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```
Create database and seed (Option A: Docker not available in this environment):
```sql
-- Create DB and user in your MySQL server
CREATE DATABASE IF NOT EXISTS snapabook;
CREATE USER IF NOT EXISTS 'snapabook'@'%' IDENTIFIED BY 'snapabook_pw';
GRANT ALL PRIVILEGES ON snapabook.* TO 'snapabook'@'%';
FLUSH PRIVILEGES;
-- Then run schema.sql and seed.sql against DB
```
Or if you have Docker locally, from `backend/` do:
```bash
docker compose up -d
```
Run API:
```bash
source .venv/bin/activate
python app.py
```
API base: `http://localhost:5001`

## Frontend setup
```bash
cd frontend/frontend
npm install
npm run dev -- --host
```
The dev server will print a URL like `http://localhost:5173`. The app expects the API at `VITE_API_BASE` (set in `.env`).

## Test data
- Books include `Clean Code`. Try scanning the provided cover image; OCR should match and show availability.
- Assets include `BOOK123`.
- Rare books have two sample entries.

## Notes
- If Tesseract is installed at a custom path, set `TESSERACT_CMD` in `backend/.env`.
- Camera and QR code scanning require HTTPS or localhost in real mobile browsers.