import datetime
import json
from typing import List, Optional

import httpx
from pydantic import BaseModel


class Product(BaseModel):
    username: str
    repo_name: str
    created_at: datetime.datetime = datetime.datetime.now()


async def get_repo_commits(username: str, repo_name: str, limit: int = 30) -> list[dict]:
    """
    Fetch commits for a public repository

    Args:
        username: GitHub username
        repo_name: Repository name
        limit: Maximum number of commits to fetch

    Returns:
        List of commits with sha, datetime, and message
    """
    commits_url = f"https://api.github.com/repos/{username}/{repo_name}/commits"
    async with httpx.AsyncClient() as client:
        commits_resp = await client.get(commits_url, params={"per_page": limit})
        if commits_resp.status_code == 200:
            commits_json = commits_resp.json()
            return [
                {
                    "sha": commit["sha"],
                    "datetime": commit["commit"]["author"]["date"],
                    "message": commit["commit"]["message"],
                }
                for commit in commits_json
            ]
    return []


class RepositoryMetadata(BaseModel):
    name: str
    description: Optional[str]
    html_url: str


class Repository(BaseModel):
    name: str
    description: Optional[str]
    html_url: str
    owner: str
    avatar_url: Optional[str]
    language: Optional[str]
    stargazers_count: int
    repo_created_at: datetime.datetime
    repo_pushed_at: datetime.datetime
    created_at: datetime.datetime = datetime.datetime.now()

    @classmethod
    def from_github_api(cls, data: dict) -> "Repository":
        """Parse API response and convert necessary fields."""
        return cls(
            name=data["name"],
            description=data.get("description"),
            html_url=data["html_url"],
            owner=data["owner"]["login"],
            avatar_url=data["owner"].get("avatar_url"),
            language=data.get("language"),
            stargazers_count=data["stargazers_count"],
            repo_created_at=data["created_at"],
            repo_pushed_at=data["pushed_at"],
        )


async def list_repos(username: str, limit: int = 100) -> List[RepositoryMetadata]:
    """
    Fetch public repositories for a user from GitHub API

    Args:
        username: GitHub username
        limit: Maximum number of repositories to fetch

    Returns:
        List of repository data including name, description, stars, and URLs
    """
    repos_url = f"https://api.github.com/users/{username}/repos"
    async with httpx.AsyncClient() as client:
        repos_resp = await client.get(repos_url, params={"sort": "updated", "per_page": limit})
        if repos_resp.status_code == 200:
            repos = repos_resp.json()
            return [
                RepositoryMetadata(
                    name=repo["name"],
                    description=repo.get("description"),
                    html_url=repo["html_url"],
                )
                for repo in repos
            ]
    return []


async def get_repo(username: str, repo_name: str) -> Repository:
    """
    Get repo from GitHub API and add to products table
    """
    repo_url = f"https://api.github.com/repos/{username}/{repo_name}"
    async with httpx.AsyncClient() as client:
        repo_resp = await client.get(repo_url)
        if repo_resp.status_code == 200:
            repo = repo_resp.json()
            return Repository.from_github_api(repo)
    return None
