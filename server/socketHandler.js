const quizController = require("./quizController");

function setupSockets(io) {
    // io.on("connection", (socket) => {
    //     console.log("A user connected:", socket.id);

    //     // -------------------- ADMIN EVENTS --------------------

    //     // Import questions from .xls file
    //     socket.on("importQuestions", (fileBuffer, callback) => {
    //         const result = quizController.importQuestionsFromXLS(fileBuffer);
    //         io.emit("questionsUpdated", quizController.getCurrentQuestion()); // Broadcast new questions
    //         callback(result);
    //     });

    //     // Start quiz
    //     socket.on("startQuiz", (callback) => {
    //         const result = quizController.startQuiz();
    //         io.emit("quizStarted", result);
    //         callback(result);
    //     });

    //     // Move to next question
    //     socket.on("nextQuestion", (callback) => {
    //         const result = quizController.nextQuestion();
    //         io.emit("newQuestion", result);
    //         callback(result);
    //     });

    //     // Mark answer correct manually
    //     socket.on("markCorrect", (teamName, answer, callback) => {
    //         const result = quizController.markCorrect(teamName, answer);
    //         io.emit("scoreUpdated", result.teams);
    //         callback(result);
    //     });

    //     // End quiz
    //     socket.on("endQuiz", (callback) => {
    //         const finalScores = quizController.endQuiz();
    //         io.emit("quizEnded", finalScores);
    //         callback(finalScores);
    //     });

    //     // -------------------- TEAM EVENTS --------------------

    //     // Register a team
    //     socket.on("registerTeam", (teamId, teamName, callback) => {
    //         const teams = quizController.registerTeam(teamId, teamName);
    //         io.emit("teamsUpdated", teams);
    //         callback(teams);
    //     });

    //     // Submit an answer
    //     socket.on("submitAnswer", (teamId, answer, callback) => {
    //         const result = quizController.submitAnswer(teamId, answer);
    //         io.emit("answersUpdated", result.answers);
    //         callback(result);
    //     });

    //     // Handle disconnection
    //     socket.on("disconnect", () => {
    //         console.log("User disconnected:", socket.id);
    //     });
    // });
    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);
    
        // Send current quiz state when a new client connects
        console.log("🛠️ Sending quiz state:", activeQuiz);
        socket.emit("quizState", activeQuiz);
    
        // Handle admin switching to the next question
        socket.on("nextQuestion", () => {
            if (activeQuiz.currentQuestionIndex === null) {
                activeQuiz.currentQuestionIndex = 0;
            } else if (activeQuiz.currentQuestionIndex < activeQuiz.questions.length - 1) {
                activeQuiz.currentQuestionIndex++;
            }
            io.emit("quizState", activeQuiz); // Send updated quiz state to all clients
        });
    
        // Handle team registration
        socket.on("registerTeam", (teamName) => {
            if (!activeQuiz.teams[teamName]) {
                activeQuiz.teams[teamName] = { name: teamName, score: 0 };
            }
            socket.emit("quizState", activeQuiz); // Send updated state to the team
            io.emit("teamsUpdated", activeQuiz.teams);
        });
    
        // Handle answer submission
        socket.on("submitAnswer", ({ teamName, answer }) => {
            if (!activeQuiz.answers[teamName]) {
                activeQuiz.answers[teamName] = [];
            }
            activeQuiz.answers[teamName].push({
                questionIndex: activeQuiz.currentQuestionIndex,
                answer,
            });
            io.emit("answersUpdated", activeQuiz.answers);
        });
    
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    }); 
}

module.exports = setupSockets;
