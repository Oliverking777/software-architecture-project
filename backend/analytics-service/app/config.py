from pydantic_settings import BaseSettings


EUREKA_SERVER= "http://eureka-server:8761/eureka"
SERVICE_NAME = "ANALYTICS-SERVICE"
SERVICE_PORT = 8085

class Settings(BaseSettings):
    app_name: str = "analytics-service"
    app_port: int = 8085
    rabbitmq_url: str = "amqp://dsas_user:dsas_password@localhost:5672/"

    class Config:
        env_file = ".env"

settings = Settings()
