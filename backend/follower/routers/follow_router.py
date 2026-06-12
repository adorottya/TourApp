from fastapi import APIRouter, Header, Request, status

import services.follow_service as svc
from schemas.follow_schema import FollowResponse, IsFollowingResponse, RecommendationResponse

router = APIRouter(prefix="/api/social", tags=["social"])


@router.post("/follow/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def follow_user(
    request: Request,
    user_id: str,
    x_user_id: str = Header(...),
):
    await svc.follow_user(request.app.state.driver, x_user_id, user_id)


@router.delete("/follow/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def unfollow_user(
    request: Request,
    user_id: str,
    x_user_id: str = Header(...),
):
    await svc.unfollow_user(request.app.state.driver, x_user_id, user_id)


@router.get("/following", response_model=list[FollowResponse])
async def get_following(request: Request, x_user_id: str = Header(...)):
    return await svc.get_following(request.app.state.driver, x_user_id)


@router.get("/followers", response_model=list[FollowResponse])
async def get_followers(request: Request, x_user_id: str = Header(...)):
    return await svc.get_followers(request.app.state.driver, x_user_id)


@router.get("/is-following/{user_id}", response_model=IsFollowingResponse)
async def is_following(
    request: Request,
    user_id: str,
    x_user_id: str = Header(...),
):
    return await svc.is_following(request.app.state.driver, x_user_id, user_id)


@router.get("/recommendations", response_model=list[RecommendationResponse])
async def get_recommendations(request: Request, x_user_id: str = Header(...)):
    return await svc.get_recommendations(request.app.state.driver, x_user_id)
