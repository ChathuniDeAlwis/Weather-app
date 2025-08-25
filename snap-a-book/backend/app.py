import io
import os
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import pytesseract
from db import get_connection

app = Flask(__name__)
CORS(app)


@app.get("/health")
def health():
	return {"status": "ok"}


@app.post("/api/scan")
def scan_cover():
	if "image" not in request.files:
		return jsonify({"error": "No image uploaded"}), 400
	file_storage = request.files["image"]
	try:
		image_bytes = file_storage.read()
		image = Image.open(io.BytesIO(image_bytes))
		ocr_text = pytesseract.image_to_string(image)
		# Heuristic: pick top candidate tokens (words longer than 3 chars)
		tokens = [t for t in re.split(r"\W+", ocr_text) if len(t) > 3]
		top_tokens = tokens[:8]
		if not top_tokens:
			return jsonify({"found": False, "message": "No text detected"})

		# Build dynamic LIKE query
		likes = []
		params = []
		for t in top_tokens:
			likes.append("title LIKE %s")
			params.append(f"%{t}%")
		where = " OR ".join(likes)
		query = f"SELECT id, title, author, publisher, price, availability FROM books WHERE {where} LIMIT 5"

		with get_connection() as conn:
			cur = conn.cursor(dictionary=True)
			cur.execute(query, params)
			rows = cur.fetchall()

		if rows:
			return jsonify({"found": True, "matches": rows})
		else:
			return jsonify({"found": False, "message": "Book not recognized"})
	except Exception as e:
		return jsonify({"error": str(e)}), 500


@app.get("/api/assets/<asset_id>")
def get_asset(asset_id):
	try:
		with get_connection() as conn:
			cur = conn.cursor(dictionary=True)
			cur.execute(
				"SELECT asset_id, name, price, usage_info FROM assets WHERE asset_id = %s",
				(asset_id,),
			)
			row = cur.fetchone()
			if not row:
				return jsonify({"error": "Asset not found"}), 404
			return jsonify(row)
	except Exception as e:
		return jsonify({"error": str(e)}), 500


@app.get("/api/rare-books")
def rare_books_search():
	q = request.args.get("q", "").strip()
	try:
		with get_connection() as conn:
			cur = conn.cursor(dictionary=True)
			if q:
				cur.execute(
					"SELECT id, title, author, abstract, pdf_file_path FROM rare_books WHERE title LIKE %s ORDER BY id DESC LIMIT 25",
					(f"%{q}%",),
				)
			else:
				cur.execute(
					"SELECT id, title, author, abstract, pdf_file_path FROM rare_books ORDER BY id DESC LIMIT 25"
				)
			rows = cur.fetchall()
			return jsonify({"results": rows})
	except Exception as e:
		return jsonify({"error": str(e)}), 500


@app.post("/api/donations")
def create_donation():
	data = request.get_json(silent=True) or {}
	required = ["book_title", "donor_name", "contact_number", "email"]
	missing = [k for k in required if not data.get(k)]
	if missing:
		return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400
	try:
		with get_connection() as conn:
			cur = conn.cursor()
			cur.execute(
				"""
				INSERT INTO donations (book_title, donor_name, contact_number, email)
				VALUES (%s, %s, %s, %s)
				""",
				(
					data["book_title"],
					data["donor_name"],
					data["contact_number"],
					data["email"],
				),
			)
			conn.commit()
		return jsonify({"success": True})
	except Exception as e:
		return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
	app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5001")), debug=True)