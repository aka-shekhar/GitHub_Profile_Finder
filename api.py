import requests


def get_user_profile(username, headers=None):
    headers = headers or {}
    url = f"https://api.github.com/users/{username}"

    response = requests.get(
        url,
        headers=headers,
        timeout=10
    )

    response.raise_for_status()
    return response.json()


def get_user_repositories(username, headers=None, page=1):
    headers = headers or {}
    url = f"https://api.github.com/users/{username}/repos"

    params = {
        "per_page": 30,
        "page": page,
        "sort": "updated"
    }

    response = requests.get(
        url,
        headers=headers,
        params=params,
        timeout=10
    )

    response.raise_for_status()
    return response.json()