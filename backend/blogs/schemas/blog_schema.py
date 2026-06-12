from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class BlogCreate(BaseModel):
    title: str
    description: str
    pictures: list[str] = []


class BlogUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    pictures: Optional[list[str]] = None


class BlogResponse(BaseModel):
    id: str
    authorId: str
    title: str
    description: str
    pictures: list[str]
    createdAt: datetime
    updatedAt: datetime


def doc_to_blog(doc: dict) -> BlogResponse:
    return BlogResponse(
        id=str(doc["_id"]),
        authorId=doc["authorId"],
        title=doc["title"],
        description=doc["description"],
        pictures=doc.get("pictures", []),
        createdAt=doc["createdAt"],
        updatedAt=doc["updatedAt"],
    )
