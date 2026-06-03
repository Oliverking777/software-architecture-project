from pydantic_settings import BaseSettings

EUREKA_SERVER = "http://eureka-server:8761/eureka"
SERVICE_NAME = "GEO-SERVICE"
SERVICE_PORT = 8088

class Settings(BaseSettings):
    app_name: str = "geo-service"
    app_port: int = 8088
    rabbitmq_url: str = "amqp://dsas_user:dsas_password@rabbitmq:5672/"  

    class Config:
        env_file = ".env"

settings = Settings()
