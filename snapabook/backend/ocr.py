import os
from PIL import Image
import pytesseract

# Allow override via env
_tesseract_cmd = os.getenv("TESSERACT_CMD")
if _tesseract_cmd:
	pytesseract.pytesseract.tesseract_cmd = _tesseract_cmd


def extract_text_from_image(image_path: str) -> str:
	image = Image.open(image_path)
	if image.mode != "RGB":
		image = image.convert("RGB")
	text = pytesseract.image_to_string(image)
	return text or ""


def extract_text_from_pil(image: Image.Image) -> str:
	if image.mode != "RGB":
		image = image.convert("RGB")
	return pytesseract.image_to_string(image) or ""