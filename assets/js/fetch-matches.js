async function fetchMatches() {
    const userId = new URLSearchParams(window.location.search).get('userId');
    if (!userId) {
        console.error('URLにuserIdが見つかりません');
        showError('ユーザーIDが見つかりません。URLを確認してください。');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/matches?userId=${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        displayMatches(data.items);
    } catch (error) {
        console.error('マッチの取得中にエラーが発生しました:', error);
        showError('マッチの読み込み中にエラーが発生しました。後でもう一度お試しください。');
    }
}

function displayMatches(matches) {
    const matchesList = document.querySelector('.matches-list');
    matchesList.innerHTML = ''; // Clear existing content

    if (!matches || matches.length === 0) {
        matchesList.innerHTML = '<p>まだマッチはありません。もっと投稿にスワイプしてみましょう！</p>';
        return;
    }

    matches.forEach(match => {
        const matchElement = createMatchElement(match);
        matchesList.appendChild(matchElement);
    });
}

function createMatchElement(match) {
    const matchElement = document.createElement('div');
    matchElement.className = 'match-item swipeable';

    matchElement.innerHTML = `
        <div class="card-content">
            <div class="problem-section">
                <h3>あなたの課題</h3>
                <p>${match.problem.problem_text}</p>
            </div>
            <div class="idea-section">
                <h3>誰かの妄想</h3>
                <p>${match.idea.idea_text}</p>
            </div>
            <p class="match-score">❤️: ${(match.match_score * 100).toFixed(2)}%</p>
            <div class="tags-container">
                ${match.problem.categories ? match.problem.categories.map(category => `
                    <span class="tag category-tag">#${category}</span>
                `).join('') : ''}
                ${match.problem.keywords ? match.problem.keywords.map(keyword => `
                    <span class="tag keyword-tag">#${keyword}</span>
                `).join('') : ''}
            </div>
        </div>
    `;

    let startX;
    let currentX;

    matchElement.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });

    matchElement.addEventListener('touchmove', (e) => {
        currentX = e.touches[0].clientX;
        const diffX = currentX - startX;
        matchElement.style.transform = `translateX(${diffX}px)`;
    });

    matchElement.addEventListener('touchend', () => {
        const diffX = currentX - startX;
        if (Math.abs(diffX) > 100) {
            // Swipe threshold
            matchElement.style.transition = 'transform 0.3s ease-out';
            matchElement.style.transform = `translateX(${diffX > 0 ? '100%' : '-100%'})`;
            setTimeout(() => matchElement.remove(), 300);
        } else {
            matchElement.style.transition = 'transform 0.3s ease-out';
            matchElement.style.transform = 'translateX(0)';
        }
    });

    return matchElement;
}

function showError(message) {
    const matchesContainer = document.getElementById('matches-container');
    matchesContainer.innerHTML = `<p class="error-message">${message}</p>`;
}

// Call fetchMatches when the page loads
document.addEventListener('DOMContentLoaded', fetchMatches);