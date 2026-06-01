import aio_pika
import asyncio
import json
import logging
from app.config import settings
from app.services.email_service import EmailService

logger = logging.getLogger(__name__)

async def start_alert_consumer():
    while True:
        try:
            logger.info("Connexion a RabbitMQ...")
            connection = await aio_pika.connect_robust(settings.rabbitmq_url)
            async with connection:
                channel = await connection.channel()
                await channel.set_qos(prefetch_count=1)

                exchange = await channel.declare_exchange(
                    "alert.events",
                    aio_pika.ExchangeType.TOPIC,
                    durable=True
                )
                queue = await channel.declare_queue(
                    "notification.alert.queue",
                    durable=True
                )
                await queue.bind(exchange, routing_key="alert.triggered")
                await queue.bind(exchange, routing_key="alert.critical")

                logger.info("En ecoute sur notification.alert.queue")
                logger.info("Exchange: alert.events | Keys: alert.triggered / alert.critical")

                async for message in queue:
                    async with message.process():
                        try:
                            data = json.loads(message.body.decode())
                            logger.info(f"[RabbitMQ] Alerte recue : {data}")
                            await EmailService.send_alert_email(data)
                        except Exception as e:
                            logger.error(f"Erreur traitement : {e}")
                            raise

        except aio_pika.exceptions.AMQPConnectionError:
            logger.warning("RabbitMQ indisponible, retry dans 5s...")
            await asyncio.sleep(5)
        except asyncio.CancelledError:
            logger.info("Consumer arrete")
            break
