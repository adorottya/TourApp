from datetime import datetime
from pydantic import BaseModel


class CommentCreate(BaseModel):
    content: str


class CommentResponse(BaseModel):
    id: str
    postId: str
    authorId: str
    content: str
    createdAt: datetime


def doc_to_comment(doc: dict) -> CommentResponse:
    return CommentResponse(
        id=str(doc["_id"]),
        postId=doc["postId"],
        authorId=doc["authorId"],
        content=doc["content"],
        createdAt=doc["createdAt"],
    )
