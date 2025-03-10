const xlsx = require("xlsx");

let quizData = [];
let currentQuestionIndex = -1;
let quizActive = false;
let answers = {}; // Stores team answers
let teams = {}; // Stores teams and scores

// -------------------- IMPORT QUESTIONS --------------------

function importQuestionsFromXLS(fileBuffer) {
    try {
        const workbook = xlsx.read(fileBuffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = xlsx.utils.sheet_to_json(sheet);

        quizData = jsonData.map(row => ({
            type: row.type || "text",
            questionText: row.questionText || "",
            options: row.options ? row.options.split(",").map(opt => opt.trim()) : [],
            correctAnswers: row.correctAnswers ? row.correctAnswers.toString().split(",").map(opt => opt.trim()) : [],
            mediaType: row.mediaType || "none", // 'image', 'video', 'audio', or 'none'
            mediaURL: row.mediaURL || ""
        }));

        resetQuizState();
        return { success: true, message: "Questions imported successfully." };
    } catch (error) {
        return { success: false, message: "Error processing file." };
    }
}

// -------------------- RESET QUIZ STATE --------------------

function resetQuizState() {
    currentQuestionIndex = -1;
    quizActive = false;
    answers = {};
    teams = {};
}

// -------------------- START QUIZ --------------------

function startQuiz() {
    if (quizData.length === 0) return { success: false, message: "No questions available." };
    currentQuestionIndex = 0;
    quizActive = true;
    answers = {}; // Reset answers
    return { success: true, question: getCurrentQuestion() };
}

// -------------------- GET CURRENT QUESTION --------------------

function getCurrentQuestion() {
    if (currentQuestionIndex < 0 || currentQuestionIndex >= quizData.length) return null;
    const question = quizData[currentQuestionIndex];

    return {
        questionText: question.questionText,
        options: question.options,
        mediaType: question.mediaType,
        mediaURL: question.mediaURL
    };
}

// -------------------- MOVE TO NEXT QUESTION --------------------

function nextQuestion() {
    if (currentQuestionIndex < quizData.length - 1) {
        currentQuestionIndex++;
        answers = {}; // Clear answers for the new question
        return { success: true, question: getCurrentQuestion() };
    }
    quizActive = false;
    return { success: false, message: "No more questions." };
}

// -------------------- REGISTER TEAM --------------------

function registerTeam(teamId, teamName) {
    if (!teams[teamId]) {
        teams[teamId] = { name: teamName, score: 0 };
    }
    return Object.values(teams);
}

// -------------------- SUBMIT ANSWER --------------------

function submitAnswer(teamId, answer) {
    if (!quizActive) return { success: false, message: "Quiz is not active." };
    if (!teams[teamId]) return { success: false, message: "Invalid team." };

    answers[teamId] = { teamName: teams[teamId].name, answer };
    return { success: true, answers: Object.values(answers) };
}

// -------------------- ADMIN MANUALLY MARK ANSWER CORRECT --------------------

function markCorrect(teamName, answer) {
    const teamEntry = Object.entries(teams).find(([id, team]) => team.name === teamName);
    if (!teamEntry) return { success: false, message: "Team not found." };

    const teamId = teamEntry[0];
    teams[teamId].score += 1;

    return { success: true, message: `${teamName}'s answer "${answer}" was marked correct!`, teams: Object.values(teams) };
}

// -------------------- END QUIZ --------------------

function endQuiz() {
    quizActive = false;
    return Object.values(teams).sort((a, b) => b.score - a.score);
}

// -------------------- EXPORT FUNCTIONS --------------------

module.exports = {
    importQuestionsFromXLS,
    startQuiz,
    getCurrentQuestion,
    nextQuestion,
    registerTeam,
    submitAnswer,
    markCorrect,
    endQuiz
};
