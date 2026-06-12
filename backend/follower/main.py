import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from neo4j import AsyncGraphDatabase

from routers.follow_router import router as follow_router

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.driver = AsyncGraphDatabase.driver(
        NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD)
    )
    yield
    await app.state.driver.close()


app = FastAPI(title="Follower Service", lifespan=lifespan)

app.include_router(follow_router)


@app.get("/health")
def health():
    return {"status": "ok"}
