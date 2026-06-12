from fastapi import APIRouter, Header, Query, Request, status

import services.blog_service as svc
from schemas.blog_schema import BlogCreate, BlogResponse, BlogUpdate

router = APIRouter(prefix="/api/blogs", tags=["blogs"])


@router.post("", status_code=status.HTTP_201_CREATED, response_model=BlogResponse)
async def create_post(
    request: Request,
    body: BlogCreate,
    x_user_id: str = Header(...),
):
    return await svc.create_post(request.app.state.db, x_user_id, body)


@router.get("", response_model=list[BlogResponse])
async def list_posts(
    request: Request,
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
):
    return await svc.list_posts(request.app.state.db, page, size)


@router.get("/user/{user_id}", response_model=list[BlogResponse])
async def get_user_posts(request: Request, user_id: str):
    return await svc.get_user_posts(request.app.state.db, user_id)


@router.get("/{post_id}", response_model=BlogResponse)
async def get_post(request: Request, post_id: str):
    return await svc.get_post(request.app.state.db, post_id)


@router.put("/{post_id}", response_model=BlogResponse)
async def update_post(
    request: Request,
    post_id: str,
    body: BlogUpdate,
    x_user_id: str = Header(...),
):
    return await svc.update_post(request.app.state.db, post_id, x_user_id, body)


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    request: Request,
    post_id: str,
    x_user_id: str = Header(...),
):
    await svc.delete_post(request.app.state.db, post_id, x_user_id)
