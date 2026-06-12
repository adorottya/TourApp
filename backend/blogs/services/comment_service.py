import os

import httpx
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

import repositories.blog_repository as blog_repo
import repositories.comment_repository as comment_repo
from schemas.comment_schema import CommentCreate, CommentResponse

FOLLOWER_SERVICE_URL = os.getenv("FOLLOWER_SERVICE_URL", "http://localhost:8084")


async def create_comment(
    db: AsyncIOMotorDatabase, post_id: str, commenter_id: str, data: CommentCreate
) -> CommentResponse:
    post = await blog_repo.get_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if commenter_id != post.authorId:
        async with httpx.AsyncClient() as client:
            try:
                resp = await client.get(
                    f"{FOLLOWER_SERVICE_URL}/api/social/is-following/{post.authorId}",
                    headers={"X-User-Id": commenter_id},
                    timeout=5.0,
                )
                if resp.status_code != 200 or not resp.json().get("following", False):
                    raise HTTPException(
                        status_code=403, detail="You must follow the author to comment"
                    )
            except httpx.RequestError:
                raise HTTPException(status_code=503, detail="Follower service unavailable")

    return await comment_repo.create(db, post_id, commenter_id, data)


async def list_comments(db: AsyncIOMotorDatabase, post_id: str) -> list[CommentResponse]:
    post = await blog_repo.get_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return await comment_repo.get_by_post(db, post_id)
