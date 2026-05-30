import aio_pika
import asyncio
import json
import logging
from app.config import settings
from app.services.report_service import ReportService

logger = logging.getLogger(__name__)

async def start_report_consumer():
    while True:
        try:
            logger.info("Connexion a RabbitMQ...")
            connection = await aio_pika.connect_robust(settings.rabbitmq_url)
            async with connection:
                channel = await connection.channel()
                await channel.set_qos(prefetch_count=1)

                exchange = await channel.declare_exchange(
                    "report.events",
                    aio_pika.ExchangeType.TOPIC,
                    durable=True
                )
                queue = await channel.declare_queue(
                    "report.generation.queue",
                    durable=True
                )
                await queue.bind(exchange, routing_key="report.requested")

                logger.info("En ecoute sur report.generation.queue")

                async for message in queue:
                    async with message.process():
                        try:
                            data = json.loads(message.body.decode())
                            format_ = data.get("format", "PDF").upper()
                            logger.info(f"Rapport demande : format={format_}")

                            if format_ == "PDF":
                                path = await ReportService.generate_pdf(data)
                            else:
                                path = await ReportService.generate_csv(data)

                            logger.info(f"Rapport genere : {path}")
                        except Exception as e:
                            logger.error(f"Erreur generation rapport : {e}")
                            raise

        except aio_pika.exceptions.AMQPConnectionError:
            logger.warning("RabbitMQ indisponible, retry dans 5s...")
            await asyncio.sleep(5)
        except asyncio.CancelledError:
            break
