# Arrow Gym V4 - UI/UX Improvement Design

## Overview

Elevate Arrow Gym from functional to premium mobile-first PWA. Dark theme, green/cyan accents preserved. Phased implementation (ongoing project).

## Principles

- **Mobile-only**: 375px–520px viewport, portrait
- **Performance-first**: Minimal deps, CSS-driven where possible
- **Accessibility**: 4.5:1 contrast, focus rings, ARIA labels, reduced-motion
- **Frictionless logging**: Each tap/input serves the gym workflow, not UI chrome

---

## Phase 1 — Foundation (Tokens, Icons, Accessibility)

### Design Token System

Consolidate all values into CSS custom properties. Enforce semantic naming.

```css
:root {
  /* Spacing (4px base) */
  --sp-1: 4px;  --sp-2: 8px;  --sp-3: 12px;  --sp-4: 16px;
  --sp-5: 20px; --sp-6: 24px; --sp-8: 32px;  --sp-10: 40px;

  /* Typography */
  --fs-display: 32px; --fs-h1: 28px; --fs-h2: 20px;
  --fs-body: 16px;   --fs-caption: 12px;
  --lh-tight: 1.1;   --lh-body: 1.5;
  --fw-black: 900;    --fw-bold: 700; --fw-medium: 500;

  /* Elevation */
  --elevation-surface: 0 1px 2px rgba(0,0,0,.3);
  --elevation-raised: 0 4px 12px rgba(0,0,0,.4);
  --elevation-overlay: 0 8px 30px rgba(0,0,0,.5);
  --elevation-modal: 0 18px 70px rgba(0,0,0,.7);

  /* Semantic colors */
  --c-bg: #050709;
  --c-panel: #0d1214;
  --c-panel2: #11191b;
  --c-line: #213033;
  --c-line-subtle: rgba(33,48,51,.5);
  --c-text: #f4fff8;
  --c-text-secondary: #8ea0a0;
  --c-text-muted: #5a6b6b;
  --c-accent: #6df2a4;
  --c-accent-secondary: #75d9ff;
  --c-danger: #ff6b6b;
  --c-warning: #e8f777;
  --c-danger-surface: #2a1517;
  --c-danger-line: #643034;
}
```

### SVG Icon System

Replace all emoji icons in Nav with Lucide icons. Install `lucide-react` (tree-shakeable). Define icon component:

```jsx
// src/components/Icon.jsx
import * as Icons from "lucide-react";
export default function Icon({ name, size = 24, ...props }) {
  const LucideIcon = Icons[name];
  return LucideIcon ? <LucideIcon size={size} strokeWidth={1.5} {...props} /> : null;
}
```

Nav mapping:
- Inicio → `Home`
- Start → `Play`
- Coach → `BrainCircuit`
- Mapa → `Map`
- Historial → `Clock`
- Ejercicios → `Dumbbell`

### Accessibility Baseline

- `button:focus-visible, input:focus-visible` → `outline: 2px solid var(--c-accent); outline-offset: 2px`
- All quick-action buttons → `aria-label`
- Color not sole indicator → add text labels to muscle map levels, radar chart data
- `prefers-reduced-motion` → disable all transform/opacity transitions
- `touch-action: manipulation` on all interactive elements (eliminate 300ms tap delay)

---

## Phase 2 — Animation & Micro-interactions

### Strategy: CSS-first, Framer Motion for complex orchestration

**CSS animations (zero deps):**
- Press feedback: `transform: scale(0.97)` on `:active` (150ms ease)
- Nav indicator slide: `transition: transform 200ms ease, color 150ms ease`
- Button disabled: `opacity: .5; cursor: not-allowed`
- Toast: `@keyframes slideUp { from { transform: translateY(100%); opacity: 0 } }`

**Framer Motion (installed for):**
- Page transitions: `AnimatePresence` + `motion.div` with `{ opacity: 1, x: 0 }` entering, `{ opacity: 0, x: -30 }` exiting (200ms, spring)
- Set card stagger: `motion.div` with `staggerChildren: 0.05`
- Muscle diagram path reveal: stagger per SVG path
- PR celebration: `motion.div` scale + confetti-like particles

### Micro-interaction spec

| Element | Trigger | Animation | Duration | Easing |
|---------|---------|-----------|----------|--------|
| Button press | `:active` | scale(0.97) | 100ms | ease-out |
| Nav tab active | route change | indicator bar slide + color fade | 200ms | ease |
| Page enter | mount | fade + slide up (20px) | 250ms | ease-out |
| Page exit | unmount | fade + slide down | 180ms | ease-in |
| List item | staggered mount | fade + slide up (15px) | 200ms | ease-out |
| Set card add | new set | scale(0.95) → scale(1) | 200ms | spring(0.3,15) |
| Toast | show | slide up + fade | 300ms | ease-out |
| Toast | dismiss | slide down + fade | 250ms | ease-in |
| Muscle highlight | hover/tap | fill color transition | 200ms | ease |
| Quick stat | value change | number tick (if adding) | 200ms | ease-out |

### Reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

---

## Phase 3 — Workout Experience (Highest Impact)

### 3.1 Rest Timer

- Auto-triggers when user completes a set (enters weight+reps or taps "next")
- Starts a 60–180s timer (configurable per user, default 90s)
- UI: Circular progress bar (SVG) at top of active exercise block
- When done: vibration (`navigator.vibrate(200)`), flash green, optional sound
- Pause/resume/skip controls
- Timer persists if user scrolls away and back

### 3.2 Previous Set Ghost

After finishing set 1, show set 2 with the previous weight/reps pre-filled BUT as a semi-transparent ghost until user interacts. Helps compare progression at a glance.

### 3.3 Swipe Actions on Set Card

- **Swipe left**: reveal red "Delete" behind card
- **Swipe right**: reveal green "Duplicate" behind card
- Framer Motion `useDragControls` or `onDrag`
- Haptic on threshold cross (`navigator.vibrate(50)`)

### 3.4 Volume Mini-Chart Per Exercise

Inline sparkline showing weight×reps for last 5 sessions. Pure SVG, 120×32px, mounted inside each `exercise-block` header. Fetch from `getExerciseStats`.

### 3.5 Quick Weight Steppers Enhancement

Replace `+2.5kg` / `-2.5kg` with:
- **±2.5kg** buttons (keep)
- **±5kg** buttons (add)
- **Warm-up set** button (presets 50% weight × 10 reps as separate set)
- Long-press on ± buttons to rapidly adjust

### 3.6 Plate Calculator Modal

When user taps the weight input, show bottom sheet with common plate combos (e.g., "40kg = 10+5 each side"). Calculates based on barbell type (standard 20kg bar, 15kg women's). Pure pass-through — doesn't set weight unless user taps.

---

## Phase 4 — Navigation & Polish

### 4.1 Routing with `wouter`

Install `wouter` (3.3kb gzipped) for deep links without React Router overhead:

| Path | Page |
|------|------|
| `/` | Home |
| `/start` | StartWorkout |
| `/workout` | WorkoutPage |
| `/workout/:id` | WorkoutDetail |
| `/history` | History |
| `/map` | Muscle Map |
| `/coach` | Coach |
| `/exercises` | Exercises |

Preserve Zustand as primary state, wouter only for URL sync and back button support.

### 4.2 Navigation Bar (6 → 5 Tabs)

Combine "Ejercicios" into a modal/overlay accessible from Start page and WorkoutPage. Bottom nav becomes:

| Tab | Icon | Badge |
|-----|------|-------|
| Inicio | Home | — |
| Start | Play | has active workout |
| Coach | BrainCircuit | new coach report |
| Mapa | Map | — |
| Historial | Clock | — |

### 4.3 Badge Component

Small red dot or number. Display on nav items:
- Start: dot if `activeWorkout !== null`
- Coach: dot if unread reports

### 4.4 State Preservation

On back navigation:
- Restore `ExercisePicker` scroll position and filters
- Restore `HistoryPage` scroll position
- Store scroll in Zustand per route (`scrollPositions: {}`)

---

## Phase 5 — Coach & Muscle Map

### 5.1 Actionable Coach Insights

Machine-learning-light rules:
- "Your chest volume dropped 23% — add 2 sets of incline press"
- "Leg volume plateaued — try a 10% weight increase next session"
- "Deltoid posterior is undertrained — add Face Pulls"

Each insight: swipeable card with "Apply" button (auto-adds exercise to next workout).

### 5.2 Muscle Map Interactions

- **Tap muscle region**: filter exercise list or show volume chart for that muscle
- **Long press**: show tooltip with series count + volume for that muscle this week
- **Weekly comparison overlay**: toggle between current and previous week's heat map
- **Colorblind mode**: overlay texture patterns (dots, stripes, crosshatch) at level transition

### 5.3 PR Detection

On `finishWorkout`, compare each set against historical max weight/reps per exercise. If new PR:
- Show celebration card (confetti via Framer Motion)
- Store PR date and value in `localStorage` for badge display

### 5.4 Export Muscle Map

- `html2canvas` or pure SVG serialization → shareable image
- Button in Map page: "Share progress"

---

## Phase 6 — Exercise Picker (1000+ Items)

### 6.1 Virtualized List

Install `react-window`. `FixedSizeList` with height based on viewport. Item height: 56px. Filter results feed into list.

### 6.2 Horizontal Muscle Chips

Replace dropdown selects with horizontally scrollable chip row:
- "Todos", "Hombros", "Pecho", "Espalda", "Brazos", "Piernas", "Core"
- Each chip: `border-radius: 100px`, `padding: 6px 14px`
- Active chip: filled accent, inactive: transparent border

### 6.3 Recent/Favorites

- Track last 5 exercises used (Zustand middleware)
- Show as "Recientes" at top of picker
- Pin icon per exercise → add to "Favoritos" (persisted)

### 6.4 Search Enhancements

- Debounced (300ms)
- Fuzzy matching: normalize "press chest" = "Chest Press"
- Recent searches shown below input until query typed

---

## Dependency Additions

| Package | Size (gzip) | Used In |
|---------|-------------|---------|
| `lucide-react` | ~12kb (tree-shakable) | Phase 1 — icon system |
| `framer-motion` | ~12kb (ESM) | Phase 2 — complex animations |
| `wouter` | ~3.3kb | Phase 4 — routing |
| `react-window` | ~5kb | Phase 6 — virtual list |

Total added: ~32kb gzip

---

## Data Preservation

All existing user data (workouts, sets, coach reports, custom exercises) is stored in `localStorage` under key `arrow-gym-v4` via Zustand persist middleware. **No store schema changes** are made in any phase. Only UI components, styles, and optional dependencies are added/modified. Existing data will render identically — no migration, no reset, no loss.

## Non-Goals

- Desktop/tablet layouts
- Authentication or user accounts
- Server-side sync (keep localStorage)
- Changing color palette or design direction
- Any backend or API
- Video/GIF exercise demos (leave placeholder only)

---

## Spec Self-Review

- [x] No TBD/TODO placeholders
- [x] Architecture consistent across phases
- [x] Scope clearly bounded (no backend, no auth, no desktop)
- [x] Requirements explicit (mobile-only, keep dark theme, phases)
- [x] Dependencies justified with bundle sizes

---

*Design validated against ui-ux-pro-max guidelines. Animation approach: CSS-first + Framer Motion for complex sequences. Navigation reduced from 6→5 tabs. All emojis replaced with SVG icons. Focus rings, reduced-motion, and ARIA labels baseline for Phase 1.*
