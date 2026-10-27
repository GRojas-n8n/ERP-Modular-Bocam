FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    TZ=America/Mexico_City \
    DATA_DIR=/data

# Bibliotecas de WeasyPrint (PDF del informe) y fuentes métricamente compatibles con Arial.
RUN apt-get update \
 && apt-get install -y --no-install-recommends libpango-1.0-0 libpangoft2-1.0-0 libharfbuzz-subset0 \
    fonts-liberation fonts-dejavu-core \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY plantillas ./plantillas
COPY contexto ./contexto

RUN useradd --uid 10001 --create-home bot && mkdir -p /data && chown bot:bot /data
USER bot

CMD ["python", "-m", "app.main"]
