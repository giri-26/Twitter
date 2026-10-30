// ========================================
// MICROBLOGGING WEBSITE
// HTML + CSS + JAVASCRIPT
// ========================================

// 1. GET HTML ELEMENTS

const postInput = document.getElementById("postInput");
const postBtn = document.getElementById("postBtn");
const postFeed = document.getElementById("postFeed");
const charCount = document.getElementById("charCount");
const searchInput = document.getElementById("searchInput");
const themeBtn = document.getElementById("themeBtn");
const emptyMessage = document.getElementById("emptyMessage");
const feedTitle = document.getElementById("feedTitle");

const totalPosts = document.getElementById("totalPosts");
const totalLikes = document.getElementById("totalLikes");
const totalComments = document.getElementById("totalComments");

// 2. CURRENT USER

const currentUser = "Giri";

// 3. LOAD POSTS FROM LOCAL STORAGE

function loadPosts() {
    try {
        const savedPosts = localStorage.getItem("microblogPosts");

        if (savedPosts === null) {
            return [
                {
                    id: "demo-1",
                    author: "Priya",
                    content: "Welcome to MicroBlog! Share your thoughts with the community. 🚀",
                    createdAt: Date.now() - 120000,
                    likes: [],
                    comments: []
                },
                {
                    id: "demo-2",
                    author: "Arun",
                    content: "Learning HTML, CSS and JavaScript is a great first step toward becoming a web developer!",
                    createdAt: Date.now() - 3600000,
                    likes: ["Priya"],
                    comments: [
                        {
                            id: "comment-demo-1",
                            author: "Priya",
                            text: "Absolutely! Keep learning."
                        }
                    ]
                }
            ];
        }

        const posts = JSON.parse(savedPosts);

        if (!Array.isArray(posts)) {
            return [];
        }

        return posts.filter(post =>
            post &&
            typeof post.id === "string" &&
            typeof post.author === "string" &&
            typeof post.content === "string" &&
            Array.isArray(post.likes) &&
            Array.isArray(post.comments)
        );

    } catch (error) {
        console.error("Unable to load saved posts:", error);
        return [];
    }
}

let posts = loadPosts();

// 4. APPLICATION STATE

let currentFilter = "all";
let searchText = "";

// 5. SAVE POSTS

function savePosts() {
    try {
        localStorage.setItem("microblogPosts", JSON.stringify(posts));
        return true;
    } catch (error) {
        console.error("Unable to save posts:", error);
        alert("Could not save changes. Browser storage may be full or unavailable.");
        return false;
    }
}

// 6. CREATE A NEW POST

function createPost() {
    const content = postInput.value.trim();

    if (content.length === 0) {
        alert("Please write something before publishing!");
        return;
    }

    if (content.length > 280) {
        alert("Your post cannot exceed 280 characters.");
        return;
    }

    const newPost = {
        id: crypto.randomUUID(),
        author: currentUser,
        content: content,
        createdAt: Date.now(),
        likes: [],
        comments: []
    };

    posts.unshift(newPost);

    if (!savePosts()) {
        posts.shift();
        return;
    }

    postInput.value = "";
    updateCharacterCount();

    currentFilter = "all";

    updateFilterButtons();
    renderPosts();
    updateStatistics();
}

// Publish using the button
postBtn.addEventListener("click", createPost);

// Publish using Ctrl + Enter
postInput.addEventListener("keydown", function (event) {
    if (event.ctrlKey && event.key === "Enter") {
        createPost();
    }
});

// 7. CHARACTER COUNTER

function updateCharacterCount() {
    const length = postInput.value.length;

    charCount.textContent = `${length} / 280`;

    charCount.classList.toggle("limit", length >= 260);
}

postInput.addEventListener("input", updateCharacterCount);

// 8. FORMAT POST TIME

function formatTime(timestamp) {
    const seconds = Math.max(
        0,
        Math.floor((Date.now() - timestamp) / 1000)
    );

    if (seconds < 60) {
        return "Just now";
    }

    if (seconds < 3600) {
        return Math.floor(seconds / 60) + "m ago";
    }

    if (seconds < 86400) {
        return Math.floor(seconds / 3600) + "h ago";
    }

    if (seconds < 604800) {
        return Math.floor(seconds / 86400) + "d ago";
    }

    return new Date(timestamp).toLocaleDateString();
}

// 9. ESCAPE USER CONTENT

// Prevent user-written content from being interpreted as HTML.
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

// 10. DISPLAY POSTS

function renderPosts() {
    postFeed.replaceChildren();

    let filteredPosts = posts.filter(function (post) {
        const matchesSearch =
            post.content.toLowerCase().includes(searchText) ||
            post.author.toLowerCase().includes(searchText);

        const matchesFilter =
            currentFilter === "all" ||
            post.likes.includes(currentUser);

        return matchesSearch && matchesFilter;
    });

    emptyMessage.hidden = filteredPosts.length > 0;

    if (filteredPosts.length === 0) {
        emptyMessage.textContent =
            currentFilter === "liked" && searchText === ""
                ? "You haven't liked any posts yet."
                : "No posts found. Try another search or publish a post.";
    }

    filteredPosts.forEach(function (post) {
        const isLiked = post.likes.includes(currentUser);

        const card = document.createElement("article");
        card.className = "post-card";

        card.innerHTML = `
            <div class="post-header">
                <div class="avatar">
                    ${escapeHTML(post.author.charAt(0).toUpperCase())}
                </div>

                <div>
                    <div class="post-user">
                        ${escapeHTML(post.author)}
                    </div>

                    <div class="post-time">
                        ${escapeHTML(formatTime(post.createdAt))}
                    </div>
                </div>
            </div>

            <div class="post-content">${escapeHTML(post.content)}</div>

            <div class="post-actions">

                <button
                    class="action-btn ${isLiked ? "liked" : ""}"
                    data-action="like"
                    data-id="${escapeHTML(post.id)}"
                    aria-pressed="${isLiked}"
                >
                    ${isLiked ? "❤️" : "🤍"}
                    ${post.likes.length} Likes
                </button>

                <button
                    class="action-btn"
                    data-action="toggle-comments"
                    data-id="${escapeHTML(post.id)}"
                >
                    💬 ${post.comments.length} Comments
                </button>

                ${
                    post.author === currentUser
                        ? `
                            <button
                                class="action-btn delete-btn"
                                data-action="delete"
                                data-id="${escapeHTML(post.id)}"
                            >
                                🗑️ Delete
                            </button>
                        `
                        : ""
                }

            </div>

            <section
                class="comment-section"
                data-comments-for="${escapeHTML(post.id)}"
                hidden
            >
                <div class="comment-list"></div>

                <form class="comment-form" data-id="${escapeHTML(post.id)}">
                    <input
                        type="text"
                        name="comment"
                        maxlength="300"
                        placeholder="Write a comment..."
                        aria-label="Write a comment"
                        required
                    >

                    <button type="submit">Send</button>
                </form>
            </section>
        `;

        postFeed.appendChild(card);

        // Display comments using textContent.
        const commentList = card.querySelector(".comment-list");

        post.comments.forEach(function (comment) {
            const commentElement = document.createElement("div");

            commentElement.className = "comment-item";

            const author = document.createElement("strong");
            author.textContent = comment.author + ": ";

            const text = document.createElement("span");
            text.textContent = comment.text;

            commentElement.append(author, text);
            commentList.appendChild(commentElement);
        });
    });
}

// 11. LIKE AND UNLIKE POSTS

function toggleLike(postId) {
    const post = posts.find(post => post.id === postId);

    if (!post) return;

    const previousLikes = [...post.likes];

    if (post.likes.includes(currentUser)) {
        post.likes = post.likes.filter(
            user => user !== currentUser
        );
    } else {
        post.likes.push(currentUser);
    }

    if (!savePosts()) {
        post.likes = previousLikes;
        return;
    }

    renderPosts();
    updateStatistics();
}

// 12. DELETE POSTS

function deletePost(postId) {
    const post = posts.find(post => post.id === postId);

    if (!post || post.author !== currentUser) {
        return;
    }

    const confirmed = confirm("Are you sure you want to delete this post?");

    if (!confirmed) return;

    const previousPosts = posts;

    posts = posts.filter(post => post.id !== postId);

    if (!savePosts()) {
        posts = previousPosts;
        return;
    }

    renderPosts();
    updateStatistics();
}

// 13. SHOW OR HIDE COMMENTS

function toggleComments(postId) {
    const section = postFeed.querySelector(
        `[data-comments-for="${CSS.escape(postId)}"]`
    );

    if (!section) return;

    section.hidden = !section.hidden;

    if (!section.hidden) {
        section.querySelector("input").focus();
    }
}

// 14. ADD COMMENTS

function addComment(postId, commentText) {
    const post = posts.find(post => post.id === postId);

    if (!post) return;

    const text = commentText.trim();

    if (text.length === 0) return;

    if (text.length > 300) {
        alert("Comments cannot exceed 300 characters.");
        return;
    }

    const newComment = {
        id: crypto.randomUUID(),
        author: currentUser,
        text: text
    };

    post.comments.push(newComment);

    if (!savePosts()) {
        post.comments.pop();
        return;
    }

    renderPosts();
    updateStatistics();

    // Keep the comment section open.
    const section = postFeed.querySelector(
        `[data-comments-for="${CSS.escape(postId)}"]`
    );

    if (section) {
        section.hidden = false;
    }
}

// 15. HANDLE POST BUTTON CLICKS

postFeed.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const postId = button.dataset.id;
    const action = button.dataset.action;

    if (action === "like") {
        toggleLike(postId);
    }

    if (action === "delete") {
        deletePost(postId);
    }

    if (action === "toggle-comments") {
        toggleComments(postId);
    }
});

// 16. HANDLE COMMENT FORM SUBMISSION

postFeed.addEventListener("submit", function (event) {
    const form = event.target.closest(".comment-form");

    if (!form) return;

    event.preventDefault();

    const input = form.elements.comment;

    addComment(form.dataset.id, input.value);
});

// 17. SEARCH POSTS

searchInput.addEventListener("input", function () {
    searchText = searchInput.value.trim().toLowerCase();

    renderPosts();
});

// 18. FILTER POSTS

function updateFilterButtons() {
    document.querySelectorAll(".menu-btn").forEach(function (button) {
        const isActive = button.dataset.filter === currentFilter;

        button.classList.toggle("active", isActive);

        button.setAttribute("aria-pressed", String(isActive));
    });

    feedTitle.textContent =
        currentFilter === "liked" ? "Liked Posts" : "Explore Posts";
}

document.querySelectorAll(".menu-btn").forEach(function (button) {
    button.addEventListener("click", function () {
        currentFilter = button.dataset.filter;

        updateFilterButtons();
        renderPosts();
    });
});

// 19. DARK MODE

function applyTheme(isDark) {
    document.body.classList.toggle("dark", isDark);

    themeBtn.textContent = isDark ? "☀️" : "🌙";

    themeBtn.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
    );
}

let darkMode = localStorage.getItem("microblogTheme") === "dark";

applyTheme(darkMode);

themeBtn.addEventListener("click", function () {
    darkMode = !darkMode;

    applyTheme(darkMode);

    try {
        localStorage.setItem(
            "microblogTheme",
            darkMode ? "dark" : "light"
        );
    } catch (error) {
        console.error("Unable to save theme:", error);
    }
});

// 20. UPDATE ACTIVITY STATISTICS

function updateStatistics() {
    totalPosts.textContent = posts.filter(
        post => post.author === currentUser
    ).length;

    totalLikes.textContent = posts.reduce(
        (total, post) => total + post.likes.length,
        0
    );

    totalComments.textContent = posts.reduce(
        (total, post) => total + post.comments.length,
        0
    );
}

// 21. INITIALIZE WEBSITE

updateCharacterCount();
updateFilterButtons();
renderPosts();
updateStatistics();