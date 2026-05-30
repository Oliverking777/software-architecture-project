from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "geo-service"
    app_port: int = 8088
    rabbitmq_url: str = "amqp://dsas_user:dsas_password@localhost:5672/"

    class Config:
        env_file = ".env"

settings = Settings()
