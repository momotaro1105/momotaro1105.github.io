const API_BASE_URL = 'https://jighvu1u6c.execute-api.ap-northeast-1.amazonaws.com/dev';

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
    } catch (error) {
        console.error("Error recording vote:", error);
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

function handleReasonSelect(reason) {
    console.log('Selected reason:', reason);
    hideReasonDialog();
    sendVote(currentPostId, currentPostType, 'downvote', reason);
}

function hideReasonDialog() {
    const reasonDialog = document.getElementById('reason-dialog');
    if (reasonDialog) {
        reasonDialog.style.display = 'none';
    }
}

// This function will be called from swipe-cards.js
window.handleVote = function (direction) {
    const currentCard = document.querySelector('.post-card:not([style*="display: none"])');
    currentPostId = currentCard.dataset.postId;
    currentPostType = currentCard.dataset.postType;

    if (direction === 'right') {
        sendVote(currentPostId, currentPostType, 'upvote');
    } else {
        showReasonDialog(currentPostType);
    }
};

// Close reason dialog when clicking outside
document.addEventListener('click', function (event) {
    const reasonDialog = document.getElementById('reason-dialog');
    if (reasonDialog && event.target === reasonDialog) {
        hideReasonDialog();
    }
});

// Prevent closing when clicking inside the dialog content
document.addEventListener('DOMContentLoaded', function () {
    const reasonDialog = document.getElementById('reason-dialog');
    if (reasonDialog) {
        reasonDialog.querySelector('.dialog-content').addEventListener('click', function (event) {
            event.stopPropagation();
        });
    }
});