function initializeSwipeCards() {
    const postList = document.querySelector('.post-list');
    const cards = Array.from(postList.getElementsByClassName('post-card'));
    const thumbsUp = document.getElementById('thumbs-up');
    const thumbsDown = document.getElementById('thumbs-down');
    const reasonDialog = document.getElementById('reason-dialog');
    const reasonButtons = document.getElementById('reason-buttons');
    let currentIndex = 0;
    let isDragging = false;
    let startX, startY, currentX, currentY;

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

    function updateCardPositions() {
        cards.forEach((card, index) => {
            if (index < currentIndex) {
                card.style.display = 'none';
            } else {
                card.style.display = 'flex';
                card.style.zIndex = cards.length - index;
                card.style.transform = `scale(${1 - (index - currentIndex) * 0.02}) translateY(${(index - currentIndex) * 1}%)`;
                card.style.opacity = index === currentIndex ? 1 : 1 - (index - currentIndex) * 0.4;
            }
        });
    }

    function showFeedbackIcon(direction) {
        const icon = direction === 'right' ? thumbsUp : thumbsDown;
        icon.classList.add('show');
        setTimeout(() => {
            icon.classList.remove('show');
        }, 1000);
    }

    function showReasonDialog(postType) {
        reasonButtons.innerHTML = '';
        reasons[postType].forEach(reason => {
            const button = document.createElement('button');
            button.className = 'reason-btn';
            button.textContent = reason;
            button.onclick = () => handleReasonSelect(reason);
            reasonButtons.appendChild(button);
        });
        reasonDialog.style.display = 'flex'; // Change this to 'flex'
    }

    function handleReasonSelect(reason) {
        console.log('Selected reason:', reason);
        hideReasonDialog();
        handleSwipe('left');
    }

    function hideReasonDialog() {
        if (reasonDialog) {
            reasonDialog.style.display = 'none';
        }
        resetCardPosition();
    }

    function resetCardPosition() {
        const card = cards[currentIndex];
        card.style.transition = 'transform 0.3s ease';
        card.style.transform = '';
    }

    function handleSwipe(direction) {
        const card = cards[currentIndex];
        const swipeOutDistance = direction === 'right' ? window.innerWidth : -window.innerWidth;

        card.style.transition = 'transform 0.5s ease';
        card.style.transform = `translateX(${swipeOutDistance}px) rotate(${direction === 'right' ? 20 : -20}deg)`;

        showFeedbackIcon(direction);

        setTimeout(() => {
            card.style.display = 'none';
            card.style.transform = '';
            card.style.transition = '';
            currentIndex = (currentIndex + 1) % cards.length;
            updateCardPositions();
        }, 500);

        console.log(`Swiped ${direction} on:`, card.dataset.postId);
    }

    function onDragStart(e) {
        if (e.target.closest('.post-card') !== cards[currentIndex]) return;
        isDragging = true;
        startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        startY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        cards[currentIndex].style.transition = 'none';
    }

    function onDragMove(e) {
        if (!isDragging) return;
        currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        currentY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;
        const rotation = deltaX * 0.1;
        cards[currentIndex].style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotation}deg)`;
    }

    function onDragEnd() {
        if (!isDragging) return;
        isDragging = false;
        const deltaX = currentX - startX;

        if (Math.abs(deltaX) > window.innerWidth * 0.4) {
            if (deltaX > 0) {
                handleSwipe('right');
            } else {
                const postType = cards[currentIndex].dataset.postType;
                showReasonDialog(postType);
            }
        } else {
            resetCardPosition();
        }

        setTimeout(() => {
            isDragging = false;
        }, 100);
    }

    postList.addEventListener('mousedown', onDragStart);
    postList.addEventListener('touchstart', onDragStart);
    postList.addEventListener('mousemove', onDragMove);
    postList.addEventListener('touchmove', onDragMove);
    postList.addEventListener('mouseup', onDragEnd);
    postList.addEventListener('touchend', onDragEnd);

    // Close reason dialog when clicking outside
    document.addEventListener('click', function (event) {
        if (reasonDialog && event.target === reasonDialog) {
            hideReasonDialog();
        }
    });

    // Prevent closing when clicking inside the dialog content
    if (reasonDialog) {
        reasonDialog.querySelector('.dialog-content').addEventListener('click', function (event) {
            event.stopPropagation();
        });
    }

    updateCardPositions();
}

// This function will be called from fetch-posts.js after the posts are loaded
window.initializeSwipeCards = initializeSwipeCards;