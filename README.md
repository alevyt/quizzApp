# Quiz App

This is a real-time quiz application that allows teams to join via a link, register, and participate in a quiz. The admin can control the quiz, switch questions, monitor answers and results, and manually edit responses if needed.

## Features
- **Admin Panel**: Start quizzes, manage questions, and monitor answers.
- **Team Registration**: Teams can register and participate in quizzes.
- **Real-time Updates**: Uses WebSockets for live communication.
- **Question Import**: Upload questions via `.xls` files.
- **Media Support**: Questions can include images, videos, or audio.
- **Persistent Data**: The quiz session remains active even if pages are reloaded.
- **Local & Network Access**: Easily share the quiz link for others to join.

## Installation
### Prerequisites
- Node.js (Latest LTS version recommended)
- npm (comes with Node.js)

### Setup
1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd quiz-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
   or use the provided script:
   ```bash
   ./start_quiz.sh
   ```
4. Open the Admin Panel in your browser:
   ```
   http://localhost:3000/admin
   ```
5. Share the **team registration link**:
   ```
   http://<YOUR_LOCAL_IP>:3000/team
   ```
   (Your local IP is printed in the terminal when the server starts.)

## Usage
### Admin Panel
- Upload `.xls` files to import questions.
- Start and control the quiz.
- Monitor team answers and adjust if necessary.
- View the leaderboard in real-time.

### Teams
- Register a team using the link.
- Answer questions as they appear.
- See real-time score updates.

## File Structure
```
quiz-app/
│── node_modules/           # Dependencies (installed via npm)
│── public/                 # Frontend files (HTML, CSS, JS)
│   ├── admin.html          # Admin panel (quiz control)
│   ├── team.html           # Team interface (answer submission)
│   ├── leaderboard.html     # (Optional) Leaderboard page
│   ├── styles.css          # Main CSS for styling
│   ├── admin.js            # JS for admin panel
│   ├── team.js             # JS for team view
│   ├── leaderboard.js      # (Optional) JS for leaderboard
│── uploads/                # (Optional) Store uploaded files (if needed later)
│── server/                 # Backend logic
│   ├── index.js            # Main Express & WebSocket server
│   ├── quizController.js   # Quiz logic (parsing questions, validation)
│   ├── socketHandler.js    # WebSocket event handling
│── utils/                  # Helper functions
│   ├── parseExcel.js       # Parses `.xls` into JSON
│── package.json            # Dependencies & scripts
│── package-lock.json       # Dependency lockfile
│── .gitignore              # Ignore node_modules, uploads
│── README.md               # Project documentation
```

## Technologies Used
- **Backend**: Node.js, Express.js, Socket.io
- **Frontend**: HTML, CSS, JavaScript
- **Data Handling**: XLSX for Excel parsing

## Future Enhancements
- Support for `.csv` imports
- Cloud storage for media files
- User authentication for teams

## Troubleshooting
- **File upload fails**: Ensure your `.xls` file follows the correct format.
- **Cannot access from another device**: Run the script (`./start_quiz.sh`) and use the printed network IP.
- **WebSocket issues**: Check browser console logs and restart the server.

---
**Developed by:** Andrii Levytskyi

