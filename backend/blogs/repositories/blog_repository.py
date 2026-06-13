from datetime import datetime, timezone

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from schemas.blog_schema import BlogCreate, BlogResponse, BlogUpdate, doc_to_blog


async def create(db: AsyncIOMotorDatabase, author_id: str, data: BlogCreate) -> BlogResponse:
    now = datetime.now(timezone.utc)
    doc = {
        "authorId": author_id,
        "title": data.title,
        "description": data.description,
        "pictures": data.pictures,
        "createdAt": now,
        "updatedAt": now,
    }
    result = await db["blog_posts"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc_to_blog(doc)


async def get_by_id(db: AsyncIOMotorDatabase, post_id: str) -> BlogResponse | None:
    try:
        oid = ObjectId(post_id)
    except Exception:
        return None
    doc = await db["blog_posts"].find_one({"_id": oid})
    return doc_to_blog(doc) if doc else None


async def get_all(db: AsyncIOMotorDatabase, page: int, size: int) -> list[BlogResponse]:
    skip = (page - 1) * size
    cursor = db["blog_posts"].find().sort("createdAt", -1).skip(skip).limit(size)
    return [doc_to_blog(doc) async for doc in cursor]


async def get_by_authors(db: AsyncIOMotorDatabase, author_ids: list[str], page: int, size: int) -> list[BlogResponse]:
    skip = (page - 1) * size
    cursor = db["blog_posts"].find({"authorId": {"$in": author_ids}}).sort("createdAt", -1).skip(skip).limit(size)
    return [doc_to_blog(doc) async for doc in cursor]


async def get_by_author(db: AsyncIOMotorDatabase, author_id: str) -> list[BlogResponse]:
    cursor = db["blog_posts"].find({"authorId": author_id}).sort("createdAt", -1)
    return [doc_to_blog(doc) async for doc in cursor]


async def update(
    db: AsyncIOMotorDatabase, post_id: str, author_id: str, data: BlogUpdate
) -> BlogResponse | None:
    try:
        oid = ObjectId(post_id)
    except Exception:
        return None
    changes = {k: v for k, v in data.model_dump().items() if v is not None}
    if not changes:
        return await get_by_id(db, post_id)
    changes["updatedAt"] = datetime.now(timezone.utc)
    result = await db["blog_posts"].find_one_and_update(
        {"_id": oid, "authorId": author_id},
        {"$set": changes},
        return_document=True,
    )
    return doc_to_blog(result) if result else None


async def delete(db: AsyncIOMotorDatabase, post_id: str, author_id: str) -> bool:
    try:
        oid = ObjectId(post_id)
    except Exception:
        return False
    result = await db["blog_posts"].delete_one({"_id": oid, "authorId": author_id})
    return result.deleted_count == 1
