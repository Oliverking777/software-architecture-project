import aio_pika
import asyncio
import json
import logging
from app.config import settings

logger = logging.getLogger(__name__)

THRESHOLDS = {
    "cholera": 10, "malaria": 50, "dengue": 20,
    "mpox": 5, "typhoide": 15, "default": 30,
}

case_counts: dict = {}

async def start_patient_consumer():
    while True:
        try:
            logger.info("Connexion à RabbitMQ...")
            connection = await aio_pika.connect_robust(settings.rabbitmq_url)
            async with connection:
                channel = await connection.channel()
                await channel.set_qos(prefetch_count=1)

                exchange = await channel.declare_exchange(
                    "patient.exchange",
                    aio_pika.ExchangeType.TOPIC,
                    durable=True
                )
                queue = await channel.declare_queue(
                    "analytics.patient.queue", durable=True
                )
                await queue.bind(exchange, routing_key="patient.case.recorded")
                await queue.bind(exchange, routing_key="patient.case.updated")
                await queue.bind(exchange, routing_key="patient.case.deleted")

                logger.info("En écoute sur analytics.patient.queue")
                logger.info("Exchange: patient.exchange | Keys: patient.case.*")

                async for message in queue:
                    async with message.process():
                        try:
                            data = json.loads(message.body.decode())
                            rk = message.routing_key
                            logger.info(f"[RabbitMQ] {rk} → {data.get('patientCode')}")
                            await process_event(data, rk)
                        except Exception as e:
                            logger.error(f"Erreur: {e}")
                            raise

        except aio_pika.exceptions.AMQPConnectionError:
            logger.warning("RabbitMQ indisponible, retry dans 5s...")
            await asyncio.sleep(5)
        except asyncio.CancelledError:
            break

async def process_event(data: dict, routing_key: str):
    if routing_key == "patient.case.recorded":
        disease = (data.get("disease") or "unknown").lower().strip()
        region  = (data.get("region")  or "unknown").strip()
        key     = f"{disease}:{region}"
        case_counts[key] = case_counts.get(key, 0) + 1
        count     = case_counts[key]
        threshold = THRESHOLDS.get(disease, THRESHOLDS["default"])
        logger.info(f"Nouveau cas | {disease} | {region} | total={count} seuil={threshold}")
        if count >= threshold:
            logger.warning(f"SEUIL DÉPASSÉ : {disease.upper()} dans {region} ({count} cas >= {threshold})")
    elif routing_key == "patient.case.deleted":
        disease = (data.get("disease") or "unknown").lower().strip()
        region  = (data.get("region")  or "unknown").strip()
        key     = f"{disease}:{region}"
        if key in case_counts and case_counts[key] > 0:
            case_counts[key] -= 1
