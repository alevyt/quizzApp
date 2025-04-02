const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fileUpload = require("express-fileupload");
const parseExcel = require("../utils/parseExcel");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const fs = require("fs");
const sessionFile = "./sessionData.json";

// Function to save session data
function saveSessionData() {
    const sessionData = {
        teams,
        currentQuestionIndex,
        quizStarted
    };
    fs.writeFileSync(sessionFile, JSON.stringify(sessionData, null, 2));
}

// Function to load session data
function loadSessionData() {
    if (fs.existsSync(sessionFile)) {
        const data = JSON.parse(fs.readFileSync(sessionFile, "utf-8"));
        teams = data.teams || {};
        currentQuestionIndex = data.currentQuestionIndex || 0;
        quizStarted = data.quizStarted || false;
    }
}

// Load session data when the server starts
loadSessionData();


app.use(express.static("public"));
app.use(express.json());
app.use(fileUpload());

let teams = [];
let questions = [];
let currentQuestionIndex = -1;
let answers = {};

const activeQuiz = {
    currentQuestionIndex: null,
    questions: [],
    teams: {},
    answers: {},
};


// Serve admin, team, and leaderboard pages
app.get("/admin", (req, res) => res.sendFile(__dirname + "/public/admin.html"));
app.get("/team", (req, res) => res.sendFile(__dirname + "/public/team.html"));
app.get("/leaderboard", (req, res) => res.sendFile(__dirname + "/public/leaderboard.html"));

// Handle question file upload (admin uploads .xls)
app.post("/upload", async (req, res) => {
    console.log("File Upload Request Received:", req.files);

    if (!req.files || !req.files.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    
    try {
        questions = await parseExcel(req.files.file.data);
        currentQuestionIndex = -1;
        answers = {}; // Reset answers for new quiz
        io.emit("questionsUpdated", questions);
        res.json({ success: true, message: "Questions imported successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error processing file" });
    }
});

// WebSocket logic
io.on("connection", (socket) => {
    console.log("New client connected");

    // Team Registration
    socket.on("registerTeam", (teamName, callback) => {
        if (teams.find((team) => team.teamName === teamName)) {
            return callback({ success: false, message: "Team name already taken" });
        }
        teams.push({ teamName, score: 0 });
        callback({ success: true });
        io.emit("scoreUpdated", teams);
    });

    // Start Quiz (Admin)
    socket.on("startQuiz", () => {
        currentQuestionIndex = 0;
        answers = {};
        io.emit("newQuestion", questions[currentQuestionIndex]);
    });

    // Next Question (Admin)
    socket.on("nextQuestion", () => {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            answers = {}; // Reset answers for the new question
            io.emit("newQuestion", questions[currentQuestionIndex]);
        }
    });

    // Team Answer Submission
    socket.on("submitAnswer", ({ teamName, answer }) => {
        if (currentQuestionIndex === -1) return; // No active question
        
        answers[teamName] = answer;

        // Auto-check answer (if needed later, can be changed to manual checking)
        const correctAnswers = questions[currentQuestionIndex].correctAnswers.map(a => a.toLowerCase());
        if (correctAnswers.includes(answer.toLowerCase())) {
            const team = teams.find((t) => t.teamName === teamName);
            if (team) team.score += 1;
        }

        io.emit("scoreUpdated", teams);
    });

    // Admin Manually Edit Answers
    socket.on("updateAnswer", ({ teamName, newAnswer }) => {
        answers[teamName] = newAnswer;
        io.emit("answersUpdated", answers);
    });

    // Disconnect Handling
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

// Start Server
server.listen(3000, () => console.log("Server running on http://localhost:3000"));
