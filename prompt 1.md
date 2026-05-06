# Project: Daily Mood Check-in Web App

Build a small web app for 3 friends (April, Angie, Deepthi) to log their daily
mental state, gratitude notes, and rants. The point is to track one friend's
mental health progress alongside the group's, in a way that feels light and
cutesy rather than clinical.

## Stack
- **Frontend:** React + Vite + TypeScript, deployed to GitHub Pages
- **Backend:** Supabase (Postgres + auto-generated REST API), free tier
- **Styling:** Tailwind CSS
- **Charts:** none — build the heatmap and word cloud as custom components.
  Use `d3-cloud` for layout of the word cloud only.

No auth. Anyone with the link picks a name on the home screen and goes.
Treat the name like a profile selector, persisted in `localStorage` so it
sticks across visits but can be switched.

## Data model (Supabase)

Two tables, both keyed by name (lowercase string: "april" | "angie" | "deepthi"):
moods
id           uuid pk
name         text  -- 'april' | 'angie' | 'deepthi'
date         date  -- the local date of the entry
score        int   -- 0..10
gratitude    text  -- nullable
rant         text  -- nullable
created_at   timestamptz default now()
unique (name, date)   -- duplicate insert on same day → upsert, latest wins

Use `upsert` with `onConflict: 'name,date'` so re-entering today's mood
overwrites the previous one. No second-entry blocking, no averaging.

Row-level security: enable RLS, then add a permissive policy for anon
reads and writes on this table. This is a 3-person tool behind an
unguessable URL, not a secure system — that's fine, but document it in
the README.

Keep the Supabase URL and anon key in `.env` (`VITE_SUPABASE_URL`,
`VITE_SUPABASE_ANON_KEY`). Add a `.env.example`. Do not commit `.env`.

## Screens

**1. Home / name picker**
Three buttons: April, Angie, Deepthi. Tapping one stores the choice and
goes to Today. A small "switch user" link in the header on every other
screen returns here.

**2. Today (the check-in)**
- Greeting with the picked name and today's date.
- A horizontal slider, 0 to 10, integer steps. The slider track is a
  pastel rainbow gradient — left is a soft cool color (low mood),
  right is a soft warm color (high mood). The thumb shows the current
  number. Below the slider, a single emoji reacts to the value (☁️ → 🌤️ → ☀️
  or similar, your call — keep it gentle, no frowny faces).
- Two textareas: "What were you grateful for today?" (optional) and
  "Anything you want to rant about today?" (optional).
- One Save button. On save: upsert to Supabase, then show a confirmation
  ("logged for {date}") with a link to the heatmaps. If a mood already
  exists for today, prefill the form with it so the user can see they're
  editing.

**3. My Heatmaps**
Shows the picked user's three visualisations stacked:
- Daily mood heatmap (see spec below)
- Gratitude word cloud
- Rant word cloud

**4. Swedish House Mafia Mood Map**
Group page. Title literally reads "Swedish House Mafia Mood Map" — that
is not a placeholder, keep it. Shows:
- A combined heatmap. For each date, average the three scores that exist
  (skip missing people). One row labelled "us".
- Optionally three small individual heatmaps stacked above it, labelled
  by name, so you can compare.
- A combined gratitude word cloud (all three users' gratitude entries
  pooled).
- A combined rant word cloud (same idea).

Navigation: simple top nav with Today / My Heatmaps / Mood Map / switch user.

## Heatmap component spec

Reference image is the GitHub-style contributions grid. Replicate that
layout, but in pastels:
- Columns are weeks, rows are days of the week (Mon–Sun, or Sun–Sat — pick
  one, label Mon/Wed/Fri on the y-axis like the reference).
- Month labels (Jan, Feb, …) along the top, aligned to the first column
  of each month.
- Each cell is a small rounded square. Color comes from the score (0–10)
  mapped onto the same pastel rainbow used by the slider so they feel
  like the same scale. Empty days are a very light neutral grey.
- Hover/tap a cell → tooltip with date and score.
- Show a rolling 12-month window ending today.

The combined "us" heatmap uses the average of available scores for that
date, mapped onto the same rainbow.

## Word cloud component spec

- Pool all entries for the user (or all three users for the group view).
- Tokenise: lowercase, strip punctuation, remove a small English stopword
  list (`the`, `and`, `i`, `to`, `a`, etc. — include a sensible default
  list, ~50 words).
- Word size scales with frequency. Color: random pick from the pastel
  palette per word, but keep it readable (no near-white on white).
- Use `d3-cloud` for layout. Render to SVG.
- If there are no entries yet, show a soft empty state ("nothing yet —
  the cloud will fill in as you write").

## Aesthetic — this matters

Read this carefully. The reference images the user provided are pixel-art
desktop UIs (Macaron Suite, Paint Suite). The vibe to capture:

- **Mostly white / off-white background**, with pastel accents — lavender,
  mint, butter yellow, peach, soft pink, baby blue. **Less pink than the
  reference**; treat pink as one accent among many, not the dominant.
- **Old Microsoft Paint / Windows 95–98 chrome** as the visual motif:
  windowed panels with a coloured title bar, faux minimise/maximise/close
  buttons in the top right (non-functional, just decorative), inset
  borders (top/left light, bottom/right dark — the classic 3D bevel), and
  chunky pixel-style buttons.
- **Pixel font for headings only** ("Press Start 2P" from Google Fonts is
  fine), and a clean modern sans (Inter or system-ui) for body, slider
  numbers, and word clouds — pixel fonts are illegible at body size.
- Each major surface (the check-in form, each heatmap, each word cloud)
  is its own "window" with a title bar. Title bar colours rotate through
  the pastel palette so the pages feel like a little desktop.
- Cute but restrained. No glitter, no sparkle GIFs, no "uwu". Think
  studio-ghibli-meets-windows-95.
- Fully responsive. On mobile, windows stack vertically and fill width
  with a small margin. The slider must work with touch. Heatmap scrolls
  horizontally on narrow screens — don't try to cram 12 months into 380px.

## Project structure
/src
/components
Window.tsx          // the chrome wrapper used everywhere
MoodSlider.tsx
Heatmap.tsx
WordCloud.tsx
NameSwitcher.tsx
/pages
Home.tsx
Today.tsx
MyHeatmaps.tsx
MoodMap.tsx         // the Swedish House Mafia one
/lib
supabase.ts
palette.ts          // exports the rainbow scale + pastel accents
stopwords.ts
tokenize.ts
/styles
index.css
App.tsx
main.tsx

## Deployment

GitHub Pages via GitHub Actions. Include a workflow at
`.github/workflows/deploy.yml` that builds on push to `main` and deploys
the `dist/` folder. Set `base` in `vite.config.ts` to the repo name so
asset paths resolve. Document in the README:

1. Create a Supabase project, run the SQL to create the `moods` table and
   RLS policy (include the SQL in `supabase/schema.sql`).
2. Copy `.env.example` to `.env`, fill in URL + anon key.
3. Add the same two values as GitHub Actions repository secrets so the
   build can read them.
4. Enable Pages on the repo, source = GitHub Actions.

## Don't

- Don't add login, accounts, or password gates.
- Don't add a "how are you really feeling" dropdown of emotions, mood
  tags, or any extra fields. The slider plus two textareas is the entire
  check-in.
- Don't use a charting library for the heatmap — build it.
- Don't use emoji-heavy or glittery styling. The aesthetic is calm.
- Don't store anything sensitive. Add a one-line note in the footer:
  "this is a private space for three friends".

## Build order

1. Scaffold Vite + React + TS + Tailwind + Supabase client.
2. `Window` chrome component + palette + Press Start 2P loaded.
3. Home name picker, persisted to localStorage.
4. Supabase schema + `moods` table + upsert helper.
5. Today page with slider + textareas + save.
6. Heatmap component, then My Heatmaps page.
7. Word cloud component, plug into My Heatmaps.
8. Mood Map page with combined views.
9. Mobile pass — test on a 380px viewport.
10. GitHub Actions deploy workflow + README.