from fastapi import APIRouter, Header, Request, status

import services.comment_service as svc
from schemas.comment_schema import CommentCreate, CommentResponse

router = APIRouter(prefix="/api/blogs", tags=["comments"])


@router.post(
    "/{post_id}/comments",
    status_code=status.HTTP_201_CREATED,
    response_model=CommentResponse,
)
async def create_comment(
    request: Request,
    post_id: str,
    body: CommentCreate,
    x_user_id: str = Header(...),
):
    return await svc.create_comment(request.app.state.db, post_id, x_user_id, body)


@router.get("/{post_id}/comments", response_model=list[CommentResponse])
async def list_comments(request: Request, post_id: str):
    return await svc.list_comments(request.app.state.db, post_id)
