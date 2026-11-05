
from flask import Flask, render_template, request, jsonify
import os
import requests
from concurrent.futures import ThreadPoolExecutor

from api import get_user_profile, get_user_repositories



app = Flask(__name__)


headers = {}



@app.route("/", methods=["GET", "POST"])
def home():

    user = None
    repos = []
    language_stats = {}
    error = None

    if request.method == "POST":

        username = request.form.get("username", "").strip()

        if not username:
            error = "Please enter a GitHub username!"

        else:
            try:
                with ThreadPoolExecutor() as executor:
                
                    profile_future = executor.submit(
                        get_user_profile, username, headers
                    )

                    repos_future = executor.submit(
                        get_user_repositories, username, headers
                    )

                    user = profile_future.result()
                    repos = repos_future.result()
                repos.sort(
                            key=lambda repo: repo['stargazers_count'],
                            reverse=True
                        )
                language_count = {}

                for repo in repos:
                    language = repo.get("language")

                    if language:
                        language_count[language] = language_count.get(language, 0) + 1

                total = sum(language_count.values())

                if total > 0:
                    language_stats = {
                        language: round((count / total) * 100, 2)
                        for language, count in language_count.items()
    }
                
            except requests.exceptions.HTTPError as e:

                if e.response.status_code == 404:
                    error = "GitHub user not found!"

                elif e.response.status_code == 403:
                    error = "API access forbidden or rate limit exceeded!"

                else:
                    error = f"HTTP Error: {e.response.status_code}"

            except requests.exceptions.RequestException:
                error = "Network error. Please check your internet connection."

    return render_template(
        "index.html",
        user=user,
        repos=repos,
        error=error,
        language_stats=language_stats
    )
@app.route("/load-more/<username>")
def load_more(username):

    page = request.args.get("page", 2, type=int)

    try:
        repos = get_user_repositories(username, headers, page)

        repos.sort(
            key=lambda repo: repo['stargazers_count'],
            reverse=True
        )

        return jsonify({
            "repos": repos,
            "has_more": len(repos) == 30
        })

    except requests.exceptions.RequestException:
        return jsonify({"error": "Unable to load repositories"}), 500

if __name__ == "__main__":
    app.run(debug=True)
