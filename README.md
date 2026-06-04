# Arrow Gym — Design System

**Arrow Gym** is a mobile-first strength & cardio training app built for iPhone (installable PWA). It lets a lifter log workouts with near-zero friction, then turns that data into a professional-grade analytics layer: a frontal/posterior **muscle map**, a per-group **radar**, weekly volume, estimated 1RM, personal records, and an **AI "Coach"** that scores recovery, balance, and progression and auto-suggests plans (including deload weeks).

The product voice is Spanish — specifically **Rioplatense (Argentine)** — and the aesthetic is a confident, dark, neon "performance instrument": near-black backgrounds, mint-green and cyan accents, heavy type, big tap targets, bottom sheets, and a fixed bottom tab bar.

> This is a single-product system: the **Arrow Gym mobile app**. There is no marketing site or second surface in the source.

---

## Sources

This design system was reverse-engineered from the product's source code:

- **GitHub:** [`mateo524/arrow-gym-app`](https://github.com/mateo524/arrow-gym-app) (branch `master`) — React 18 + Vite + Zustand, mobile-first PWA. "Arrow Gym V4."
- Related repos by the same author you may want to explore for deeper context: [`mateo524/arrow-gym`](https://github.com/mateo524/arrow-gym).

The single most important file is **`src/styles.css`** (~40 KB) — it *is* the design system. `src/store/useStore.js` holds routines & seed logic; `src/data/exerciseDatabase.js` defines body groups and the 1000+ exercise bank; `src/lib/coachEngine.js` powers the Coach. Reading these will let you build far more faithful Arrow Gym designs than working from screenshots.

> **Reader note:** You may not have access to these repos. Everything needed to design in-brand has been extracted into this folder (tokens, foundations, components, UI kit). Re-import the repo via the GitHub menu if you want to go deeper.

---

## Index / Manifest

```
arrow-gym-design-system/
├── README.md                    ← you are here
├── SKILL.md                     ← Agent Skill entry point
├── colors_and_type.css          ← all design tokens as CSS vars
├── assets/
│   └── arrow-gym-icon.svg       ← official app icon / logo tile
├── preview/                     ← Design System tab cards (20 cards)
│   ├── colors-core.html         Colors: background / surface / text
│   ├── colors-accents.html      Colors: green / cyan / accent palette
│   ├── colors-semantic.html     Colors: ok / warn / info / danger wells
│   ├── colors-gradients.html    Colors: hero, brand, action, cardio
│   ├── type-scale.html          Type: eyebrow → h1 → h2 → body → caption
│   ├── type-weights.html        Type: Inter 400 → 900, weight ramp
│   ├── type-numerals.html       Type: stat readouts & rest-timer numerals
│   ├── radii.html               Spacing: corner radius tokens
│   ├── spacing.html             Spacing: 2–18px gap rhythm
│   ├── elevation.html           Spacing: border+tint, glass/blur
│   ├── buttons.html             Components: primary/secondary/ghost/finish
│   ├── chips-tags.html          Components: set chips, tags, pill tabs
│   ├── inputs.html              Components: fields, focus ring, search
│   ├── cards.html               Components: hero / card / routine card
│   ├── score-badges.html        Components: coach score badges + stat grid
│   ├── coach-blocks.html        Components: semantic blocks (ok/warn/rec/PR)
│   ├── nav.html                 Components: 5-cell fixed bottom tab bar
│   ├── dataviz.html             Components: sparkline / bars / muscle intensity
│   ├── logo.html                Brand: app icon tile + coach arrow mark
│   └── iconography.html         Brand: emoji icons + unicode affordances
└── ui_kits/
    └── app/                     ← Arrow Gym mobile app UI kit
        ├── README.md            ← storage/data notes, screen index
        ├── index.html           ← launch this for interactive prototype
        ├── app.css              ← faithful style subset of src/styles.css
        ├── data.jsx             ← seed data (routines, exercises, scores)
        ├── ui.jsx               ← shared primitives (MuscleMap, Radar…)
        ├── screens.jsx          ← 5 screens (Home/Start/Workout/Coach/Progress)
        ├── app.jsx              ← root app + overlays (rest timer, sheet, more)
        └── ios-frame.jsx        ← iOS 26 bezel starter component
```

---

## CONTENT FUNDAMENTALS

**Language.** Spanish, Rioplatense register — uses **voseo** and the informal *vos* imperative throughout. Verbs land on the second-person familiar command: *"Entrená rápido"*, *"Medí cada músculo"*, *"Agregá un ejercicio"*, *"Cargá mediciones"*, *"Bajá el peso"*, *"Buscá subir a…"*, *"Seguí así"*. Never the Castilian *"Entrena / Añade / Sigue"*.

**Person.** Speaks **to** the user as a coach would ("you"), never "I". The Coach feature is a system voice, attributed as *"Coach dice"* / *"Recomendación del coach"* — direct, prescriptive, second person.

**Tone.** Motivational but technical and unsentimental. It assumes a knowledgeable lifter: it uses jargon plainly — *series, reps, RPE, RIR, 1RM, volumen, superserie, deload/descarga, isquios, dorsales, glúteos*. English lifting terms coexist with Spanish copy (*Push / Pull / Legs / Full Body / Lat Pulldown / Face Pull*) — this code-switching is authentic to the gym world and should be kept.

**Casing.** Sentence case for headings and body. **UPPERCASE + wide letter-spacing (.14em)** only for eyebrows / micro-labels (*"ARROW GYM"*, *"START WORKOUT"*, *"GIMNASIO"*, *"CARDIO"*). Tab labels are short and Title/sentence case (*Inicio, Coach, Progreso, Rutinas, Récords, Mediciones*).

**Length.** Extremely terse. Headlines are one line. Body is 1–2 short sentences. Stat captions are a single lowercase word (*entrenos, series, días, min cardio, último kg, mejor peso*). Empty states are one friendly sentence (*"No hay entrenamientos esta semana todavía."*).

**Numbers & units.** Metric. *kg*, *min*, *reps*, *días*. Big volumes abbreviated as *k* (e.g. *"23.8k kg"*, *"+2.5kg"*). Dates ISO-ish / short (*MM-DD*). Percentages and deltas are signed (*+12%*, *↑*, *↓*).

**Emoji.** Yes — emoji are a genuine part of the voice, used as compact iconography in labels, tips, and Coach messages: ⚡ 🧠 📈 🔥 🥊 🚴 💪 🏆 📏 ⚠️ 💤 ✅ 💡 🎯 📋. Use them sparingly as *signposts* (one per label/line), never decoratively in clusters.

**Sample copy (lift verbatim for in-brand mocks):**
- Eyebrow + headline: `ARROW GYM` → *"Entrená rápido. Medí cada músculo."*
- Sub: *"Mapa muscular, radar por grupos y registro sin fricción."*
- Primary CTA: *"Empezar entrenamiento"* / *"Continuar entrenamiento"*
- Coach tip: *"⚡ Probá +2.5kg"* · *"🎯 Llegá a 12 reps antes de subir"* · *"🏗️ Bajá peso, enfocate en técnica"*
- Status: *"Todo en orden. Seguí así."*

---

## VISUAL FOUNDATIONS

**Overall vibe.** A dark "performance instrument." Think gym at night / heads-up display: deep cold near-black, sparse mint-green and cyan light, dense data laid out cleanly with generous rounding and heavy type. Premium, focused, a little clinical — *not* playful, not pastel, not corporate-blue.

**Color.** Single dark theme (no light mode in source). Background is `#050709`; surfaces step up through `#0d1214` → `#11191b`. Text is a minty off-white `#f4fff8`. **Green `#6df2a4` is the primary** — every main action, success state, brand mark, and "good" data point. **Cyan `#75d9ff` is the secondary** — used for data/charts, links, cardio, and as the second half of brand gradients. Warnings use amber `#f59e0b` / `#e8f777`; errors `#ff6b6b`. Accent fills *always* carry dark ink (`#03100a`) on top, never white text.

**Type.** **Inter** (with `system-ui` fallback). The system runs **heavy** — 800 is the default for buttons, stat numbers, labels; 900–1000 appears on big readouts (rest-timer, scores, map title). Body copy is the only place regular/`c7d5d2` softness appears. Eyebrows are 11px uppercase, `letter-spacing:.14em`, green. H1 is 28px/1.1. There is *no* serif and *no* second family — the weight range carries the hierarchy.

**Backgrounds & texture.** No photography, no illustration, no noise/grain. Backgrounds are flat near-black or **subtle dark diagonal gradients** (`135deg`) inside hero/feature/routine cards (e.g. `#111b1a → #07100d`). The only "imagery" is **functional data viz**: SVG muscle map, radar, donut, sparkline trend charts, heatmaps, bar charts — all rendered in the green/cyan palette on dark.

**Cards.** Surface `rgba(13,18,20,.92)`, 1px `#213033` border, **radius 20px**, 14px padding. Feature/hero cards go to **radius 24px** with a diagonal gradient and a slightly lighter border (`#254044`). Semantic blocks recolor border + bg as a set (success green, warn amber, info blue). Cards are flat — **no drop shadows**; elevation is communicated by border + background tint, not shadow. Active/press on tappable cards = a faint white wash (`rgba(255,255,255,.04)`).

**Borders & dividers.** Hairline `1px` borders everywhere (`#213033` and tinted cousins). Inset rows use `1px solid rgba(255,255,255,.04)` divider lines. Dashed borders (`1px dashed rgba(255,255,255,.1)`) signal collapsed/placeholder rows.

**Shadows & elevation.** Essentially **no box-shadows**. Depth comes from border + surface-tint stepping and from `backdrop-filter: blur(12px)` on the sticky header and overlay scrims. Focus rings are real: `2px solid var(--green)` + `2px` offset, plus a `0 0 0 2px rgba(109,242,164,.15)` glow on focused inputs.

**Radii.** Pills/tags/range-tabs are fully round (`999px`). Inputs & small buttons `12px`. Buttons & blocks `16px`. Cards `20px`. Hero / bottom sheets / feature panels / more-menu `24px` (top corners only for sheets).

**Spacing & layout.** Mobile column capped at **520px**, centered, `18px 14px` main padding with safe-area insets. Everything is **flex/grid with `gap`** (2–12px). Fixed **bottom tab bar** (5 cells), sticky blurred page header, bottom-sheet overlays that slide up, and a centered modal for the rest timer. Min touch target 44px.

**Buttons.**
- *Primary* — solid green, dark ink, radius 16px, weight 800, min-height 44px. Press = `opacity:.85`.
- *Secondary* — dark fill `#152022`, light text, 1px `#2a3d3f` border. Press = slightly lighter fill.
- *Ghost* — transparent, 1px border. Press = faint white wash.
- *Finish* — full-width sticky bar with the **green→cyan horizontal gradient**, weight 900.
- *Danger* — muted maroon fill `#2a1517`, pinkish text, 12px radius.

**Hover / press / states.** This is a touch-first product, so **press states dominate** (`:active`), not hover. Press = darken/lighten by a small wash or `opacity:.85`; no scale-down on buttons. Hover (where present, e.g. heatmap dots) = `opacity:1` + slight `scale(1.15)`. Active nav/tab = green text on a dark-green well (`#13201b`).

**Transparency & blur.** Used deliberately: sticky header and nav use translucent bg + `blur(12px)`; modal/sheet scrims are `rgba(0,0,0,.55–.7)`; wells inside cards use `rgba(0,0,0,.2–.25)`; accent washes use low-alpha green/cyan. Glass is reserved for chrome (header/nav/overlays), not content cards.

**Motion.** Quick and unfussy. Page enter: `fade .18s ease` (opacity + 4px rise). Bottom sheets: `sheetUp .25s ease` (translateY 100%→0). Scrims: `fadeIn .15s`. Spinner: `spin .6s linear infinite`. Bars/fills animate width over `.3–.4s ease`. **No bounce, no spring, no parallax, no infinite decorative loops.** Reduced-motion-friendly by nature.

**Data-viz palette.** Charts use green (`#6df2a4`) as primary series, cyan (`#75d9ff`) as secondary, then amber/purple/red/yellow/grey for additional series. Muscle-map intensity ramps cyan-ward through 5 levels (`#131e20 → #1a3d42 → #1a6875 → #30a2b8 → #5ee0ff`). Sparklines are 2px polylines with 3px dots; bars have `4px 4px 0 0` tops.

---

## ICONOGRAPHY

Arrow Gym has **no icon font and almost no custom SVG icon set** — and that absence is itself the system. Iconography is delivered three ways:

1. **Emoji as primary icons.** The bottom nav, "More" menu, Coach tabs, workout types, and inline tips all use **system emoji** as their glyphs: ⚡ (Inicio), ▶ (Start), 🧠 (Coach), 📈 (Progreso), 📋 (Rutinas), 🏆 (Récords), 📏 (Mediciones), ☰ (Historial), ☁ (Sync), and workout types 💪 Push, 🔙 Pull, 🦵 Legs, 🔥 Full Body, 🚴 Bicicleta, 🥊 Boxeo, ⚡ Libre. Coach messaging uses ⚠️ 💤 ✅ 💡 🎯 🏗️ 📊. **Keep emoji** when recreating Arrow Gym — substituting a line-icon set would break the look. Render them at the platform default; they inherit no color.

2. **Unicode symbols as UI affordances.** Plain typographic glyphs do the structural work: `→` (the Coach "arrow" mark, set in a green→cyan rounded square), `↑ ↓` (reorder / trend up-down), `×` `✕` (remove/close), `+` (add / "Más"), `←` (back), `◈` (Mapa), `⏱` (timer), `🔗` (superset link). These are typed characters, not images.

3. **One real brand SVG — the app icon.** `assets/arrow-gym-icon.svg`: an upward **chevron/arrow forming an "A"** in mint-green (`#74f7b1`) with a solid bar beneath it (`#d7ffe8`), on a rounded near-black tile (`#07110d`, radius 110/512). This is the launcher/PWA icon and the core logo. The in-app "coach" mark reuses the *idea* as a `→` in a gradient square. Reuse this SVG for any logo lockup; don't redraw it.

**Rules for designing in-brand:** prefer emoji + unicode for utility icons (matches the product exactly); use the SVG arrow tile as the logo; if a genuinely new vector icon is unavoidable, draw it as a **2px-stroke, rounded-cap, cyan/green line icon on dark** to sit beside the muscle-map/chart language — and flag it as an addition, since the source has none.

---

*Built from the Arrow Gym V4 source. Tokens in `colors_and_type.css`; live specimens in the Design System tab; interactive recreation in `ui_kits/app/`.*
