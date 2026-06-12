from neo4j import AsyncDriver


async def follow(driver: AsyncDriver, follower_id: str, followee_id: str) -> None:
    async with driver.session() as session:
        await session.run(
            """
            MERGE (a:User {userId: $follower_id})
            MERGE (b:User {userId: $followee_id})
            MERGE (a)-[:FOLLOWS]->(b)
            """,
            follower_id=follower_id,
            followee_id=followee_id,
        )


async def unfollow(driver: AsyncDriver, follower_id: str, followee_id: str) -> None:
    async with driver.session() as session:
        await session.run(
            """
            MATCH (a:User {userId: $follower_id})-[r:FOLLOWS]->(b:User {userId: $followee_id})
            DELETE r
            """,
            follower_id=follower_id,
            followee_id=followee_id,
        )


async def get_following(driver: AsyncDriver, user_id: str) -> list[str]:
    async with driver.session() as session:
        result = await session.run(
            "MATCH (me:User {userId: $user_id})-[:FOLLOWS]->(u:User) RETURN u.userId AS userId",
            user_id=user_id,
        )
        return [record["userId"] async for record in result]


async def get_followers(driver: AsyncDriver, user_id: str) -> list[str]:
    async with driver.session() as session:
        result = await session.run(
            "MATCH (u:User)-[:FOLLOWS]->(me:User {userId: $user_id}) RETURN u.userId AS userId",
            user_id=user_id,
        )
        return [record["userId"] async for record in result]


async def is_following(driver: AsyncDriver, follower_id: str, followee_id: str) -> bool:
    async with driver.session() as session:
        result = await session.run(
            """
            MATCH (a:User {userId: $follower_id})-[:FOLLOWS]->(b:User {userId: $followee_id})
            RETURN count(*) > 0 AS following
            """,
            follower_id=follower_id,
            followee_id=followee_id,
        )
        record = await result.single()
        return record["following"] if record else False


async def get_recommendations(driver: AsyncDriver, user_id: str) -> list[str]:
    async with driver.session() as session:
        result = await session.run(
            """
            MATCH (me:User {userId: $user_id})-[:FOLLOWS]->(:User)-[:FOLLOWS]->(rec:User)
            WHERE NOT (me)-[:FOLLOWS]->(rec) AND rec.userId <> $user_id
            RETURN DISTINCT rec.userId AS userId
            """,
            user_id=user_id,
        )
        return [record["userId"] async for record in result]
