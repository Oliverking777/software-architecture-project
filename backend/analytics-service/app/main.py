import logging
import asyncio
from fastapi import FastAPI
from contextlib import asynccontextmanager
import py_eureka_client.eureka_client as eureka_client
from app.consumers.patient_consumer import start_patient_consumer, case_counts
from app.config import EUREKA_SERVER, SERVICE_NAME, SERVICE_PORT

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await eureka_client.init_async(
        eureka_server=EUREKA_SERVER,
        app_name=SERVICE_NAME,
        instance_port=SERVICE_PORT,
    )
    task = asyncio.create_task(start_patient_consumer())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass

app = FastAPI(title="Analytics Service — DSAS", version="1.0.0", lifespan=lifespan)

@app.get("/health")
async def health():
    return {"status": "UP", "service": "analytics-service"}

@app.get("/api/v1/analytics/stats")
async def get_stats():
    return {"case_counts": case_counts, "total_tracked": len(case_counts)}

@app.get("/api/v1/analytics/thresholds")
async def get_thresholds():
    return {"cholera": 10, "malaria": 50, "dengue": 20, "mpox": 5, "typhoide": 15}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=SERVICE_PORT)