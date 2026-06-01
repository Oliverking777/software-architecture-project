import logging
import asyncio
from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.consumers.patient_consumer import start_geo_consumer
from app.routers import geo
from app.config import settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(start_geo_consumer())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass

app = FastAPI(
    title="Geo Service — DSAS",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(geo.router, prefix="/api/v1/geo", tags=["Geo"])

@app.get("/health")
async def health():
    return {"status": "UP", "service": settings.app_name}
