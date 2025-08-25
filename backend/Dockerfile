FROM python:3.13-slim
RUN apt-get update -y && apt-get install -y tesseract-ocr && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt
COPY . /app
ENV PYTHONUNBUFFERED=1
EXPOSE 5000
CMD ["python", "app.py"]

