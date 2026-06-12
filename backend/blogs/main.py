import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient

from routers.blog_router import router as blog_router
from routers.comment_router import router as comment_router

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGO_DB", "blog")


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.mongo = AsyncIOMotorClient(MONGO_URL)
    app.state.db = app.state.mongo[DB_NAME]
    yield
    app.state.mongo.close()


app = FastAPI(title="Blog Service", lifespan=lifespan)

app.include_router(blog_router)
app.include_router(comment_router)


@app.get("/health")
def health():
    return {"status": "ok"}
