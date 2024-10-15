let posts = [];

// Function to get user ID from URL
function getUserIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    console.log("URL search params:", urlParams.toString());
    const userId = urlParams.get('userId');
    console.log("Retrieved userId:", userId);
    if (!userId) {
        console.error('No userId found in URL');
    }
    return userId;
}

// Function to fetch posts from the API
async function getPosts(params = {}) {
    const userId = getUserIdFromUrl();
    if (!userId) {
        throw new Error('User ID is required');
    }
    params.userId = userId;
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/posts${queryString ? `?${queryString}` : ''}`;
    console.log("Fetching from URL:", url);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseText = await response.text();
        console.log("Raw response text:", responseText);
        if (!responseText) {
            throw new Error('Empty response from server');
        }
        return JSON.parse(responseText);
    } catch (error) {
        console.error("Error fetching or parsing posts:", error);
        throw error;
    }
}

// Function to create a post element for display
function createPostElement(post) {
    const postElement = document.createElement('div');
    postElement.className = `post-card ${post.idea_text ? 'idea' : 'problem'}`;
    postElement.dataset.postId = post.idea_id || post.problem_id;
    postElement.dataset.postType = post.idea_text ? 'idea' : 'problem';

    const typeText = post.idea_text ? '誰かの妄想' : '地域の課題';

    postElement.innerHTML = `
        <span class="post-type ${post.idea_text ? 'idea-type' : 'problem-type'}">
            ${typeText}
        </span>
        <h2 class="post-title">${post.idea_text || post.problem_text}</h2>
        <div class="tags-container">
            <div class="tags">
                ${post.categories ? post.categories.map(category => `
                    <span class="tag category-tag">#${category}</span>
                `).join('') : ''}
            </div>
            <div class="tags keyword-tags">
                ${post.keywords ? post.keywords.map(keyword => `
                    <span class="tag keyword-tag">#${keyword}</span>
                `).join('') : ''}
            </div>
        </div>
    `;

    return postElement;
}

// Function to render posts on the page
async function renderPosts() {
    try {
        const response = await getPosts();
        console.log("Parsed response:", response);

        if (!response || !response.items) {
            throw new Error('Unexpected response structure');
        }

        posts = response.items;

        if (!Array.isArray(posts)) {
            throw new Error('Posts is not an array');
        }

        const postList = document.querySelector('.post-list');
        postList.innerHTML = ''; // Clear existing posts

        if (posts.length === 0) {
            postList.innerHTML = '<p>No more posts available.</p>';
            return;
        }

        // Create and append each post element to the list
        posts.forEach(post => {
            const postElement = createPostElement(post);
            postList.appendChild(postElement);
        });

        // Initialize swipe functionality
        if (typeof window.initializeSwipeCards === 'function') {
            window.initializeSwipeCards();
        } else {
            console.error('initializeSwipeCards function not found');
        }

    } catch (error) {
        console.error("Error rendering posts:", error);
        const container = document.querySelector('.post-list');
        if (container) {
            container.innerHTML = `<p>Error loading posts: ${error.message}</p>`;
        }
    }
}

// Attach fetchPosts to window object for external calls
window.fetchPosts = function () {
    renderPosts();
};