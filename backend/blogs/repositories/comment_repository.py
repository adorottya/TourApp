from datetime import datetime, timezone

from motor.motor_asyncio import AsyncIOMotorDatabase

from schemas.comment_schema import CommentCreate, CommentResponse, doc_to_comment


async def create(
    db: AsyncIOMotorDatabase, post_id: str, author_id: str, data: CommentCreate
) -> CommentResponse:
    doc = {
        "postId": post_id,
        "authorId": author_id,
        "content": data.content,
        "createdAt": datetime.now(timezone.utc),
    }
    result = await db["comments"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc_to_comment(doc)


async def get_by_post(db: AsyncIOMotorDatabase, post_id: str) -> list[CommentResponse]:
    cursor = db["comments"].find({"postId": post_id}).sort("createdAt", 1)
    return [doc_to_comment(doc) async for doc in cursor]
