from fastapi import HTTPException
from neo4j import AsyncDriver

import repositories.follow_repository as repo
from schemas.follow_schema import IsFollowingResponse, RecommendationResponse, FollowResponse


async def follow_user(driver: AsyncDriver, follower_id: str, followee_id: str) -> None:
    if follower_id == followee_id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    await repo.follow(driver, follower_id, followee_id)


async def unfollow_user(driver: AsyncDriver, follower_id: str, followee_id: str) -> None:
    if follower_id == followee_id:
        raise HTTPException(status_code=400, detail="Cannot unfollow yourself")
    await repo.unfollow(driver, follower_id, followee_id)


async def get_following(driver: AsyncDriver, user_id: str) -> list[FollowResponse]:
    ids = await repo.get_following(driver, user_id)
    return [FollowResponse(userId=uid) for uid in ids]


async def get_followers(driver: AsyncDriver, user_id: str) -> list[FollowResponse]:
    ids = await repo.get_followers(driver, user_id)
    return [FollowResponse(userId=uid) for uid in ids]


async def is_following(driver: AsyncDriver, follower_id: str, followee_id: str) -> IsFollowingResponse:
    result = await repo.is_following(driver, follower_id, followee_id)
    return IsFollowingResponse(following=result)


async def get_recommendations(driver: AsyncDriver, user_id: str) -> list[RecommendationResponse]:
    ids = await repo.get_recommendations(driver, user_id)
    return [RecommendationResponse(userId=uid) for uid in ids]
