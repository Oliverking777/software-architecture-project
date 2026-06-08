from pydantic_settings import BaseSettings


EUREKA_SERVER  = "http://eureka-server:8761/eureka"
SERVICE_NAME = "NOTIFICATION-SERVICE"
SERVICE_PORT = 8087

class Settings(BaseSettings):
    app_name: str = "notification-service"
    app_port: int = 8087
    rabbitmq_url: str = "amqp://dsas_user:dsas_password@rabbitmq:5672/"
    smtp_host: str = "mailhog"
    smtp_port: int = 1025
    smtp_from: str = "dsas@sante.gov"
    alert_recipients: str = "admin@dsas.gov,directeur@dsas.gov"

    class Config:
        env_file = ".env"

settings = Settings()
