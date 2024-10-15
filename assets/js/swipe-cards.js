let currentIndex = 0;
let cards = [];

function initializeSwipeCards() {
    const postList = document.querySelector('.post-list');
    cards = Array.from(postList.getElementsByClassName('post-card'));
    const thumbsUp = document.getElementById('thumbs-up');
    const thumbsDown = document.getElementById('thumbs-down');
    let isDragging = false;
    let startX, startY, currentX, currentY;

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

    function resetCardPosition() {
        const card = cards[currentIndex];
        card.style.transition = 'transform 0.3s ease';
        card.style.transform = 'translate(0, 0) rotate(0deg)';
        setTimeout(() => {
            card.style.transition = '';
        }, 300);
    }

    function animateSwipe(direction) {
        const card = cards[currentIndex];
        const swipeOutDistance = direction === 'right' ? window.innerWidth : -window.innerWidth;

        card.style.transition = 'transform 0.5s ease';
        card.style.transform = `translateX(${swipeOutDistance}px) rotate(${direction === 'right' ? 20 : -20}deg)`;

        window.handleVote(direction);
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
            const direction = deltaX > 0 ? 'right' : 'left';
            animateSwipe(direction);
        } else {
            resetCardPosition();
        }
    }

    postList.addEventListener('mousedown', onDragStart);
    postList.addEventListener('touchstart', onDragStart);
    postList.addEventListener('mousemove', onDragMove);
    postList.addEventListener('touchmove', onDragMove);
    postList.addEventListener('mouseup', onDragEnd);
    postList.addEventListener('touchend', onDragEnd);

    updateCardPositions();

    window.resetCardPosition = resetCardPosition;
    window.moveToNextCard = function () {
        currentIndex++;
        updateCardPositions();
    };
}

window.initializeSwipeCards = initializeSwipeCards;