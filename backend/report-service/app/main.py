import logging
import asyncio
from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.consumers.report_consumer import start_report_consumer
from app.routers import reports

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(start_report_consumer())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass

app = FastAPI(title="Report Service — DSAS", version="1.0.0", lifespan=lifespan)

app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])

@app.get("/health")
async def health():
    return {"status": "UP", "service": "report-service"}
