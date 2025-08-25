import base64
import io
import os
import re
from typing import Optional, Tuple

from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image
import pytesseract
import mysql.connector
from mysql.connector import pooling


def create_app() -> Flask:

\tapp = Flask(__name__)
\tCORS(app)

\t# Database configuration from environment variables
\tdb_config = {
\t\t"host": os.getenv("DB_HOST", "127.0.0.1"),
\t\t"port": int(os.getenv("DB_PORT", "3306")),
\t\t"user": os.getenv("DB_USER", "snap_user"),
\t\t"password": os.getenv("DB_PASSWORD", "snap_password"),
\t\t"database": os.getenv("DB_NAME", "snapabook"),
\t\t"charset": "utf8mb4",
\t\t"autocommit": True,
\t}

\t# Connection pool for efficient DB access on small devices/servers
\tapp.db_pool = pooling.MySQLConnectionPool(pool_name="snap_pool", pool_size=5, **db_config)

\t# Optional: tesseract path override
\ttesseract_cmd = os.getenv("TESSERACT_CMD")
\tif tesseract_cmd:
\t\tpytesseract.pytesseract.tesseract_cmd = tesseract_cmd

\t@app.route("/api/health", methods=["GET"])
\tdef health() -> Tuple[str, int]:
\t\treturn jsonify({"status": "ok"}), 200

\tdef _get_db_connection():
\t\treturn app.db_pool.get_connection()

\tdef _open_image_from_request() -> Optional[Image.Image]:
\t\t"""Accepts either multipart/form-data file under 'image' or JSON with base64 dataURL under 'image'."""
\t\tif "image" in request.files:
\t\t\tfile = request.files["image"]
\t\t\tif file and file.filename:
\t\t\t\treturn Image.open(file.stream).convert("RGB")
\t\t# JSON body path
\t\ttry:
\t\t\tbody = request.get_json(silent=True) or {}
\t\t\tdata_url = body.get("image")
\t\t\tif isinstance(data_url, str) and data_url.startswith("data:image"):
\t\t\t\tbase64_data = data_url.split(",", 1)[1]
\t\t\t\tbinary = base64.b64decode(base64_data)
\t\t\t\treturn Image.open(io.BytesIO(binary)).convert("RGB")
\t\texcept Exception:
\t\t\tpass
\t\treturn None

\tdef _normalize_text(text: str) -> str:
\t\t# Keep letters, numbers, spaces; collapse whitespace
\t\tclean = re.sub(r"[^\w\s]", " ", text, flags=re.UNICODE)
\t\tclean = re.sub(r"\s+", " ", clean)
\t\treturn clean.strip().lower()

\t@app.route("/api/scan_cover", methods=["POST"])
\tdef scan_cover():
\t\timage = _open_image_from_request()
\t\tif image is None:
\t\t\treturn jsonify({"error": "No image received"}), 400

\t\t# Perform OCR
\t\totext = pytesseract.image_to_string(image)
\t\tnormalized = _normalize_text(text)

\t\t# Try to extract a likely title by using the first line(s)
\t\tcandidates = [line.strip() for line in normalized.split("\n") if line.strip()]
\t\t# Also add individual words over length 3 for fuzzy LIKE match
\t\tkeywords = [w for w in re.split(r"\s+", normalized) if len(w) >= 4]

\t\tquery = (
\t\t\t"SELECT id, title, author, publisher, price, availability FROM books WHERE "
\t\t\t"("
\t\t\t+ " OR ".join(["LOWER(title) LIKE %s"] * min(3, len(candidates)))
\t\t\t+ ") OR ("
\t\t\t+ " OR ".join(["LOWER(title) LIKE %s"] * min(5, len(keywords)))
\t\t\t+ ") LIMIT 1"
\t\t)

\t\tparams: list[str] = []
\t\tfor line in candidates[:3]:
\t\t\tparams.append(f"%{line}%")
\t\tfor word in keywords[:5]:
\t\t\tparams.append(f"%{word}%")

\t\tconn = _get_db_connection()
\t\tcursor = conn.cursor(dictionary=True)
\t\ttry:
\t\t\tcursor.execute(query, params)
\t\t\trow = cursor.fetchone()
\t\t\tif row:
\t\t\t\treturn jsonify({"found": True, "book": row, "ocr_text": text})
\t\t\treturn jsonify({"found": False, "ocr_text": text})
\t\tfinally:
\t\t\tcursor.close()
\t\t\tconn.close()

\t@app.route("/api/assets/<asset_id>", methods=["GET"])
\tdef get_asset(asset_id: str):
\t\tconn = _get_db_connection()
\t\tcursor = conn.cursor(dictionary=True)
\t\ttry:
\t\t\tcursor.execute(
\t\t\t\t"SELECT asset_id, name, price, usage_info FROM assets WHERE asset_id = %s LIMIT 1",
\t\t\t\t(asset_id,),
\t\t\t)
\t\t\trow = cursor.fetchone()
\t\t\tif not row:
\t\t\t\treturn jsonify({"error": "Asset not found"}), 404
\t\t\treturn jsonify(row)
\t\tfinally:
\t\t\tcursor.close()
\t\t\tconn.close()

\t@app.route("/api/rare_books", methods=["GET"])
\tdef rare_books_search():
\t\tq = request.args.get("q", "").strip().lower()
\t\tconn = _get_db_connection()
\t\tcursor = conn.cursor(dictionary=True)
\t\ttry:
\t\t\tif not q:
\t\t\t\tcursor.execute(
\t\t\t\t\t"SELECT id, title, author, abstract, pdf_file_path FROM rare_books ORDER BY id DESC LIMIT 20"
\t\t\t\t)
\t\t\telse:
\t\t\t\tcursor.execute(
\t\t\t\t\t"SELECT id, title, author, abstract, pdf_file_path FROM rare_books WHERE LOWER(title) LIKE %s ORDER BY id DESC LIMIT 50",
\t\t\t\t\t(f"%{q}%",),
\t\t\t\t)
\t\t\trows = cursor.fetchall()
\t\t\treturn jsonify({"results": rows})
\t\tfinally:
\t\t\tcursor.close()
\t\t\tconn.close()

\t@app.route("/api/donations", methods=["POST"])
\tdef create_donation():
\t\tdata = request.get_json(force=True)
\t\treq_fields = ["book_title", "donor_name", "contact_number", "email"]
\t\tif not all(f in data and str(data[f]).strip() for f in req_fields):
\t\t\treturn jsonify({"error": "Missing required fields"}), 400
\t\tconn = _get_db_connection()
\t\tcursor = conn.cursor()
\t\ttry:
\t\t\tcursor.execute(
\t\t\t\t"INSERT INTO donations (book_title, donor_name, contact_number, email) VALUES (%s, %s, %s, %s)",
\t\t\t\t(
\t\t\t\t\tdata["book_title"],
\t\t\t\t\tdata["donor_name"],
\t\t\t\t\tdata["contact_number"],
\t\t\t\t\tdata["email"],
\t\t\t\t),
\t\t\t)
\t\t\tconn.commit()
\t\t\treturn jsonify({"success": True})
\t\tfinally:
\t\t\tcursor.close()
\t\t\tconn.close()

\treturn app


app = create_app()

if __name__ == "__main__":
\tapp.run(host="0.0.0.0", port=int(os.getenv("PORT", "5001")), debug=True)

