# JS Arcade

A single-page application in vanilla JavaScript with four short sessions: Pomodoro, Kanban, JS Memory, and Reaction. Each session produces a percentage, and the dashboard calculates the average using only completed sessions.

JS Arcade is a pure frontend project: it has no backend, Python, API, database, build process, or application dependencies. `index.html` is the single entry point and uses ES6 JavaScript modules (`import` and `export`).

Do not open `index.html` through `file://`, because some browsers block or restrict modules and the buttons may not work. Use Live Server only as an external preview tool: open the folder in VS Code, open `index.html`, right-click it, choose **Open with Live Server**, and use the `http://localhost:...` or `http://127.0.0.1:...` URL shown by VS Code. Live Server is not part of the application and does not create a backend.

Progress is stored locally in the browser under the `jsarcade:progresso` `localStorage` key.

## Structure

- `css/style.css`: responsive and accessible visual styles.
- `js/state.js`: central state, calculations, and persistence.
- `js/pomodoro.js`, `js/kanban.js`, `js/memoria.js`, `js/reacao.js`: isolated game mechanics.
- `js/dashboard.js`: progress dashboard and metrics.
- `js/main.js`: application initialization and active navigation.
