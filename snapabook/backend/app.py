import os
from difflib import SequenceMatcher
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from PIL import Image

from db import query_one, query_all, execute
from ocr import extract_text_from_pil

load_dotenv()

app = Flask(__name__)
CORS(app)


@app.get("/api/health")
def health():
	return {"status": "ok"}


# -----------------
# Utility functions
# -----------------

def _best_book_match_from_text(raw_text: str):
	if not raw_text:
		return None, 0.0
	all_books = query_all("SELECT id, title, author, publisher, price, availability FROM books")
	best = (None, 0.0)
	for book in all_books:
		title = book.get("title", "") or ""
		score = SequenceMatcher(None, title.lower(), raw_text.lower()).ratio()
		if score > best[1]:
			best = (book, score)
	return best


# --------------
# OCR endpoint
# --------------
@app.post("/api/scan-cover")
def scan_cover():
	if "image" not in request.files:
		return jsonify({"error": "No image uploaded"}), 400

	file = request.files["image"]
	if file.filename == "":
		return jsonify({"error": "Empty filename"}), 400

	image = Image.open(file.stream)
	text = extract_text_from_pil(image)
	book, score = _best_book_match_from_text(text)

	response = {
		"ocr_text": text.strip(),
		"match_score": round(score, 3),
		"found": bool(book and score >= 0.35),
	}
	if response["found"]:
		response["book"] = book
	return jsonify(response)


# ----------------
# Assets endpoint
# ----------------
@app.get("/api/assets/<asset_id>")
def get_asset(asset_id: str):
	row = query_one(
		"SELECT asset_id, name, price, usage_info FROM assets WHERE asset_id = %s",
		(asset_id,),
	)
	if not row:
		return jsonify({"error": "Asset not found"}), 404
	return jsonify(row)


# -------------------
# Rare books search
# -------------------
@app.get("/api/rare-books")
def search_rare_books():
	q = request.args.get("q", "").strip()
	if not q:
		rows = query_all("SELECT id, title, author, abstract FROM rare_books ORDER BY id DESC LIMIT 20")
	else:
		like = f"%{q}%"
		rows = query_all(
			"SELECT id, title, author, abstract FROM rare_books WHERE title LIKE %s ORDER BY id DESC LIMIT 20",
			(like,),
		)
	return jsonify(rows)


# -------------------
# Donations endpoint
# -------------------
@app.post("/api/donations")
def create_donation():
	data = request.get_json(force=True)
	book_title = (data.get("book_title") or "").strip()
	donor_name = (data.get("donor_name") or "").strip()
	contact_number = (data.get("contact_number") or "").strip()
	email = (data.get("email") or "").strip()

	if not (book_title and donor_name and (contact_number or email)):
		return jsonify({"error": "Missing required fields"}), 400

	new_id = execute(
		"""
		INSERT INTO donations (book_title, donor_name, contact_number, email)
		VALUES (%s, %s, %s, %s)
		""",
		(book_title, donor_name, contact_number, email),
	)
	return jsonify({"id": new_id, "status": "received"})


if __name__ == "__main__":
	port = int(os.getenv("FLASK_PORT", "5001"))
	host = os.getenv("FLASK_HOST", "0.0.0.0")
	app.run(host=host, port=port, debug=True)