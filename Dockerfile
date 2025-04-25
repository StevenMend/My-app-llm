FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    poppler-utils \
    tesseract-ocr \
    libsm6 \
    libxext6 \
    libxrender1 \
    libmagic1 \
    file && \
    curl -sSL https://install.python-poetry.org | python3 - && \
    ln -s /root/.local/bin/poetry /usr/local/bin/poetry

WORKDIR /app


COPY pyproject.toml poetry.lock README.md ./


RUN poetry config virtualenvs.create false && poetry install --no-interaction --no-ansi --no-root


COPY app ./app

EXPOSE 8000

CMD ["uvicorn", "app.server:app", "--host", "0.0.0.0", "--port", "8000"]

