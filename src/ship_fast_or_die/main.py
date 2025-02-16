import os

import dotenv
import httpx
from fastapi import Body, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from src.ship_fast_or_die.db_client import (
    User,
    add_product,
    get_product,
    get_user,
    list_products,
    remove_product,
    upsert_user,
)
from src.ship_fast_or_die.repo_tools import Repository, RepositoryMetadata, get_repo, list_repos

dotenv.load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://ship-fast-or-die.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TODO Replace these with your GitHub OAuth app credentials
CLIENT_ID = os.environ["GITHUB_CLIENT_ID"]
CLIENT_SECRET = os.environ["GITHUB_CLIENT_SECRET"]
REDIRECT_URI = f"{os.environ['PUBLIC_API_URL']}/auth/github/callback"


@app.get("/auth/github/login")
async def github_login():
    """
    Redirects the user to GitHub's OAuth authorization page.
    """
    github_auth_url = "https://github.com/login/oauth/authorize"
    params = {
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "scope": "user:email repo",
        "state": "random_state_string",  # TODO In production, generate and validate this state to prevent CSRF.
    }
    url = httpx.URL(github_auth_url, params=params)
    return RedirectResponse(url=url)


@app.get("/auth/github/callback")
async def github_callback(code: str = None, state: str = None):
    """
    Handles GitHub OAuth callback and stores user data

    Returns:
        RedirectResponse: Redirects to user page
    """
    if code is None:
        raise HTTPException(status_code=400, detail="Code not provided")

    # Exchange code for access token
    token_url = "https://github.com/login/oauth/access_token"
    headers = {"Accept": "application/json"}
    data = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "code": code,
        "redirect_uri": REDIRECT_URI,
        "state": state,
    }

    async with httpx.AsyncClient() as client:
        token_resp = await client.post(token_url, data=data, headers=headers)
        token_json = token_resp.json()

    access_token = token_json.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="Failed to retrieve access token")

    # Get user info for storage
    user_api_url = "https://api.github.com/user"
    headers = {"Authorization": f"token {access_token}"}

    async with httpx.AsyncClient() as client:
        user_resp = await client.get(user_api_url, headers=headers)
        user_data = user_resp.json()

    upsert_user(
        User(
            username=user_data["login"],
            access_token=access_token,
            avatar_url=user_data.get("avatar_url"),
            bio=user_data.get("bio"),
            location=user_data.get("location"),
            twitter_username=user_data.get("twitter_username"),
        )
    )

    return RedirectResponse(
        url=f"{os.environ['PUBLIC_API_URL']}/add-product?token={access_token}&username={user_data['login']}",
        status_code=302,
    )


@app.get("/users/{username}")
async def get_user_by_username(username: str) -> User:
    """
    Get user data
    """
    return await get_user(username)


@app.get("/users/{username}/repos")
async def list_users_repos(username: str, access_token: str) -> list[RepositoryMetadata]:
    """
    List user repositories

    :param username: GitHub username
    :param access_token: GitHub OAuth access token
    :return: List of repository metadata
    """
    return await list_repos(username, access_token)


@app.post("/users/{username}/products")
async def add_users_product(
    username: str, repo_name: str = Body(..., embed=True), access_token: str = Body(..., embed=True)
):
    """
    Add a repository to the products

    :param username: GitHub username
    :param repo_name: Name of the repository
    :param access_token: GitHub OAuth access token
    :return: Repository details or None if not found
    """
    repo = await get_repo(username, repo_name, access_token)
    return add_product(repo)


@app.get("/users/{username}/products")
async def list_users_products(username: str) -> list[Repository]:
    """
    List user products

    :param username: GitHub username
    :return: List of repository details
    """
    return await list_products(username)


@app.get("/users/{username}/products/{repo_name}")
async def get_users_product(username: str, repo_name: str) -> Repository:
    """
    Get a repository from products

    :param username: GitHub username
    :param repo_name: Name of the repository
    :return: Repository details
    """
    return await get_product(username, repo_name)


@app.delete("/users/{username}/products/{repo_name}")
async def remove_users_product(username: str, repo_name: str, access_token: str = Body(..., embed=True)):
    """
    Remove a repository from products

    :param username: GitHub username
    :param repo_name: Name of the repository
    :param access_token: GitHub OAuth access token
    :return: None
    """
    return remove_product(username, repo_name, access_token)


@app.get("/products/leaderboard")
async def get_leaderboard() -> list[Repository]:
    """
    Get all products sorted by stargazers count

    :return: List of repository details
    """
    return await list_products()
