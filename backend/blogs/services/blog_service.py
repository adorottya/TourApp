from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

import repositories.blog_repository as repo
from schemas.blog_schema import BlogCreate, BlogResponse, BlogUpdate


async def create_post(db: AsyncIOMotorDatabase, author_id: str, data: BlogCreate) -> BlogResponse:
    return await repo.create(db, author_id, data)


async def get_post(db: AsyncIOMotorDatabase, post_id: str) -> BlogResponse:
    post = await repo.get_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


async def list_posts(db: AsyncIOMotorDatabase, page: int, size: int) -> list[BlogResponse]:
    return await repo.get_all(db, page, size)


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
