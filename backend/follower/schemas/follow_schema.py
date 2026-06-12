from pydantic import BaseModel


class FollowResponse(BaseModel):
    userId: str


class IsFollowingResponse(BaseModel):
    following: bool


class RecommendationResponse(BaseModel):
    userId: str
