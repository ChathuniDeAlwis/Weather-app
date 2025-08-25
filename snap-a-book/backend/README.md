## Snap-a-Book Backend (Flask)

### Prerequisites
- Python 3.10+
- MySQL Server 8+
- Tesseract OCR

Install Tesseract on Debian/Ubuntu:
```bash
sudo apt-get update && sudo apt-get install -y tesseract-ocr libtesseract-dev
```

### Setup
```bash
cd /workspace/snap-a-book/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Create .env
cat > .env << 'EOF'
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=snapabook
EOF

# Initialize database (adjust MySQL credentials as needed)
mysql -u root -pyourpassword < sample_data.sql

# Run server
python app.py
```

### API
- POST `/api/scan` (multipart/form-data: image) → OCR then fuzzy title search in `books`
- GET `/api/assets/{asset_id}` → asset details
- GET `/api/rare-books?q=term` → rare books search
- POST `/api/donations` (JSON) → create donation