from pydantic_settings import BaseSettings

EUREKA_SERVER = "http://eureka-server:8761/eureka"
SERVICE_NAME = "ANALYTICS-SERVICE"
SERVICE_PORT = 8085

class Settings(BaseSettings):
    app_name: str = "analytics-service"
    app_port: int = 8085
    rabbitmq_url: str = "amqp://dsas_user:dsas_password@rabbitmq:5672/"
    db_url: str = "postgresql+psycopg2://dsas_user:dsas_password@postgres:5432/dsas_analytics"  # add this

    class Config:
        env_file = ".env"

settings = Settings()
