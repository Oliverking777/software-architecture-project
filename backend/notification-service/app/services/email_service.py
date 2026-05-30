import aiosmtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.config import settings

logger = logging.getLogger(__name__)

class EmailService:

    @staticmethod
    async def send_alert_email(data: dict):
        disease   = data.get("disease", "Inconnue")
        region    = data.get("region",  "Inconnue")
        count     = data.get("caseCount", 0)
        threshold = data.get("threshold", 0)
        severity  = data.get("severity", "HIGH")

        subject = f"[ALERTE {severity}] {disease.upper()} dans {region} — {count} cas"

        body_html = f"""
        <html><body>
        <h2 style="color:#c0392b;">Alerte Epidemiologique — DSAS</h2>
        <table border="1" cellpadding="8" style="border-collapse:collapse;">
            <tr><td><b>Maladie</b></td><td>{disease}</td></tr>
            <tr><td><b>Region</b></td><td>{region}</td></tr>
            <tr><td><b>Cas detectes</b></td><td>{count}</td></tr>
            <tr><td><b>Seuil d alerte</b></td><td>{threshold}</td></tr>
            <tr><td><b>Severite</b></td><td>{severity}</td></tr>
        </table>
        <p>Une intervention immediate est recommandee.</p>
        <p><em>Systeme de Surveillance DSAS</em></p>
        </body></html>
        """

        body_text = (
            f"ALERTE {severity}\n"
            f"Maladie : {disease}\n"
            f"Region  : {region}\n"
            f"Cas     : {count} (seuil : {threshold})\n"
        )

        for recipient in settings.alert_recipients.split(","):
            await EmailService._send(recipient.strip(), subject, body_html, body_text)

    @staticmethod
    async def _send(to: str, subject: str, html: str, text: str):
        msg = MIMEMultipart("alternative")
        msg["From"]    = settings.smtp_from
        msg["To"]      = to
        msg["Subject"] = subject
        msg.attach(MIMEText(text, "plain", "utf-8"))
        msg.attach(MIMEText(html,  "html",  "utf-8"))

        try:
            await aiosmtplib.send(
                msg,
                hostname=settings.smtp_host,
                port=settings.smtp_port,
                start_tls=False,
            )
            logger.info(f"Email envoye a {to} : {subject}")
        except Exception as e:
            logger.error(f"Echec envoi email a {to} : {e}")
            raise
