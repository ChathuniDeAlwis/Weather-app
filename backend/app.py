import os
import io
import re
from typing import Tuple

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from PIL import Image
import pytesseract

from db import get_connection, query_one, query_all, execute

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10 MB


def normalize_text(value: str) -> str:
    if not value:
        return ''
    value = re.sub(r"[^\w\s]", " ", value, flags=re.UNICODE)
    value = re.sub(r"\s+", " ", value, flags=re.UNICODE)
    return value.strip().lower()


def extract_title_candidates(text: str) -> list:
    lines = [normalize_text(l) for l in text.splitlines()]
    candidates = [l for l in lines if len(l) >= 3]
    chunk = normalize_text(text)[:120]
    if chunk:
        candidates.insert(0, chunk)
    seen = set()
    uniq = []
    for c in candidates:
        if c and c not in seen:
            seen.add(c)
            uniq.append(c)
    return uniq[:10]


@app.get("/api/health")
def health() -> Tuple[str, int]:
    return "ok", 200


@app.post("/api/scan")
def scan_book_cover():
    if 'image' not in request.files:
        return jsonify({"error": "image field required"}), 400

    image_file = request.files['image']
    if image_file.filename == '':
        return jsonify({"error": "no file selected"}), 400

    try:
        image_bytes = image_file.read()
        image = Image.open(io.BytesIO(image_bytes))
    except Exception as exc:
        return jsonify({"error": f"invalid image: {exc}"}), 400

    try:
        ocr_text = pytesseract.image_to_string(image)
    except Exception as exc:
        return jsonify({"error": f"ocr_failed: {exc}"}), 500

    candidates = extract_title_candidates(ocr_text)

    cnx = get_connection()
    matched_book = None
    for cand in candidates:
        if not cand:
            continue
        row = query_one(
            cnx,
            "SELECT id, title, author, publisher, price, availability FROM books WHERE LOWER(title) LIKE %s LIMIT 1",
            (f"%{cand.lower()}%",)
        )
        if row:
            matched_book = {
                "id": row[0],
                "title": row[1],
                "author": row[2],
                "publisher": row[3],
                "price": float(row[4]) if row[4] is not None else None,
                "availability": bool(row[5]) if row[5] is not None else None,
            }
            break

    if matched_book:
        return jsonify({"found": True, "book": matched_book, "ocr_text": ocr_text})
    else:
        return jsonify({"found": False, "message": "Book not recognized", "ocr_text": ocr_text})


@app.get("/api/assets/<asset_id>")
def get_asset(asset_id: str):
    cnx = get_connection()
    row = query_one(
        cnx,
        "SELECT asset_id, name, price, usage_info FROM assets WHERE asset_id = %s",
        (asset_id,)
    )
    if not row:
        return jsonify({"error": "Asset not found"}), 404
    return jsonify({
        "asset_id": row[0],
        "name": row[1],
        "price": float(row[2]) if row[2] is not None else None,
        "usage_info": row[3],
    })


@app.get("/api/rare_books/search")
def search_rare_books():
    q = request.args.get('q', '').strip()
    cnx = get_connection()
    if not q:
        rows = query_all(cnx, "SELECT id, title, author, abstract FROM rare_books ORDER BY title LIMIT 20")
    else:
        rows = query_all(
            cnx,
            "SELECT id, title, author, abstract FROM rare_books WHERE title LIKE %s OR author LIKE %s ORDER BY title LIMIT 20",
            (f"%{q}%", f"%{q}%")
        )
    results = [
        {"id": r[0], "title": r[1], "author": r[2], "abstract": r[3]}
        for r in rows
    ]
    return jsonify({"results": results})


@app.get("/api/rare_books/<int:book_id>/download")
def download_rare_book(book_id: int):
    cnx = get_connection()
    row = query_one(
        cnx,
        "SELECT id, title, pdf_file_path FROM rare_books WHERE id = %s",
        (book_id,)
    )
    if not row:
        return jsonify({"error": "Not found"}), 404
    return jsonify({"success": True, "message": "Download started (simulated)", "title": row[1]})


@app.post("/api/donations")
def create_donation():
    data = request.get_json(silent=True) or request.form
    book_title = (data.get('book_title') or '').strip()
    donor_name = (data.get('donor_name') or '').strip()
    contact_number = (data.get('contact_number') or '').strip()
    email = (data.get('email') or '').strip()

    if not book_title or not donor_name or not contact_number or not email:
        return jsonify({"error": "All fields are required"}), 400

    cnx = get_connection()
    execute(
        cnx,
        "INSERT INTO donations (book_title, donor_name, contact_number, email) VALUES (%s, %s, %s, %s)",
        (book_title, donor_name, contact_number, email)
    )
    return jsonify({"success": True}), 201


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5001"))
    app.run(host="0.0.0.0", port=port, debug=True)