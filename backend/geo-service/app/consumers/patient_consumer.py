import aio_pika
import asyncio
import json
import logging
from app.config import settings
from app.services.geo_service import GeoService

logger = logging.getLogger(__name__)

async def start_geo_consumer():
    while True:
        try:
            logger.info("Connexion a RabbitMQ...")
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
                    "geo.patient.queue",
                    durable=True
                )
                await queue.bind(exchange, routing_key="patient.case.recorded")

                logger.info("En ecoute sur geo.patient.queue")

                async for message in queue:
                    async with message.process():
                        try:
                            data = json.loads(message.body.decode())
                            region  = data.get("region", "unknown")
                            street  = data.get("street", "")
                            GeoService.record_case(region, street)
                            logger.info(f"Geo mis a jour : {region}")
                        except Exception as e:
                            logger.error(f"Erreur : {e}")
                            raise

        except aio_pika.exceptions.AMQPConnectionError:
            logger.warning("RabbitMQ indisponible, retry dans 5s...")
            await asyncio.sleep(5)
        except asyncio.CancelledError:
            break
