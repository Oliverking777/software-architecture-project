import logging
import asyncio
from fastapi import FastAPI
from contextlib import asynccontextmanager
from py_eureka_client import eureka_client
from app.consumers.report_consumer import start_report_consumer
from app.routers import reports
from app.config import EUREKA_SERVER, SERVICE_NAME, SERVICE_PORT

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await eureka_client.init_async(
        eureka_server=EUREKA_SERVER,
        app_name=SERVICE_NAME,
        instance_port=SERVICE_PORT,
    )
    task = asyncio.create_task(start_report_consumer())
    yield
    # Shutdown
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=SERVICE_PORT)