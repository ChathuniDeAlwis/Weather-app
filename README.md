Snap-a-Book
===========

Mobile-first web app with Flask backend, React frontend, and MySQL database.

Stack
-----
- Backend: Flask, pytesseract, mysql-connector-python, CORS
- Frontend: React (Vite), react-router-dom, react-qr-reader, react-camera-pro
- DB: MySQL

Prerequisites
-------------
- Python 3.10+
- Node.js 18+
- MySQL 8+
- Tesseract OCR engine

Install Tesseract
-----------------
- Ubuntu/Debian: `sudo apt update && sudo apt install -y tesseract-ocr libtesseract-dev`
- Fedora: `sudo dnf install -y tesseract tesseract-langpack-eng`
- macOS (Homebrew): `brew install tesseract`

If tesseract binary is not on PATH, set environment variable `TESSERACT_CMD` to the full path (e.g., `/usr/bin/tesseract`).

Database Setup
--------------
```bash
mysql -u root -p < /workspace/database/schema.sql
mysql -u root -p < /workspace/database/seed.sql

# Create application user (optional)
mysql -u root -p -e "CREATE USER IF NOT EXISTS 'snap_user'@'%' IDENTIFIED BY 'snap_password'; GRANT ALL PRIVILEGES ON snapabook.* TO 'snap_user'@'%'; FLUSH PRIVILEGES;"
```

Backend Setup
-------------
```bash
cd /workspace/backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Environment
export DB_HOST=127.0.0.1
export DB_PORT=3306
export DB_USER=snap_user
export DB_PASSWORD=snap_password
export DB_NAME=snapabook
# export TESSERACT_CMD=/usr/bin/tesseract   # if needed

python app.py
```
Backend runs at `http://localhost:5001`.

Frontend Setup
--------------
```bash
cd /workspace/frontend
npm install
npm run start
```
Frontend runs at `http://localhost:5173` and proxies `/api` to the backend.

Features
--------
- Book Cover Scanner: uses device camera or upload, sends image to `/api/scan_cover`, OCR via pytesseract, matches `books` table, donation flow if not found.
- QR Code Scanner: camera-based QR using `react-qr-reader`, fetches `/api/assets/{asset_id}`.
- Rare Books Search: search `/api/rare_books?q=...`, displays results with a fake PDF download button.

Testing Notes
-------------
- Use the included seed data. Scanning or uploading a cover image of "Clean Code" should match the seeded "Clean Code" row when OCR recognizes the title words.
- For mobile camera permissions, access the frontend over HTTPS on real devices or via localhost in mobile simulators.

Production Tips
---------------
- Behind a reverse proxy, set proper CORS origins and serve the built React app from a static host. Increase MySQL pool size for higher load.
# Weather-app
This program created to display the the current weather status including humidity and wind speed of the country/city entered on the search bar using HTML, CSS and JavaScript.
