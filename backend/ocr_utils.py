import pytesseract
from PIL import Image


def extract_text_from_image(image: Image.Image) -> str:
    image = image.convert('RGB')
    # Basic preprocessing could be added here if needed
    text = pytesseract.image_to_string(image)
    return ' '.join(text.split())

