// match-posts.js

async function postMatchInteraction(userId, problemId, ideaId, swipeDirection, reason = null) {
    const url = `${API_BASE_URL}/matches`;
    const body = {
        userId,
        problemId,
        ideaId,
        swipeDirection,
        reason
    };

    console.log("Sending match interaction:", body); // Add this for debugging

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        console.log("Match interaction recorded:", data);
        return data;
    } catch (error) {
        console.error("Error recording match interaction:", error);
        throw error;
    }
}

// Export the function to make it available to other scripts
window.postMatchInteraction = postMatchInteraction;