const socket = io();

// Listen for live score updates
socket.on("scoreUpdated", (teams) => {
    const scoreList = document.getElementById("scoreList");
    scoreList.innerHTML = ""; // Clear old scores

    // Sort teams by score (descending)
    teams.sort((a, b) => b.score - a.score);

    teams.forEach(({ teamName, score }) => {
        const li = document.createElement("li");
        li.innerText = `${teamName}: ${score} points`;
        scoreList.appendChild(li);
    });
});
