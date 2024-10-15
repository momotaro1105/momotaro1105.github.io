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
    matchElement.className = 'match-item';

    const typeText = match.type === 'idea' ? 'アイデア' : '課題';
    const matchText = match.type === 'idea' ? match.idea_text : match.problem_text;

    matchElement.innerHTML = `
        <h3>${typeText}: ${matchText}</h3>
        <p>マッチ度: ${match.match_score}%</p>
        <div class="tags-container">
            ${match.categories ? match.categories.map(category => `
                <span class="tag category-tag">#${category}</span>
            `).join('') : ''}
            ${match.keywords ? match.keywords.map(keyword => `
                <span class="tag keyword-tag">#${keyword}</span>
            `).join('') : ''}
        </div>
    `;

    return matchElement;
}

function showError(message) {
    const matchesContainer = document.getElementById('matches-container');
    matchesContainer.innerHTML = `<p class="error-message">${message}</p>`;
}

// Call fetchMatches when the page loads
document.addEventListener('DOMContentLoaded', fetchMatches);