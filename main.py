import requests
from api import get_user_profile, get_user_repositories

headers = {}

# Get username
username = input("Enter GitHub username: ").strip()

if not username:
    print("Username cannot be empty!")
    exit()


try:
    # Get profile information
    data = get_user_profile(username, headers)

    print("\n========== GITHUB PROFILE ==========")

    print("Username:", data['login'])
    print("Full Name:", data['name'] or "Not specified")
    print("Bio:", data.get('bio') or "No biography available")
    print("Location:", data.get('location') or "Not specified")
    print("Followers:", data['followers'])
    print("Following:", data['following'])
    print("Public Repositories:", data['public_repos'])
    print("GitHub URL:", data['html_url'])


    # Get repositories
    repos = get_user_repositories(username, headers)

    print("\n========== PUBLIC REPOSITORIES ==========")

    for repo in repos:
        print("\nRepository:", repo['name'])
        print("Language:", repo['language'] or "Not specified")
        print("Stars:", repo['stargazers_count'])
        print("Forks:", repo['forks_count'])
        print("URL:", repo['html_url'])

    print("\nRepositories displayed:", len(repos))


except requests.exceptions.HTTPError as e:

    status = e.response.status_code

    if status == 404:
        print("GitHub user not found!")

    elif status == 403:
        print("Access forbidden or API rate limit exceeded!")

    else:
        print("HTTP Error:", status)


except requests.exceptions.RequestException as e:
    print("Network error:", e)