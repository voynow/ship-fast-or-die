import datetime
import os
from typing import Optional

import dotenv
from pydantic import BaseModel
from supabase import Client, create_client

from ship_fast_or_die.repo_tools import Repository

dotenv.load_dotenv()


class User(BaseModel):
    username: str
    access_token: str
    bio: Optional[str]
    location: Optional[str]
    twitter_username: Optional[str]
    avatar_url: Optional[str]
    created_at: datetime.datetime = datetime.datetime.now()


def init() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    return create_client(url, key)


client = init()


def upsert_user(user: User) -> None:
    """
    Upsert user data, handling for datetime serialization

    :param user: User
    :return: None
    """
    data = user.model_dump()
    # Convert datetime to ISO format string for JSON serialization
    data["created_at"] = data["created_at"].isoformat()
    table = client.table("user")
    table.upsert(data, on_conflict="username").execute()


async def get_user(username: str) -> User:
    """
    Get user data, handling for datetime deserialization

    :param username: str
    :return: User
    """
    table = client.table("user")
    data = table.select("*").eq("username", username).execute().data[0]
    # Convert ISO format string to datetime
    data["created_at"] = datetime.datetime.fromisoformat(data["created_at"])
    return User(**data)


def add_product(product: Repository) -> None:
    """
    Add product data, handling for datetime serialization

    :param product: Repository
    :return: None
    """
    data = product.model_dump()
    data["created_at"] = data["created_at"].isoformat()
    data["repo_created_at"] = data["repo_created_at"].isoformat()
    data["repo_pushed_at"] = data["repo_pushed_at"].isoformat()

    table = client.table("product")
    table.insert(data).execute()


async def list_products(username: Optional[str] = None) -> list[Repository]:
    """
    List products for a user
    """
    table = client.table("product")
    if username:
        data = table.select("*").eq("owner", username).execute().data
    else:
        data = table.select("*").execute().data
    for item in data:
        item["created_at"] = datetime.datetime.fromisoformat(item["created_at"])
        item["repo_created_at"] = datetime.datetime.fromisoformat(item["repo_created_at"])
        item["repo_pushed_at"] = datetime.datetime.fromisoformat(item["repo_pushed_at"])
    return data
