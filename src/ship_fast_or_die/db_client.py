import datetime
import os
from typing import Optional

import dotenv
from fastapi import HTTPException
from pydantic import BaseModel
from supabase import Client, create_client

from src.ship_fast_or_die.repo_tools import Repository

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


def validate_access_token(username: str, access_token: str) -> bool:
    """
    Validate access token

    :param username: str
    :param access_token: str
    :return: bool
    """
    table = client.table("user")
    data = table.select("*").eq("username", username).eq("access_token", access_token).execute().data
    return len(data) > 0


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


async def get_product(username: str, repo_name: str) -> Repository:
    """
    Get a product from the database
    """
    table = client.table("product")
    data = table.select("*").eq("owner", username).eq("name", repo_name).execute().data[0]
    return Repository(**data)


def remove_product(username: str, repo_name: str, access_token: str) -> None:
    """
    Remove a product from the database

    :param username: str
    :param repo_name: str
    :param access_token: str
    :return: None
    """

    if not validate_access_token(username, access_token):
        raise HTTPException(status_code=401, detail="Invalid access token")

    table = client.table("product")
    table.delete().eq("owner", username).eq("name", repo_name).execute()
