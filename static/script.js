
const searchInput = document.getElementById("repoSearch");
const repoContainer = document.querySelector(".repositories");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const sortSelect = document.getElementById("repoSort");

let currentPage = 1;

// Store all loaded repositories
let allRepos = Array.from(
    document.querySelectorAll(".repo-card")
).map(card => ({
    name: card.querySelector("h3").textContent,
    language: card.querySelectorAll("p")[0].textContent.replace("Language: ", ""),
    stars: Number(card.querySelectorAll("p")[1].textContent.replace("Stars: ", "")),
    forks: Number(card.querySelectorAll("p")[2].textContent.replace("Forks: ", "")),
    url: card.querySelector("a").href,
    updated: card.dataset.updated,
    element: card
}));

// Search repositories
function filterRepos() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";

    allRepos.forEach(repo => {
        const text = `${repo.name} ${repo.language}`.toLowerCase();
        repo.element.style.display = text.includes(searchTerm) ? "" : "none";
    });
}

// Sort all loaded repositories
function sortRepos() {
    const sortBy = sortSelect ? sortSelect.value : "stars";

    allRepos.sort((a, b) => {
        if (sortBy === "stars") return b.stars - a.stars;
        if (sortBy === "forks") return b.forks - a.forks;
        if (sortBy === "updated") {
            return new Date(b.updated || 0) - new Date(a.updated || 0);
        }
    });

    allRepos.forEach(repo => {
        repoContainer.appendChild(repo.element);
    });

    filterRepos();
}

// Sorting dropdown
if (sortSelect) {
    sortSelect.addEventListener("change", sortRepos);
}

// Search input
if (searchInput) {
    searchInput.addEventListener("input", filterRepos);
}

// Load more repositories
if (loadMoreBtn) {
    loadMoreBtn.style.display = "block";

    loadMoreBtn.addEventListener("click", async function () {
        currentPage++;

        const username = this.dataset.username;

        this.disabled = true;
        this.textContent = "Loading...";

        try {
            const response = await fetch(
                `/load-more/${username}?page=${currentPage}`
            );

            if (!response.ok) {
                throw new Error("Failed to load repositories");
            }

            const data = await response.json();

            data.repos.forEach(repo => {
                const card = document.createElement("div");
                card.className = "repo-card";
                card.dataset.updated = repo.updated_at;
                card.dataset.description = repo.description || "No description available";
                card.dataset.stars = repo.stargazers_count;
                card.dataset.forks = repo.forks_count;
                card.dataset.issues = repo.open_issues_count;
                card.dataset.language = repo.language || "Not specified";
                card.dataset.created = repo.created_at;
                card.dataset.branch = repo.default_branch;
                card.dataset.url = repo.html_url;
                card.innerHTML = `
                    <h3>${repo.name}</h3>
                    <p>Language: ${repo.language || "Not specified"}</p>
                    <p>Stars: ${repo.stargazers_count}</p>
                    <p>Forks: ${repo.forks_count}</p>
                    <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
                        View Repository
                    </a>
                `;

                repoContainer.appendChild(card);

                allRepos.push({
                    name: repo.name,
                    language: repo.language || "Not specified",
                    stars: repo.stargazers_count,
                    forks: repo.forks_count,
                    url: repo.html_url,
                    updated: repo.updated_at,
                    element: card
                });
            });

            sortRepos();

            if (!data.has_more) {
                loadMoreBtn.style.display = "none";
            } else {
                loadMoreBtn.textContent = "Load More Repositories";
                loadMoreBtn.disabled = false;
            }

        } catch (error) {
            currentPage--;
            loadMoreBtn.textContent = "Try Again";
            loadMoreBtn.disabled = false;
            console.error(error);
        }
    });
}
// Repository Details Popup

const repoModal = document.getElementById("repoModal");
const closeModal = document.getElementById("closeModal");

if (repoContainer) {
    repoContainer.addEventListener("click", function (event) {

        const card = event.target.closest(".repo-card");

        if (!card) return;

        // Don't open popup when View Repository is clicked
        if (event.target.closest("a")) return;

        document.getElementById("modalRepoName").textContent =
            card.querySelector("h3").textContent;

        document.getElementById("modalDescription").textContent =
            card.dataset.description;

        document.getElementById("modalDetails").innerHTML = `
            <p>⭐ Stars: ${card.dataset.stars}</p>
            <p>🍴 Forks: ${card.dataset.forks}</p>
            <p>💻 Language: ${card.dataset.language}</p>
            <p>⚠️ Open Issues: ${card.dataset.issues}</p>
            <p>🌿 Default Branch: ${card.dataset.branch}</p>
            <p>📅 Created: ${new Date(card.dataset.created).toLocaleDateString()}</p>
            <p>🔄 Last Updated: ${new Date(card.dataset.updated).toLocaleDateString()}</p>
        `;

        document.getElementById("modalRepoLink").href =
            card.dataset.url;

        repoModal.style.display = "flex";
    });
}

closeModal.addEventListener("click", function () {
    repoModal.style.display = "none";
});

repoModal.addEventListener("click", function (event) {
    if (event.target === repoModal) {
        repoModal.style.display = "none";
    }
});

const searchForm = document.getElementById("searchForm");
const loading = document.getElementById("loading");

searchForm.addEventListener("submit", function () {
    loading.style.display = "block";
});