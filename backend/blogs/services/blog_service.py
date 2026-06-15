import os

import httpx
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

import repositories.blog_repository as repo
from schemas.blog_schema import BlogCreate, BlogResponse, BlogUpdate

FOLLOWER_SERVICE_URL = os.getenv("FOLLOWER_SERVICE_URL", "http://localhost:8084")
TOURS_SERVICE_URL = os.getenv("TOURS_SERVICE_URL", "http://localhost:8082")


async def _published_guide_ids() -> set[str]:
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(f"{TOURS_SERVICE_URL}/api/tours", timeout=5.0)
            if resp.status_code == 200:
                return {str(t["guideId"]) for t in resp.json()}
        except httpx.RequestError:
            pass
    return set()


async def create_post(db: AsyncIOMotorDatabase, author_id: str, data: BlogCreate) -> BlogResponse:
    return await repo.create(db, author_id, data)


async def get_post(db: AsyncIOMotorDatabase, post_id: str) -> BlogResponse:
    post = await repo.get_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


async def list_posts(db: AsyncIOMotorDatabase, user_id: str, page: int, size: int) -> list[BlogResponse]:
    # Blogs from followed users plus the current user's own posts
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                f"{FOLLOWER_SERVICE_URL}/api/social/following",
                headers={"X-User-Id": user_id},
                timeout=5.0,
            )
            following_ids = [item["userId"] for item in resp.json()] if resp.status_code == 200 else []
        except httpx.RequestError:
            following_ids = []

    author_ids = list({user_id, *following_ids, *await _published_guide_ids()})
    return await repo.get_by_authors(db, author_ids, page, size)


async def get_user_posts(db: AsyncIOMotorDatabase, user_id: str) -> list[BlogResponse]:
    return await repo.get_by_author(db, user_id)


async def update_post(
    db: AsyncIOMotorDatabase, post_id: str, author_id: str, data: BlogUpdate
) -> BlogResponse:
    post = await repo.get_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.authorId != author_id:
        raise HTTPException(status_code=403, detail="Not the author")
    updated = await repo.update(db, post_id, author_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Post not found")
    return updated


async def delete_post(db: AsyncIOMotorDatabase, post_id: str, author_id: str) -> None:
    post = await repo.get_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.authorId != author_id:
        raise HTTPException(status_code=403, detail="Not the author")
    await repo.delete(db, post_id, author_id)
