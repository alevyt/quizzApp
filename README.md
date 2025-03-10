Nodejs app to host quizes

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