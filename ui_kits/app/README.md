# Arrow Gym — App UI Kit

High-fidelity interactive recreation of the Arrow Gym mobile app (V4), built as a click-through prototype using React + Babel.

## Product
Arrow Gym is a single-product mobile-first PWA for iPhone. Max-width 520px, installable to home screen. Single dark theme. Spanish/Rioplatense copy.

## Screens
5 core screens are implemented as interactive click-throughs:

| Screen | Nav | What it shows |
|--------|-----|---------------|
| **Home** (Inicio) | ⚡ | Hero, stats grid, week card, muscle map, last workout, calendar |
| **Start** | ▶ | Routine cards (Push/Pull/Legs/Full Body), cardio, Libre |
| **Workout** | auto | Active workout: exercise blocks, set cards, quick-actions, finish button |
| **Coach** | 🧠 | Score badges (8), status/rec/warning/PR blocks, 4 tabs |
| **Progress** | 📈 | Radar, distribution bars, 1RM list |

Overlays: rest timer modal, exercise picker sheet, More menu sheet.

## Files
- `index.html` — entry point, loads all scripts, iOS frame
- `data.jsx` — seed data: routines, exercises, sample workout, coach scores, radar
- `app.css` — faithful subset of `src/styles.css` from the real codebase
- `ui.jsx` — shared primitives: BottomNav, ScoreBadge, Sparkline, MuscleMap, Radar
- `screens.jsx` — HomeScreen, StartScreen, WorkoutScreen, CoachScreen, ProgressScreen
- `app.jsx` — root App: state, rest timer, exercise sheet, more menu, iOS frame
- `ios-frame.jsx` — iOS device bezel starter component

## Data & Storage ⚠️
The UI kit uses **mock data** from `data.jsx`. The real Arrow Gym app stores workout history in **IndexedDB via `idb-keyval`** (see `src/lib/idbStorage.js`), with a **localStorage → IndexedDB migration layer** (`src/lib/storageMigration.js`).

**CRITICAL for real-app changes:** never clear or overwrite the IndexedDB store (`arrow-gym-v4`) when deploying updates. The migration layer seeds from `src/data/seedData.js` only on first run (checks for existing data). Any schema changes must be backward-compatible or add a versioned migration step.

## Usage
Open `index.html` — the app scales to fit any viewport inside an iOS 26 bezel.

## Source
Reverse-engineered from [`mateo524/arrow-gym-app`](https://github.com/mateo524/arrow-gym-app) (branch `master`). The single source of truth for styles is `src/styles.css`; for component structure, `src/pages/` and `src/components/`.
