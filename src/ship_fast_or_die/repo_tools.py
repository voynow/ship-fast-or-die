import datetime
import json
from typing import List, Optional

import httpx
import requests
from pydantic import BaseModel


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
    num_code_files: Optional[int]
    repo_created_at: datetime.datetime
    repo_pushed_at: datetime.datetime
    created_at: datetime.datetime = datetime.datetime.now()

    @classmethod
    def from_github_api(cls, data: dict, num_code_files: int) -> "Repository":
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
            num_code_files=num_code_files,
        )


async def list_repos(username: str, access_token: str, limit: int = 100) -> List[RepositoryMetadata]:
    """
    Fetch public repositories for a user from GitHub API using their access token

    :param username: GitHub username
    :param access_token: GitHub OAuth access token
    :param limit: Maximum number of repositories to fetch
    :return: List of repository metadata
    """
    repos_url = f"https://api.github.com/users/{username}/repos"
    headers = {"Authorization": f"Bearer {access_token}"}

    async with httpx.AsyncClient() as client:
        repos_resp = await client.get(repos_url, params={"sort": "updated", "per_page": limit}, headers=headers)
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


def count_files(owner: str, repo: str, access_token: str) -> int:
    """
    Counts code files in a GitHub repository recursively via the API.

    Includes files with extensions commonly used for code (.py, .js, .ts, .go, .java, etc.)
    while excluding binary files, data files, and documentation.
    """
    CODE_EXTENSIONS = {
        ".py",
        ".js",
        ".ts",
        ".jsx",
        ".tsx",
        ".go",
        ".java",
        ".cpp",
        ".c",
        ".h",
        ".rs",
        ".rb",
        ".php",
        ".scala",
        ".kt",
        ".cs",
        ".swift",
        ".m",
        ".r",
    }

    headers = {"Authorization": f"token {access_token}"}
    api_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/main?recursive=1"

    response = requests.get(api_url, headers=headers)
    if response.status_code != 200:
        raise Exception(f"GitHub API error: {response.json()}")

    data = response.json()
    return sum(
        1
        for item in data.get("tree", [])
        if item["type"] == "blob" and any(item["path"].lower().endswith(ext) for ext in CODE_EXTENSIONS)
    )


async def get_repo(username: str, repo_name: str, access_token: str) -> Repository:
    """
    Get repo from GitHub API using access token

    :param username: GitHub username
    :param repo_name: Name of the repository
    :param access_token: GitHub OAuth access token
    :return: Repository details or None if not found
    """
    repo_url = f"https://api.github.com/repos/{username}/{repo_name}"
    headers = {"Authorization": f"Bearer {access_token}"}

    async with httpx.AsyncClient() as client:
        repo_resp = await client.get(repo_url, headers=headers)
        if repo_resp.status_code == 200:
            repo = repo_resp.json()
            num_code_files = count_files(username, repo_name, access_token)
            return Repository.from_github_api(repo, num_code_files)
    return None
