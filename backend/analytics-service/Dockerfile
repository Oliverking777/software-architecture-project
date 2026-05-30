# Étape 1 : Build
FROM python:3.14-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc build-essential \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Étape 2 : Runtime
FROM python:3.14-slim
WORKDIR /app
COPY --from=builder /install /usr/local
RUN groupadd -r dsas && useradd -r -g dsas dsas
COPY app/ ./app/
USER dsas
EXPOSE 8085
ENTRYPOINT ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8085"]