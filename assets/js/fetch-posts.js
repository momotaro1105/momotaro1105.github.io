const API_BASE_URL = 'https://jighvu1u6c.execute-api.ap-northeast-1.amazonaws.com/dev';

let posts = [];

function getUserIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    if (!userId) {
        console.error('No userId found in URL');
        // You might want to handle this case, perhaps by redirecting to an error page
    }
    return userId;
}

async function getPosts(params = {}) {
    const userId = getUserIdFromUrl();
    if (!userId) {
        throw new Error('User ID is required');
    }
    params.userId = userId;
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/posts${queryString ? `?${queryString}` : ''}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Could not fetch posts:", error);
        throw error;
    }
}

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

async function renderPosts() {
    try {
        const response = await getPosts();
        console.log("Full API Response:", response);

        posts = response.items;
        if (!Array.isArray(posts)) {
            console.error('Unexpected data structure:', response);
            return;
        }

        const postList = document.querySelector('.post-list');
        postList.innerHTML = '';

        if (posts.length === 0) {
            postList.innerHTML = '<p>No more posts available.</p>';
            return;
        }

        posts.forEach(post => {
            const postElement = createPostElement(post);
            postList.appendChild(postElement);
        });

        // Initialize swipe functionality
        initializeSwipeCards();

        // Display raw API response
        const apiResponseElement = document.getElementById('api-response');
        if (apiResponseElement) {
            apiResponseElement.textContent = JSON.stringify(response, null, 2);
        }

    } catch (error) {
        console.error("Error rendering posts:", error);
        const container = document.querySelector('.post-list');
        if (container) {
            container.innerHTML = '<p>Error loading posts. Please try again later.</p>';
        }
    }
}

document.addEventListener('DOMContentLoaded', renderPosts);