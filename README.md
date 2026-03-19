# OpenFrame

**Professional film pre-production suite. Free. Open source. Runs in your browser.**

[![Live Demo](https://img.shields.io/badge/live%20demo-openframev1.vercel.app-c9a84c?style=flat-square)](https://openframev1.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-c9a84c?style=flat-square)](LICENSE)
[![Built With](https://img.shields.io/badge/built%20with-Next.js%20%2F%20Tailwind-c9a84c?style=flat-square)]()
[![No Backend](https://img.shields.io/badge/backend-none-c9a84c?style=flat-square)]()
[![Part of OpenSlate](https://img.shields.io/badge/part%20of-OpenSlate-c9a84c?style=flat-square)]()

---

OpenFrame is a complete pre-production tool for filmmakers. Storyboard your shots, build your shot list, manage characters and locations, plan your schedule, and collect visual references — all in one place, all for free.

Part of the **[OpenSlate](https://github.com/kazim-45)** suite. Write your script in **[OpenWrite](https://openwrite.vercel.app)** — plan your shoot here.

**[→ Open the app](https://openframev1.vercel.app)**

---

## Features

### 🎬 Storyboard

Panel-based storyboard editor organized by scene. Each panel supports four visual modes:

**Templates** — 10 pre-built SVG shot compositions:
`ECU · CU · MCU · MS · WS · EWS · OTS · POV · Aerial · 2-Shot`

**Draw** — freehand canvas with pencil, eraser, shapes, color picker, and stroke width. Touch-screen supported.

**Upload** — attach any reference photo or production still to the panel.

**AI Generate** — describe the shot in plain language, get a cinematic image via Pollinations.ai. Free. No API key required.

Each panel stores: shot type, camera movement, lens, duration, action, dialogue, and notes.

---

### 📋 Shot List

Auto-generated from your storyboard. Every shot across every scene in one table — shot type, camera movement, lens, duration, action, dialogue. Total runtime calculated automatically. Print to PDF in one click.

---

### 👥 Characters

Character profiles — name, actor, description, notes. Quick-reference cards for the full cast.

---

### 📍 Locations

Location records with address, contact, phone, permit status, and scouting notes. Permit-required locations flagged with a visible badge.

---

### 🖼 Mood Board

Upload reference images in a masonry grid. Add captions. Used for visual tone, color palette, costume, lighting — anything that defines the look of your film.

---

### 📅 Call Sheet

Full production scheduling — shoot dates with call times, crew list with individual call times, and production notes.

---

### 📤 Export

| Export | Format |
|---|---|
| Storyboard | PDF — panels in a 3-column grid with shot info |
| Shot List | PDF — full table with all shots and duration |
| Call Sheet | PDF — schedule, crew, and production notes |
| Project Backup | JSON — full project data, restorable |

---

## Mobile

Fully functional on phones and tablets:

- Bottom element navigation at thumb level
- Sidebars become full-screen slide-over drawers
- All modals slide up from the bottom
- Touch-aware drawing canvas
- Virtual keyboard handling on iOS and Android
- Swipe gestures to open/close panels

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Storage | `localStorage` — no backend required |
| AI Images | Pollinations.ai — free, no API key |
| Hosting | Vercel |
| CI/CD | Push to `main` → live in ~20 seconds |

---

## Getting Started

**Use it instantly:**
```
https://openframev1.vercel.app
```

**Run locally:**
```bash
git clone git@github.com:kazim-45/openframe.git
cd openframe
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Deploy your own:**
```
Fork this repo → connect to Vercel → done.
Vercel detects Next.js automatically. No configuration required.
```

---

## Project Structure

```
openframe/
├── app/
│   ├── components/
│   │   ├── DrawingCanvas.jsx     # Freehand canvas with tools
│   │   ├── PanelEditor.jsx       # Shot editor modal — all 4 visual modes
│   │   └── ShotTemplates.jsx     # 10 SVG shot compositions
│   ├── project/[id]/
│   │   └── page.jsx              # Full project view — all 6 tabs + exports
│   ├── page.jsx                  # Dashboard — project list
│   ├── layout.jsx
│   └── globals.css
├── tailwind.config.js
├── next.config.mjs
└── package.json
```

---

## OpenSlate Suite

| Tool | Description | Status |
|---|---|---|
| **[OpenWrite](https://github.com/kazim-45/openwrite)** | Screenplay editor | ✅ Live |
| **OpenFrame** | Pre-production suite | ✅ Live |
| **OpenView** | Viewfinder and shot planning | 🔜 Coming |

The vision: write your script in OpenWrite, plan your shoot in OpenFrame, frame your shots in OpenView — connected, free, built for filmmakers who can't afford the existing tools.

---

## Roadmap

- [ ] Import script from OpenWrite — scenes auto-populate storyboard
- [ ] Drag-and-drop panel reordering
- [ ] Google authentication via NextAuth.js
- [ ] Cloud saves — Supabase per-user storage
- [ ] Real-time collaboration
- [ ] Custom domain — `openframe.app`

---

## Contributing

Pull requests are open. If you find a bug — broken panel mode, export issue, layout problem on a specific device — open an issue with steps to reproduce.

---

## License

MIT — use it, fork it, ship it. Credit appreciated, not required.

---

## Author

Built by **Kazim** — 18-year-old developer and filmmaker from Lahore, Pakistan.

[GitHub](https://github.com/kazim-45) · [OpenWrite](https://openwrite.vercel.app) · [OpenFrame](https://openframev1.vercel.app)

---

*Plan the frame. Make the shot.*
