import os
import io
import difflib
from typing import Optional, Tuple, List, Dict

from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import pytesseract
import mysql.connector
from mysql.connector import pooling
from dotenv import load_dotenv


def create_app() -> Flask:
    load_dotenv()
    app = Flask(__name__)

    # CORS: allow frontend dev server by default; can be overridden via env
    frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    CORS(app, resources={r"/api/*": {"origins": frontend_origin}})

    # Database pool configuration
    dbconfig = {
        "host": os.getenv("DB_HOST", "127.0.0.1"),
        "user": os.getenv("DB_USER", "root"),
        "password": os.getenv("DB_PASSWORD", ""),
        "database": os.getenv("DB_NAME", "snapabook"),
        "port": int(os.getenv("DB_PORT", "3306")),
        "charset": "utf8mb4",
        "autocommit": True,
    }

    app.mysql_pool = pooling.MySQLConnectionPool(
        pool_name="snapabook_pool",
        pool_size=int(os.getenv("DB_POOL_SIZE", "5")),
        pool_reset_session=True,
        **dbconfig,
    )

    def get_conn():
        return app.mysql_pool.get_connection()

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    @app.get("/api/assets/<asset_id>")
    def get_asset(asset_id: str):
        try:
            with get_conn() as conn:
                with conn.cursor(dictionary=True) as cur:
                    cur.execute(
                        "SELECT asset_id, name, price, usage_info FROM assets WHERE asset_id = %s",
                        (asset_id,),
                    )
                    row = cur.fetchone()
                    if not row:
                        return jsonify({"found": False, "message": "Asset not found"}), 404
                    return jsonify({"found": True, "asset": row})
        except Exception as exc:
            return jsonify({"error": str(exc)}), 500

    @app.get("/api/rare_books/search")
    def search_rare_books():
        query = (request.args.get("q") or "").strip()
        if not query:
            return jsonify({"results": []})
        try:
            like = f"%{query.lower()}%"
            with get_conn() as conn:
                with conn.cursor(dictionary=True) as cur:
                    cur.execute(
                        """
                        SELECT id, title, author, abstract, pdf_file_path
                        FROM rare_books
                        WHERE LOWER(title) LIKE %s
                        ORDER BY title ASC
                        LIMIT 25
                        """,
                        (like,),
                    )
                    rows = cur.fetchall() or []
                    return jsonify({"results": rows})
        except Exception as exc:
            return jsonify({"error": str(exc)}), 500

    @app.post("/api/donations")
    def create_donation():
        data = request.get_json(silent=True) or {}
        book_title = (data.get("book_title") or "").strip()
        donor_name = (data.get("donor_name") or "").strip()
        contact_number = (data.get("contact_number") or "").strip()
        email = (data.get("email") or "").strip()
        if not book_title or not donor_name:
            return jsonify({"error": "Missing required fields"}), 400
        try:
            with get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        INSERT INTO donations (book_title, donor_name, contact_number, email)
                        VALUES (%s, %s, %s, %s)
                        """,
                        (book_title, donor_name, contact_number, email),
                    )
            return jsonify({"success": True})
        except Exception as exc:
            return jsonify({"error": str(exc)}), 500

    @app.post("/api/scan_book")
    def scan_book():
        if "image" not in request.files:
            return jsonify({"error": "No image uploaded"}), 400
        file = request.files["image"]
        try:
            image_stream = io.BytesIO(file.read())
            image = Image.open(image_stream)

            # Basic preprocessing for better OCR
            image = image.convert("L")  # grayscale
            extracted_text = pytesseract.image_to_string(image, lang=os.getenv("TESSERACT_LANG", "eng"))

            match, book = find_best_book_match(extracted_text, get_conn)
            if match:
                response = {
                    "found": True,
                    "message": "Book is available",
                    "book": book,
                    "ocr_text": extracted_text,
                }
                return jsonify(response)
            else:
                return jsonify({
                    "found": False,
                    "message": "Book not available",
                    "ocr_text": extracted_text,
                })
        except Exception as exc:
            return jsonify({"error": str(exc)}), 500

    def find_best_book_match(ocr_text: str, conn_factory) -> Tuple[bool, Optional[Dict]]:
        normalized_lines = [
            line.strip()
            for line in ocr_text.splitlines()
            if line and any(ch.isalpha() for ch in line)
        ]
        lowered_lines = [ln.lower() for ln in normalized_lines]

        candidates: List[str] = []
        # Prefer mid-length lines which often contain titles
        for ln in lowered_lines:
            word_count = len(ln.split())
            if 1 <= word_count <= 8:
                candidates.append(ln)
        # Also consider concatenation of first two lines
        if len(lowered_lines) >= 2:
            candidates.append(f"{lowered_lines[0]} {lowered_lines[1]}")

        try:
            with conn_factory() as conn:
                with conn.cursor(dictionary=True) as cur:
                    cur.execute("SELECT id, title, author, publisher, price, availability FROM books")
                    books: List[Dict] = cur.fetchall() or []

            if not books:
                return False, None

            # Fast path: try LIKE queries for top candidate fragments
            top_like_candidate = None
            for cand in candidates[:5]:
                frag = cand[:64].strip()
                if not frag or len(frag) < 3:
                    continue
                like = f"%{frag}%"
                with conn_factory() as conn:
                    with conn.cursor(dictionary=True) as cur:
                        cur.execute(
                            "SELECT id, title, author, publisher, price, availability FROM books WHERE LOWER(title) LIKE %s LIMIT 1",
                            (like,),
                        )
                        row = cur.fetchone()
                        if row:
                            return True, row

            # Fallback: fuzzy match all titles
            titles = [(b["title"], b) for b in books]
            best_score = 0.0
            best_book: Optional[Dict] = None
            for cand in candidates:
                for title, book in titles:
                    score = difflib.SequenceMatcher(None, cand, title.lower()).ratio()
                    if score > best_score:
                        best_score = score
                        best_book = book
            if best_book and best_score >= float(os.getenv("FUZZY_TITLE_THRESHOLD", "0.6")):
                return True, best_book
            return False, None
        except Exception:
            # In case of any DB error, do not crash OCR flow
            return False, None

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=True)