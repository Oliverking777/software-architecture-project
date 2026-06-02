import logging
import asyncio
from fastapi import FastAPI
from contextlib import asynccontextmanager
from py_eureka_client import eureka_client
from app.consumers.alert_consumer import start_alert_consumer
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
    task = asyncio.create_task(start_alert_consumer())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass

app = FastAPI(title="Notification Service — DSAS", version="1.0.0", lifespan=lifespan)

@app.get("/health")
async def health():
    return {"status": "UP", "service": "notification-service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=SERVICE_PORT)