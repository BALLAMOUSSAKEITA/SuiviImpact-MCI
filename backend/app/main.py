import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import async_session_maker
from app.services.user_service import seed_admin_user

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.basicConfig(level=logging.INFO if not settings.DEBUG else logging.DEBUG)
    logger.info("Démarrage de %s", settings.APP_NAME)
    async with async_session_maker() as session:
        await seed_admin_user(session)
    yield
    logger.info("Arrêt de %s", settings.APP_NAME)


app = FastAPI(
    title=settings.APP_NAME,
    description="API REST SuiviImpact MIPME — BSD Guinée",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info("%s %s", request.method, request.url.path)
    response = await call_next(request)
    return response


app.include_router(api_router, prefix="/api/v1")
