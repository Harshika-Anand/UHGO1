from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OPENAI_API_KEY: str
    MONGO_URI: str = "mongodb://localhost:27017"
    MONGO_DB_NAME: str = "optum_health"
    ALLOWED_ORIGINS: str = "http://localhost:3000"
    MAX_QUERY_RESULTS: int = 100
    QUERY_TIMEOUT_MS: int = 30000

    class Config:
        env_file = ".env"
        extra = "ignore"

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

settings = Settings()