# Iteration 2: Lean fully into the Win95/MS Paint desktop aesthetic

The current build looks like a generic web form with pastel accents. We want
it to look and behave like a tiny Windows 95 / MS Paint desktop. The check-in
form, heatmaps, and word clouds are all *windows* sitting on a desktop, and
the user navigates by double-clicking icons.

Reference: classic Win95 with MS Paint open. Chunky bevels, system font,
title bars with min/max/close, dotted focus outlines, beige-grey chrome —
but reskinned in soft pastels and with a chibi/cute spirit. Think
"Windows 95 if it shipped on a Sanrio computer".

## What's wrong with the current screen

- The "window" is a thin-bordered card, not a beveled Win95 window.
- The title bar font is pixel, the body font is sans, the button font is
  pixel again — three fonts fighting each other. Pick one and stick to it
  for chrome.
- Padding inside the window is too generous; everything feels like a
  modern web form. Win95 dialogs are tight.
- The slider is a modern HTML range input. It needs to look like a
  Win95 trackbar (notched track, square thumb).
- The Save button is a flat grey rectangle. It needs the bevel.
- The page is empty white space around a single floating card. It should
  be a *desktop* — coloured background, icons on the left, a taskbar at
  the bottom — with the window on top of it.

## New layout: the desktop

The whole app lives inside a desktop shell.
┌──────────────────────────────────────────────────┐
│  [icon]                                           │
│  today                                            │
│                                                   │
│  [icon]            ┌─ today's check-in ──── _ □ × │
│  april                                            │
│                    ...window contents...          │
│  [icon]                                           │
│  angie             └───────────────────────────── │
│                                                   │
│  [icon]                                           │
│  deepthi                                          │
│                                                   │
│  [icon]                                           │
│  mood map                                         │
│                                                   │
├──────────────────────────────────────────────────┤
│ [start] │ today's check-in        │   2:55 PM    │
└──────────────────────────────────────────────────┘

### Desktop background
A soft pastel solid (mint, lavender, or butter — pick one as default and
let it be themeable later). Not white. The desktop is what makes this
read as an OS instead of a webpage.

### Desktop icons (left side, vertical column)
Five icons:
1. **today** → opens the check-in window for the currently selected user
2. **april** → opens April's profile (her heatmaps + word clouds)
3. **angie** → opens Angie's profile
4. **deepthi** → opens Deepthi's profile
5. **mood map** → opens the Swedish House Mafia Mood Map window

Each icon is a 48×48 px image above a label in the chrome font. Selected
state = label gets a dotted rectangle outline and inverted colors (white
text on accent background), exactly like Win95.

**Leave the icon images as placeholders.** Use a `<div>` with a 1px
dashed border and a tiny "icon" label, sized 48×48, where the `<img>`
will go. In the code, reference `/icons/today.png`, `/icons/april.png`,
`/icons/angie.png`, `/icons/deepthi.png`, `/icons/moodmap.png` so the
user can drop real PNGs in later. Add a TODO comment next to each:
`// TODO: replace placeholder, expects 48x48 PNG`.

Double-click (or single-tap on mobile) opens the window.

### Taskbar (bottom, fixed)
- Left: a "start" button with the bevel and a small placeholder icon slot
  (`/icons/start.png`, also TODO). Clicking it opens a start menu (see
  below).
- Middle: one button per currently-open window, showing the window title.
  Active window's button is sunken (pressed bevel). Clicking minimises /
  restores.
- Right: a live clock (`HH:MM AM/PM`) and the current user's name.

### Start menu
Pops up above the start button when clicked. Items:
- **switch user** → goes to name picker
- **settings** → opens a Settings window (placeholder content for now,
  just an "about" tab with "made with love for three friends")
- **shut down...** → opens a small modal dialog "are you sure you want
  to shut down?" with [yes] [no] buttons. [yes] just reloads the page.
  This is a joke. Keep it.

## Window component — rebuild it

The current `Window` is too soft. Spec for the new one:

- **Outer border**: 2px outset bevel — top/left light (`#fff`),
  bottom/right dark (`#808080`), on a chrome-colour background
  (`#ece9d8`-ish but tinted toward our pastel, e.g. a faint lavender-grey
  `#eeebf5`).
- **Inner border** around the content area: 2px inset bevel (the inverse).
  This is the classic Win95 double-bevel.
- **Title bar**:
  - Height ~22px, padded 4px horizontally.
  - Background: pastel gradient, left-to-right (e.g. mint → lighter mint).
    Different windows can use different pastel title bars (mint for
    check-in, lavender for profiles, peach for mood map).
  - Title text: chrome font, bold, white, 11–12px. Small icon slot to
    the left of the title (`/icons/window-{name}.png`, TODO placeholder).
  - On the right: three 16×14 buttons — minimise, maximise, close —
    each with the bevel and the standard glyphs (`_`, `□`, `×`).
    Functional: close hides the window, minimise sends it to taskbar,
    maximise toggles full-viewport.
- **Inactive state**: title bar desaturates to grey, glyphs go dim.
  Only one window is active at a time.

## Typography — pick one chrome font and stop mixing

Use **one** font for all chrome (title bars, menus, taskbar, buttons,
labels): **"MS Sans Serif"** if available, otherwise the
[`w95fa`](https://www.npmjs.com/package/@fontsource/w95fa) Google/Fontsource
font, otherwise `"Pixelated MS Sans Serif", Tahoma, sans-serif` as a
stack. 11px default, 12px for title bars, bold for window titles.

Body text inside windows (gratitude, rant, longer copy) uses the same
font at 12px. **Drop "Press Start 2P" entirely** — it's the wrong era
(8-bit games, not Win95) and it's illegible.

The only place a different font appears: word clouds, where readability
at varied sizes matters — use a clean sans (Inter or system-ui) for
those, and that's the deliberate exception.

## Spacing

Win95 dialogs are tight. Inside a window:
- Content padding: 8px, not 24–32px.
- Vertical gap between form sections: 12px.
- Form labels sit directly above their input, 4px gap, no extra margin.
- The Save button is right-aligned at the bottom, ~75px wide, ~23px
  tall, not full-width.

## Form controls — make them Win95

- **Trackbar (slider)**: build a custom one. Track is a 4px tall sunken
  bevel. Below the track, render small notch ticks for 0–10. Thumb is
  a 12×20px raised bevel rectangle (not a circle). The rainbow gradient
  goes *under* the track, so the track shows a thin slice of rainbow
  through its sunken groove. Keep the emoji + number readout below.
- **Textareas**: 2px inset bevel border, white interior, no rounded
  corners, no focus ring — instead, on focus, draw a 1px dotted black
  outline 2px inside the border (Win95 focus indicator).
- **Save button**: 2px outset bevel, chrome background, black text,
  pressed state inverts to inset bevel and shifts content 1px down/right.
  On focus, dotted outline 3px inside the button border. No hover color
  change — Win95 didn't have hover.

## Window manager (lightweight)

Don't go full draggable-window-manager — it's three friends, not a desktop
clone. But windows should:
- Open centered, slightly offset per window (cascade) so multiple are
  visible.
- Be **draggable** by their title bar (use pointer events, no library).
  Constrain to viewport.
- Stack: clicking a window's chrome brings it to front.
- Close button hides it; reopen via icon double-click or taskbar.

State for open windows lives in a single `useDesktop` hook:
`{ openWindows: Window[], activeId, open(id), close(id), minimise(id),
focus(id), bringToFront(id) }`.

## Mobile

The desktop metaphor breaks below ~640px. On mobile:
- Hide the desktop background, icons, and taskbar.
- Show one window at a time, full-width with a small margin, and a
  simple top tab bar to switch between Today / April / Angie / Deepthi /
  Mood Map.
- Keep the window chrome (title bar, bevel) — that's the aesthetic.
- Drop drag/min/max — close button only, and "close" goes back to the
  tab bar.

Use a single Tailwind breakpoint (`md:`) to switch between desktop and
mobile shells.

## Files to add / change
/src
/components
Desktop.tsx              // NEW — full-screen shell with icons + taskbar
DesktopIcon.tsx          // NEW
Taskbar.tsx              // NEW
StartMenu.tsx            // NEW
Window.tsx               // REWRITE — bevels, title bar, controls
Trackbar.tsx             // NEW — replaces the HTML range slider
Bevel.tsx                // NEW — small util, outset/inset variants
Button95.tsx             // NEW — the bevel button
Textarea95.tsx           // NEW
/hooks
useDesktop.ts            // NEW — window manager state
/styles
win95.css                // NEW — font-face, base chrome variables

CSS custom properties for the chrome palette, defined in `win95.css`:

```css
:root {
  --chrome:        #eeebf5;   /* window background */
  --chrome-dark:   #b8b4c2;   /* bottom/right bevel */
  --chrome-darker: #6e6a7a;   /* outer shadow */
  --chrome-light:  #ffffff;   /* top/left bevel */
  --desktop-bg:    #c8e6d0;   /* mint default */
  --title-active:  #a8e0c0;   /* mint title bar gradient start */
  --title-active2: #d8f0e0;   /* mint title bar gradient end */
  --title-inactive:#bdbac4;
  --text:          #1a1a1a;
  --text-inverse:  #ffffff;
  --focus-dot:     #1a1a1a;
}
```

Per-window title bar colours override `--title-active` / `--title-active2`
via inline style or a `tone` prop: `mint`, `lavender`, `peach`, `butter`,
`pink`.

## Don't

- Don't add a real OS-style desktop wallpaper image — keep the background
  a flat pastel.
- Don't add real apps (file explorer, etc.). The five icons listed are
  the whole desktop. No clutter.
- Don't make windows resizable by dragging corners — too much code for
  too little payoff. Maximise toggle is enough.
- Don't add sound effects.
- Don't replace placeholders with emoji icons or generated icons. The
  user is providing PNGs.

## Build order

1. `win95.css` with the font-face and palette variables.
2. `Bevel`, `Button95`, `Textarea95`, `Trackbar` primitives — get these
   pixel-right in isolation first.
3. Rewrite `Window` using the primitives. Verify it looks like Win95.
4. `Desktop` shell with icon column + taskbar + clock.
5. `useDesktop` hook + window manager wiring.
6. Move existing pages (Today, profile heatmaps, mood map) into windows.
7. Start menu + shut down joke.
8. Mobile shell with tab bar.
9. Drop placeholder icon `<div>`s with the right paths and TODO comments.