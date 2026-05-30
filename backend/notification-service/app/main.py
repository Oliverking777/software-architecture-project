import logging
import asyncio
from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.consumers.alert_consumer import start_alert_consumer

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(start_alert_consumer())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass

app = FastAPI(
    title="Notification Service — DSAS",
    version="1.0.0",
    lifespan=lifespan
)

@app.get("/health")
async def health():
    return {"status": "UP", "service": "notification-service"}
