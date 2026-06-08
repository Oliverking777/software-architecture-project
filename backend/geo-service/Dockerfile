FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install \
    --timeout=120 --retries=5 -r requirements.txt

FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /install /usr/local
RUN groupadd -r dsas && useradd -r -g dsas dsas
COPY app/ ./app/
USER dsas
EXPOSE 8088
ENTRYPOINT ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8088"]