const socket = io();
let teamName = "";

// Register Team
document.getElementById("registerTeam").addEventListener("click", () => {
    const input = document.getElementById("teamName");
    if (!input.value.trim()) {
        alert("Enter a valid team name.");
        return;
    }

    teamName = input.value.trim();
    socket.emit("registerTeam", teamName, (response) => {
        if (response.success) {
            document.getElementById("registration").style.display = "none";
            document.getElementById("quizArea").style.display = "block";
        } else {
            alert("Registration failed. Team name might be taken.");
        }
    });
});

// Submit Answer
document.getElementById("submitAnswer").addEventListener("click", () => {
    const answer = document.getElementById("answerInput").value.trim();
    if (!answer) {
        alert("Enter an answer before submitting.");
        return;
    }

    socket.emit("submitAnswer", { teamName, answer });
});

// Listen for new questions
socket.on("newQuestion", (question) => {
    document.getElementById("currentQuestion").innerText = question.questionText;

    const mediaContainer = document.getElementById("mediaContainer");
    mediaContainer.innerHTML = ""; // Clear previous media

    if (question.mediaType && question.mediaURL) {
        let mediaElement;
        switch (question.mediaType) {
            case "image":
                mediaElement = document.createElement("img");
                mediaElement.src = question.mediaURL;
                mediaElement.style.maxWidth = "100%";
                break;
            case "video":
                mediaElement = document.createElement("video");
                mediaElement.src = question.mediaURL;
                mediaElement.controls = true;
                break;
            case "audio":
                mediaElement = document.createElement("audio");
                mediaElement.src = question.mediaURL;
                mediaElement.controls = true;
                break;
        }
        if (mediaElement) mediaContainer.appendChild(mediaElement);
    }
});

socket.on("quizState", (quizState) => {
    console.log("📢 Received quiz state:", quizState);

    if (quizState.currentQuestionIndex !== null) {
        document.getElementById("currentQuestion").innerText =
            quizState.questions[quizState.currentQuestionIndex].questionText;
    }
});

