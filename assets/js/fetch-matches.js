let matches = [];
let currentCard = null;

function getUserIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    if (!userId) {
        console.error('No userId found in URL');
    }
    return userId;
}

async function getMatches(userId) {
    const url = `${API_BASE_URL}/matches?userId=${userId}`;
    console.log("Fetching from URL:", url);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Parsed response:", data);
        return data;
    } catch (error) {
        console.error("Error fetching or parsing matches:", error);
        throw error;
    }
}

function createMatchElement(match) {
    const matchElement = document.createElement('div');
    matchElement.className = 'match-item swipeable';
    matchElement.dataset.matchId = match.match_id;

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

    return matchElement;
}

async function renderMatches(userId) {
    try {
        const response = await getMatches(userId);

        if (!response || !response.items) {
            throw new Error('Unexpected response structure');
        }

        matches = response.items;

        if (!Array.isArray(matches)) {
            throw new Error('Matches is not an array');
        }

        const matchesList = document.querySelector('.matches-list');
        matchesList.innerHTML = ''; // Clear existing matches

        if (matches.length === 0) {
            matchesList.innerHTML = '<p>まだマッチはありません。もっと投稿にスワイプしてみましょう！</p>';
            return;
        }

        // Create and append each match element to the list
        matches.forEach(match => {
            const matchElement = createMatchElement(match);
            matchesList.appendChild(matchElement);
        });

        // Initialize swipe functionality
        initializeSwipeCards();

    } catch (error) {
        console.error("Error rendering matches:", error);
        const container = document.querySelector('.matches-list');
        if (container) {
            container.innerHTML = `<p>Error loading matches: ${error.message}</p>`;
        }
    }
}

function showFeedbackIcon(direction) {
    const icon = document.getElementById(direction === 'right' ? 'match-feedback' : 'thumbs-down');
    icon.classList.add('show');
    setTimeout(() => {
        icon.classList.remove('show');
    }, 1000);
}

function updateCardPositions() {
    const cards = Array.from(document.querySelectorAll('.match-item'));
    cards.forEach((card, index) => {
        if (card.style.display !== 'none') {
            card.style.zIndex = cards.length - index;
            card.style.transform = `scale(${1 - index * 0.05}) translateY(${index * 1}%)`;
            card.style.opacity = index === 0 ? 1 : 1 - index * 0.4;
        }
    });
}

function initializeSwipeCards() {
    const matchesList = document.querySelector('.matches-list');
    const cards = Array.from(matchesList.getElementsByClassName('match-item'));
    let currentIndex = 0;

    function resetCardPosition(card) {
        card.style.transition = 'transform 0.5s ease';
        card.style.transform = 'translate(0, 0) rotate(0deg)';
    }

    cards.forEach(card => {
        let startX, startY, moveX, moveY;

        function onDragStart(e) {
            startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
            startY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
            card.style.transition = 'none';
            currentCard = card;
        }

        function onDragMove(e) {
            if (!startX || !startY) return;
            moveX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
            moveY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
            const deltaX = moveX - startX;
            const deltaY = moveY - startY;
            const rotation = deltaX * 0.1;
            card.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotation}deg)`;
        }

        function onDragEnd() {
            if (!startX || !startY || !moveX || !moveY) return;
            const deltaX = moveX - startX;

            if (Math.abs(deltaX) > window.innerWidth * 0.4) {
                const direction = deltaX > 0 ? 'right' : 'left';
                card.style.transition = 'transform 0.5s ease';
                card.style.transform = `translate(${direction === 'right' ? '150%' : '-150%'}, ${moveY - startY}px) rotate(${deltaX * 0.1}deg)`;

                if (direction === 'right') {
                    showFeedbackIcon(direction);
                    currentIndex++;
                    setTimeout(() => {
                        card.style.display = 'none';
                        updateCardPositions();
                    }, 500);
                } else {
                    showMatchReasonDialog();
                }
            } else {
                resetCardPosition(card);
            }

            startX = startY = moveX = moveY = null;
        }

        card.addEventListener('mousedown', onDragStart);
        card.addEventListener('touchstart', onDragStart);
        card.addEventListener('mousemove', onDragMove);
        card.addEventListener('touchmove', onDragMove);
        card.addEventListener('mouseup', onDragEnd);
        card.addEventListener('touchend', onDragEnd);
    });

    updateCardPositions();
}

function showMatchReasonDialog() {
    const reasonDialog = document.getElementById('match-reason-dialog');
    const reasonButtons = document.getElementById('match-reason-buttons');
    reasonButtons.innerHTML = '';

    const reasons = [
        '課題の解決にならない',
        '実現性が低い',
        '解決済み',
        'その他'
    ];

    reasons.forEach(reason => {
        const button = document.createElement('button');
        button.className = 'reason-btn';
        button.textContent = reason;
        button.onclick = () => handleMatchReasonSelect(reason);
        reasonButtons.appendChild(button);
    });

    reasonDialog.style.display = 'flex';
}

function handleMatchReasonSelect(reason) {
    console.log('Selected reason for match:', reason);
    hideMatchReasonDialog();
    if (currentCard) {
        showFeedbackIcon('left'); // This should now work
        currentCard.style.transition = 'transform 0.5s ease';
        currentCard.style.transform = 'translate(-150%, 0) rotate(-10deg)';
        setTimeout(() => {
            currentCard.style.display = 'none';
            currentCard = null;
            updateCardPositions();
        }, 500);
    }
}

function hideMatchReasonDialog() {
    const reasonDialog = document.getElementById('match-reason-dialog');
    if (reasonDialog) {
        reasonDialog.style.display = 'none';
    }
}

// Attach fetchMatches to window object for external calls
window.fetchMatches = function (userId) {
    renderMatches(userId);
};

// Close dialog when tapping outside
document.addEventListener('click', function (event) {
    const reasonDialog = document.getElementById('match-reason-dialog');
    if (reasonDialog && event.target === reasonDialog) {
        hideMatchReasonDialog();
        if (currentCard) {
            currentCard.style.transition = 'transform 0.5s ease';
            currentCard.style.transform = 'translate(0, 0) rotate(0deg)';
        }
    }
});