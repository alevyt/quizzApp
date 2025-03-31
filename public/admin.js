// import { nextTick } from "process";

const socket = io();
startQuizButton = document.getElementById("startQuiz");
nextQuestionButton = document.getElementById("nextQuestion");
endQuizButton = document.getElementById("endQuiz");

// Upload Excel File
document.getElementById("uploadFile").addEventListener("click", async () => {
    console.log("🚀 Upload button clicked!"); // Debug log

    const fileInput = document.getElementById("fileInput");
    if (!fileInput.files.length) {
        alert("Please select a file.");
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    console.log("📂 File ready to be uploaded:", fileInput.files[0].name); // Debug log

    try {
        console.log(formData); // Debug log
        console.log("📂 File ready to be uploaded:", fileInput.files[0].name); // Debug log

        const response = await fetch("/upload", {
            method: "POST",
            body: formData
        });

        console.log("✅ Request sent to /upload"); // Debug log

        const result = await response.json();
        console.log("✅ Server response:", result);
        if(result.success) {
            alert("Questions uploaded successfully");
            startQuizButton.disabled = false;
        }
        // document.getElementById("uploadStatus").innerText = result.message;
    } catch (error) {
        console.error("❌ Upload failed:", error);
        // document.getElementById("uploadStatus").innerText = "Upload failed!";
    }
});

socket.on("quizState", (quizState) => {
    console.log("📢 Received quiz state:", quizState);

    // Update UI with current quiz state
    if (quizState.currentQuestionIndex !== null) {
        document.getElementById("questionDisplay").innerText =
            quizState.questions[quizState.currentQuestionIndex].questionText;
    }
});

// Start Quiz
startQuizButton.addEventListener("click", () => {
    socket.emit("startQuiz", (response) => {
        alert(response.success ? "Quiz started!" : "Failed to start quiz.");
    });
    nextQuestionButton.disabled = false;
    endQuizButton.disabled = false;
    
});

// Move to Next Question
document.getElementById("nextQuestion").addEventListener("click", () => {
    socket.emit("nextQuestion", (response) => {
        if (response.success) {
            document.getElementById("currentQuestion").innerText = response.questionText;
        } else {
            alert("No more questions.");
        }
    });
});

// End Quiz
document.getElementById("endQuiz").addEventListener("click", () => {
    socket.emit("endQuiz", (scores) => {
        alert("Quiz ended! Final scores displayed.");
        updateScores(scores);
    });
});

// Listen for real-time question updates
socket.on("newQuestion", (question) => {
    document.getElementById("currentQuestion").innerText = question.questionText;
});

// Listen for team responses
socket.on("answersUpdated", (responses) => {
    console.log('responses', responses);
    const responseList = document.getElementById("teamResponses");
    responseList.innerHTML = "";
    responses.forEach(({ teamName, answer }) => {
        const li = document.createElement("li");
        li.innerText = `${teamName}: ${answer}`;
        responseList.appendChild(li);
    });
});

// Listen for score updates
socket.on("scoreUpdated", (teams) => {
    updateScores(teams);
});

// Update team scores
function updateScores(teams) {
    const scoreList = document.getElementById("teamScores");
    scoreList.innerHTML = "";
    teams.forEach(({ teamName, score }) => {
        const li = document.createElement("li");
        li.innerText = `${teamName}: ${score} points`;
        scoreList.appendChild(li);
    });
}
