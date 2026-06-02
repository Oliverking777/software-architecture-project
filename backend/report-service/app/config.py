from pydantic_settings import BaseSettings


EUREKA_SERVER  = "http://eureka-server:8761/eureka"
SERVICE_NAME = "REPORT-SERVICE"
SERVICE_PORT = 8086

class Settings(BaseSettings):
    app_name: str = "report-service"
    app_port: int = 8086
    rabbitmq_url: str = "amqp://dsas_user:dsas_password@localhost:5672/"
    reports_dir: str = "/tmp/reports"

    class Config:
        env_file = ".env"

settings = Settings()
