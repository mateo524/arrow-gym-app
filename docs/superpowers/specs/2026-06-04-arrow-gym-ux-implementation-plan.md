# Arrow Gym V4 — UI/UX Implementation Plan

## Overview

Ongoing phased implementation. Each phase is self-contained and doesn't break existing data.

## Dependency Installation Order

```bash
npm install lucide-react framer-motion
# Future phases:
# npm install wouter react-window
```

---

## Phase 1 — Foundation (Tokens, Icons, Accessibility)

### 1.1 Install deps
`npm install lucide-react framer-motion`

### 1.2 Design Token CSS
Enhance `src/styles.css` root block with semantic tokens:
- Spacing scale (--sp-1 through --sp-10)
- Typography scale (--fs-display, --fs-h1, --fs-h2, etc.)
- Elevation scale (--elevation-surface through --elevation-modal)
- Semantic color tokens (--c-bg, --c-panel, --c-text, etc.)

### 1.3 Icon Component
Create `src/components/Icon.jsx` wrapping `lucide-react` dynamic import.

### 1.4 Nav Component
Replace emoji icons (⚡, ▶, 🧠, ◈, ☰, +) with Lucide components (Home, Play, BrainCircuit, Map, Clock, Dumbbell).

### 1.5 Accessibility Baseline
- Add `button:focus-visible, input:focus-visible` outline rules
- Add `prefers-reduced-motion` media query
- Add `touch-action: manipulation` to body
- Add `aria-label` attributes to icon-only buttons

### Files to modify:
- `package.json` (deps added)
- `src/styles.css` (tokens + accessibility)
- `src/components/Nav.jsx` (icon swap)
- `src/components/Icon.jsx` (new file)
- `src/components/WorkoutSetCard.jsx` (aria-labels)
- `index.html` (meta viewport touch-action)

---

## Phase 2 — Animation & Micro-interactions

### 2.1 CSS Micro-interactions
- Button `:active { transform: scale(0.97) }`
- All interactive elements: `transition: transform 150ms ease, opacity 150ms ease`
- Nav active indicator slide

### 2.2 Page Transitions (Framer Motion)
- Wrap page content in `motion.div` with enter/exit variants
- `AnimatePresence` in App.jsx for route transitions

### 2.3 Loading States
- Skeleton shimmer CSS for ExercisePicker results
- Loading spinner for coach report generation

### Files to modify:
- `src/styles.css` (animations)
- `src/App.jsx` (AnimatePresence)
- All page components (motion.div wrapper)

---

## Phase 3 — Workout Experience

### 3.1 Rest Timer
- Timer component with circular SVG progress
- Auto-trigger on set completion (weight+reps entered)
- Vibration on completion
- Store in Zustand: `restTimer: { active: bool, endTime: timestamp, exercise: string }`

### 3.2 Previous Set Ghost
- Pre-fill next set with last set values at 50% opacity
- On tap/focus, opacity → 100%

### 3.3 Swipe Actions (Framer Motion)
- `motion.div` with drag="x" on set cards
- Threshold reveals delete (left) or duplicate (right) action
- Vibration on threshold cross

### 3.4 Volume Mini-Chart
- Pure SVG sparkline in exercise-block header
- Data from `getExerciseStats` → last 5 sessions volume

### 3.5 Quick Weight Steppers
- Add ±5kg buttons
- Add warm-up set button
- Long-press rapid adjust

### 3.6 Plate Calculator
- Bottom sheet modal with common plate combos
- Triggered by tapping weight input

### Files to modify:
- `src/components/WorkoutSetCard.jsx`
- `src/pages/WorkoutPage.jsx`
- `src/store/useStore.js` (rest timer state)
- New: `src/components/RestTimer.jsx`
- New: `src/components/PlateCalculator.jsx`
- New: `src/components/VolumeSparkline.jsx`

---

## Phase 4 — Navigation & Polish

### 4.1 wouter routing
- Install wouter
- Replace Zustand `currentPage` with wouter `useLocation` + `Switch`
- Preserve `setPage` as wrapper around `router.push()`

### 4.2 5-tab Nav
- Remove "Ejercicios" tab from bottom nav
- Access exercises via Start page "Banco de ejercicios" button or WorkoutPage "+ Agregar ejercicio"

### 4.3 Badge Component
- Red dot indicator on Start (active workout) and Coach (new reports)
- Badge dot: `width: 8px; height: 8px; background: var(--c-danger); border-radius: 50%; position: absolute; top: 2px; right: 2px`

### 4.4 State Preservation
- Zustand store: `scrollPositions: {}` keyed by route
- Save scroll on page leave, restore on page enter

### Files to modify:
- `src/App.jsx` (routing)
- `src/components/Nav.jsx` (5 tabs + badges)
- `src/store/useStore.js` (scroll state)

---

## Phase 5 — Coach & Muscle Map

### 5.1 Actionable Insights
- Rules engine in `src/lib/analytics.js`: compare volume by muscle group week-over-week
- Return actionable strings with "Apply" action
- Swipeable insight cards

### 5.2 Muscle Map Interactions
- Tap SVG muscle path → set active muscle in Zustand → filter or show chart
- Long press → tooltip overlay with stats
- Weekly comparison toggle
- Colorblind mode toggle (SVG pattern overlays)

### 5.3 PR Detection
- On `finishWorkout`, compare each set to `workouts` history
- Store PRs: `prs: [{ exercise, weight, reps, date }]`
- Celebration on coach page (confetti animation)

### 5.4 Export
- `html2canvas` or SVG serialization of muscle map
- Share via Web Share API

### Files to modify:
- `src/pages/CoachPage.jsx`
- `src/pages/MapPage.jsx`
- `src/components/AdvancedMuscleDiagram.jsx`
- `src/lib/analytics.js`
- `src/store/useStore.js`

---

## Phase 6 — Exercise Picker

### 6.1 Virtualized List
- Install react-window
- Replace `.exercise-results` div with `FixedSizeList`

### 6.2 Horizontal Muscle Chips
- Replace dropdown selects with chip row
- Chip: `display: inline-flex; border-radius: 100px; padding: 6px 14px; font-size: 13px`

### 6.3 Recent/Favorites
- Track last 5 picked exercises in Zustand
- Show "Recientes" section at top of picker
- Star icon per exercise → toggle favorite (persisted)

### 6.4 Search Enhancements
- Debounced input (300ms)
- Recent searches below input
- Basic fuzzy: normalize diacritics, word-order

### Files to modify:
- `src/components/ExercisePicker.jsx`
- `src/store/useStore.js` (recent/favorites state)
- `src/styles.css` (chip styles)

---

## Testing

Each phase:
1. `npm run dev` — verify no build errors
2. Check existing data renders correctly in localStorage
3. Verify touch targets, focus rings, contrast
4. Test on 375px viewport

---

## Rollback

Each phase is additive. To rollback:
- Git revert the commit
- Or: `npm uninstall` new deps + restore modified files from git
