const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');

let currentQuestionIndex = 0;
let quizStarted = false;
let teams = {};
let answers = {};


const questions = [
    { question: 'What is the capital of France?', options: ['Paris', 'London', 'Berlin'], correctAnswers: ['Paris'] },
    { question: 'What is 2 + 2?', options: ['3', '4', '5'], correctAnswers: ['4'] },
];

let teamAnswers = {};

app.use(express.static(__dirname)); // Serve static files like admin.html

io.on('connection', (socket) => {
    console.log("A user connected");

    // Handle team joining
    socket.on("joinQuiz", (teamName, callback) => {
        // Check if the name is already taken
        if (Object.values(teams).some(team => team.name === teamName)) {
            return callback({ success: false });
        }

        // Assign a unique ID
        const teamId = socket.id;
        teams[teamId] = { name: teamName, score: 0 };

        // Notify the admin about new team
        io.emit("teamsUpdated", Object.values(teams));

        callback({ success: true, teamId });
    });

    socket.on("submitAnswer", ({ teamId, answer }) => {
        if (!teams[teamId]) return; // Ignore if team does not exist
        answers[teamId] = { teamName: teams[teamId].name, answer };

        // Notify admin of new answers
        io.emit("answersUpdated", Object.values(answers));
    });

    // Handle team disconnection
    socket.on("disconnect", () => {
        delete teams[socket.id];
        io.emit("teamsUpdated", Object.values(teams));
    });

    socket.on("startQuiz", () => {
        if (questions.length === 0) return;
        currentQuestionIndex = 0;
        io.emit("currentQuestion", { ...questions[currentQuestionIndex], index: currentQuestionIndex });
    });

    socket.on("prevQuestion", () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            io.emit("currentQuestion", { ...questions[currentQuestionIndex], index: currentQuestionIndex });
        }
    });

    socket.on("nextQuestion", () => {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            io.emit("currentQuestion", { ...questions[currentQuestionIndex], index: currentQuestionIndex });
        }
    });

    socket.emit("currentQuestion", currentQuestionIndex >= 0 ? { ...questions[currentQuestionIndex], index: currentQuestionIndex } : null);

    // Send current quiz state to newly connected users
    if (quizStarted) {
        socket.emit('quizStarted', { quizStarted });
        socket.emit('questionChanged', questions[currentQuestionIndex]);
    }

    // End the quiz
    socket.on('endQuiz', () => {
        quizStarted = false;
        io.emit('quizEnded', { quizStarted });
    });

    // Handle team answer submissions
    socket.on('submitAnswer', (teamId, answer) => {
        teamAnswers[teamId] = answer;
        io.emit('answerUpdated', teamAnswers);
    });

    // Allow admin to edit an answer
    socket.on('editAnswer', (teamId, newAnswer) => {
        if (teamAnswers[teamId]) {
            teamAnswers[teamId] = newAnswer;
            io.emit('answerUpdated', teamAnswers);
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });

    socket.on("markCorrect", ({ teamName, answer }) => {
        const team = Object.entries(teams).find(([id, team]) => team.name === teamName);
        if (!team) return;
    
        const teamId = team[0];
        teams[teamId].score += 1; // Increase score
    
        io.emit("answerCorrection", `${teamName}'s answer "${answer}" was marked correct!`);
        io.emit("teamsUpdated", Object.values(teams)); // Update scores in the admin panel
    });
    
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});



const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    try {
        const filePath = path.join(__dirname, req.file.path);
        const workbook = xlsx.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);

        // Transform data to match the expected question structure
        const importedQuestions = data.map(row => ({
            type: row.type,
            questionText: row.questionText,
            options: row.options ? row.options.toString().split(';') : [],
            correctAnswers: row.correctAnswers.toString().split(';'),
            mediaURL: row.mediaURL || ''
        }));

        // Replace current questions
        questions.length = 0;
        questions.push(...importedQuestions);

        io.emit('questionsUpdated', questions);

        res.json({ success: true });
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ success: false, error: 'Error processing file' });
    }
});

app.get('/questions', (req, res) => {
    res.json(questions);
});

