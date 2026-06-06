import logging
import asyncio
from fastapi import FastAPI
from contextlib import asynccontextmanager
import py_eureka_client.eureka_client as eureka_client
from prometheus_fastapi_instrumentator import Instrumentator
from app.consumers.patient_consumer import start_patient_consumer, case_counts
from app.config import EUREKA_SERVER, SERVICE_NAME, SERVICE_PORT

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")

THRESHOLDS = {"cholera": 10, "malaria": 50, "dengue": 20, "mpox": 5, "typhoide": 15, "default": 30}

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
Instrumentator().instrument(app).expose(app)

@app.get("/health")
async def health():
    return {"status": "UP", "service": "analytics-service"}

@app.get("/api/v1/analytics/stats")
async def get_stats():
    return {"case_counts": case_counts, "total_tracked": len(case_counts)}

@app.get("/api/v1/analytics/thresholds")
async def get_thresholds():
    return THRESHOLDS

@app.get("/api/v1/analytics/alerts")
async def get_alerts():
    alerts = []
    for key, count in case_counts.items():
        parts = key.split(":")
        disease = parts[0] if len(parts) > 0 else key
        region = parts[1] if len(parts) > 1 else "Unknown"
        threshold = THRESHOLDS.get(disease.lower(), THRESHOLDS["default"])
        if count >= threshold:
            severity = "CRITICAL" if count >= threshold * 2 else "HIGH" if count >= threshold * 1.5 else "MEDIUM"
            alerts.append({
                "disease": disease,
                "region": region,
                "cases": count,
                "threshold": threshold,
                "severity": severity,
            })
    return {"alerts": alerts, "count": len(alerts)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=SERVICE_PORT)
