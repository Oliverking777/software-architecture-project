from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "notification-service"
    app_port: int = 8087
    rabbitmq_url: str = "amqp://dsas_user:dsas_password@localhost:5672/"
    smtp_host: str = "localhost"
    smtp_port: int = 1025
    smtp_from: str = "dsas@sante.gov"
    alert_recipients: str = "admin@dsas.gov,directeur@dsas.gov"

    class Config:
        env_file = ".env"

settings = Settings()
