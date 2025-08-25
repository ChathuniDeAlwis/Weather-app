import os
import io
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from PIL import Image

from db import get_db_connection
from ocr_utils import extract_text_from_image


def create_app():
    app = Flask(__name__)
    CORS(app)

    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({"status": "ok"})

    @app.route('/api/scan', methods=['POST'])
    def scan_book_cover():
        if 'image' not in request.files:
            return jsonify({"error": "No image uploaded with key 'image'"}), 400

        image_file = request.files['image']
        filename = secure_filename(image_file.filename)

        try:
            image_bytes = image_file.read()
            image_stream = io.BytesIO(image_bytes)
            image = Image.open(image_stream)
        except Exception as exc:
            return jsonify({"error": f"Invalid image: {exc}"}), 400

        try:
            extracted_text = extract_text_from_image(image)
        except Exception as exc:
            return jsonify({"error": f"OCR failed: {exc}"}), 500

        title_candidate = extracted_text.strip()

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Try increasingly permissive searches
        like_query = f"%{title_candidate[:200]}%" if title_candidate else "%"
        sql_candidates = [
            ("SELECT * FROM books WHERE title = %s", (title_candidate,)),
            ("SELECT * FROM books WHERE title LIKE %s", (like_query,)),
        ]

        found_book = None
        for sql, params in sql_candidates:
            cursor.execute(sql, params)
            row = cursor.fetchone()
            if row:
                found_book = row
                break

        cursor.close()
        conn.close()

        if found_book:
            return jsonify({
                "matched": True,
                "extracted_text": extracted_text,
                "book": found_book,
                "message": "Book is available"
            })
        else:
            return jsonify({
                "matched": False,
                "extracted_text": extracted_text,
                "message": "Book not available. Would you like to donate it?"
            })

    @app.route('/api/assets/<asset_id>', methods=['GET'])
    def get_asset(asset_id):
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM assets WHERE asset_id = %s", (asset_id,))
        row = cursor.fetchone()
        cursor.close()
        conn.close()
        if not row:
            return jsonify({"error": "Asset not found"}), 404
        return jsonify(row)

    @app.route('/api/rare-books', methods=['GET'])
    def search_rare_books():
        query = request.args.get('query', '')
        like_query = f"%{query}%"
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT id, title, author, abstract FROM rare_books WHERE title LIKE %s ORDER BY title LIMIT 50",
            (like_query,)
        )
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(rows)

    @app.route('/api/rare-books/<int:book_id>/download', methods=['GET'])
    def download_rare_book(book_id: int):
        # For demo purposes, we just confirm the file exists and return success
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, title, pdf_file_path FROM rare_books WHERE id = %s", (book_id,))
        row = cursor.fetchone()
        cursor.close()
        conn.close()
        if not row:
            return jsonify({"error": "Rare book not found"}), 404
        exists = os.path.isfile(row.get('pdf_file_path') or '')
        return jsonify({
            "success": True,
            "title": row['title'],
            "file_available": bool(exists)
        })

    @app.route('/api/donations', methods=['POST'])
    def create_donation():
        data = request.get_json(silent=True) or {}
        required = ['book_title', 'donor_name', 'contact_number', 'email']
        missing = [k for k in required if not data.get(k)]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO donations (book_title, donor_name, contact_number, email) VALUES (%s, %s, %s, %s)",
            (data['book_title'], data['donor_name'], data['contact_number'], data['email'])
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"success": True}), 201

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))

