# JS Arcade

A gamified single-page app in vanilla JavaScript: four short sessions (Pomodoro, Kanban, JS Memória and Reação) that each produce a percentage, plus a dashboard that turns them into a final score.

Play JS Arcade: https://thiagoschmitz-dev.github.io/JS-Arcade/

## Features

- **Pomodoro:** timed target-clicking round.
- **Kanban:** classify 6 technologies into frontend or backend, by drag and drop or keyboard.
- **JS Memória:** repeat the highlighted sequence, across 2 levels.
- **Reação:** reaction-time test.
- **Dashboard:** partial or final score, one progress bar per session and KPIs (total hits, errors, best reaction time, best session).
- **Persistent progress:** saved in the browser, with a "Reiniciar jornada" button to start over.

## Tech stack

HTML, CSS and JavaScript (ES modules). No backend, API, database, build step or dependencies.

## How to run

Do not open `index.html` through `file://`, because browsers restrict ES modules there.

1. Open the folder in VS Code.
2. Right-click `index.html` and choose **Open with Live Server**.
3. Use the `http://127.0.0.1:...` URL it shows.

Live Server is only a local preview tool and is not part of the application.

## Project structure

- `index.html`: single entry point.
- `css/style.css`: responsive, accessible styles.
- `js/state.js`: central state, calculations and persistence.
- `js/pomodoro.js`, `js/kanban.js`, `js/memoria.js`, `js/reacao.js`: one module per game.
- `js/dashboard.js`: dashboard and metrics.
- `js/main.js`: initialization and active navigation.

## Technical decisions

- **Single source of truth:** `state.js` owns all reads, writes and score calculations. The game modules only report results.
- **Event-driven UI:** every save dispatches a `progressoatualizado` event, and the dashboard re-renders from it.
- **Versioned storage:** data lives under `jsarcade:progresso` with a `versao` field, so the format can change later.
- **Completed sessions are locked:** Kanban and Reação save a `concluida` flag, so a finished session can't be replayed by accident.
- **Accessibility:** keyboard support, visible focus states and `prefers-reduced-motion`.
