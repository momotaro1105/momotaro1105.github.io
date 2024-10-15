const reasons = {
    problem: [
        'あまり課題と感じない',
        '解決済み',
        '課題感がわかりづらい',
        '地域課題ではない',
        'その他'
    ],
    idea: [
        'すでにある',
        '実現性がない',
        '需要が少ない',
        '法的・倫理的な問題がある',
        'その他'
    ]
};

let currentPostId, currentPostType;

function getUserIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('userId');
}

async function sendVote(postId, postType, voteType, reason = null) {
    const userId = getUserIdFromUrl();
    const body = {
        postId: postId,
        userId: userId,
        interactionType: voteType,
        reason: reason
    };

    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error('Failed to record vote');
        }

        console.log(`Vote recorded: ${voteType} for post ${postId}`);
        return true;
    } catch (error) {
        console.error("Error recording vote:", error);
        return false;
    }
}

function showReasonDialog(postType) {
    const reasonDialog = document.getElementById('reason-dialog');
    const reasonButtons = document.getElementById('reason-buttons');
    reasonButtons.innerHTML = '';
    reasons[postType].forEach(reason => {
        const button = document.createElement('button');
        button.className = 'reason-btn';
        button.textContent = reason;
        button.onclick = () => handleReasonSelect(reason);
        reasonButtons.appendChild(button);
    });
    reasonDialog.style.display = 'flex';
}

async function handleReasonSelect(reason) {
    console.log('Selected reason:', reason);
    const success = await sendVote(currentPostId, currentPostType, 'downvote', reason);
    hideReasonDialog();
    if (success) {
        showFeedbackIcon('left');
        window.moveToNextCard();
    } else {
        window.resetCardPosition();
    }
}

function hideReasonDialog() {
    const reasonDialog = document.getElementById('reason-dialog');
    if (reasonDialog) {
        reasonDialog.style.display = 'none';
    }
}

function showFeedbackIcon(direction) {
    const icon = document.getElementById(direction === 'right' ? 'thumbs-up' : 'thumbs-down');
    icon.classList.add('show');
    setTimeout(() => {
        icon.classList.remove('show');
    }, 1000);
}

window.handleVote = async function (direction) {
    const currentCard = document.querySelector('.post-card:not([style*="display: none"])');
    if (!currentCard) {
        console.error('No visible card found');
        return;
    }

    currentPostId = currentCard.dataset.postId;
    currentPostType = currentCard.dataset.postType;

    if (direction === 'right') {
        const success = await sendVote(currentPostId, currentPostType, 'upvote');
        if (success) {
            showFeedbackIcon('right');
            window.moveToNextCard();
        } else {
            window.resetCardPosition();
        }
    } else {
        showReasonDialog(currentPostType);
    }
};

document.addEventListener('click', function (event) {
    const reasonDialog = document.getElementById('reason-dialog');
    if (reasonDialog && event.target === reasonDialog) {
        hideReasonDialog();
        window.resetCardPosition();
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const reasonDialog = document.getElementById('reason-dialog');
    if (reasonDialog) {
        reasonDialog.querySelector('.dialog-content').addEventListener('click', function (event) {
            event.stopPropagation();
        });
    }
});