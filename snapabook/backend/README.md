# Snap-a-Book Backend (Flask)

## Prerequisites
- Python 3.13+
- MySQL 8.x (or run docker-compose below)
- Tesseract OCR (system binary): `sudo apt-get install -y tesseract-ocr libtesseract-dev libleptonica-dev`

## Setup
1. Copy env and adjust if needed:
   ```bash
   cp .env.example .env
   ```
2. Create venv and install deps:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
3. Start MySQL with schema and sample data using Docker:
   ```bash
   docker compose up -d
   ```
   This exposes MySQL on port 3306 with DB `snapabook` and user `snapabook`/`snapabook_pw`.

## Run
```bash
source .venv/bin/activate
export FLASK_ENV=development
python app.py
```
API runs on `http://localhost:5001`.

## Endpoints
- `POST /api/scan-cover` (multipart `image`): OCR and fuzzy title match
- `GET /api/assets/:asset_id`: Lookup asset
- `GET /api/rare-books?q=Title`: Search rare books
- `POST /api/donations` JSON: `{ book_title, donor_name, contact_number?, email? }`

## Notes
- If Tesseract is installed in a non-standard path, set `TESSERACT_CMD` in `.env`.