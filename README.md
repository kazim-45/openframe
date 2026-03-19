# OpenFrame

**Professional film pre-production suite. Free. Open source. Runs in your browser.**

[![Live Demo](https://img.shields.io/badge/live%20demo-openframe.vercel.app-c9a84c?style=flat-square)](https://openframe.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-c9a84c?style=flat-square)](LICENSE)
[![Built With](https://img.shields.io/badge/built%20with-Next.js%20%2F%20Tailwind-c9a84c?style=flat-square)]()
[![Zero Dependencies](https://img.shields.io/badge/backend-none-c9a84c?style=flat-square)]()
[![Part of OpenSlate](https://img.shields.io/badge/part%20of-OpenSlate-c9a84c?style=flat-square)]()

---

OpenFrame is a complete pre-production tool for filmmakers. Storyboard your shots, build your shot list, manage characters and locations, plan your schedule, and collect visual references — all in one place, all for free.

Part of the **[OpenSlate](https://github.com/kazim-45)** suite. Write your script in **[OpenWrite](https://openwrite.vercel.app)** — plan your shoot here.

**[→ Open the app](https://openframev1.vercel.app)**

---

## Features

### 🎬 Storyboard

A full panel-based storyboard editor organized by scene. Each panel has four visual modes:

**Templates** — 10 pre-built SVG shot compositions based on industry-standard framing:

| Template | Description |
|---|---|
| ECU | Extreme Close-Up |
| CU | Close-Up |
| MCU | Medium Close-Up |
| MS | Medium Shot |
| WS | Wide Shot |
| EWS | Extreme Wide Shot |
| OTS | Over-the-Shoulder |
| POV | Point of View |
| Aerial | Bird's Eye View |
| 2-Shot | Two characters in frame |

**Draw** — freehand canvas with pencil, eraser, line, rectangle, ellipse, color picker, and stroke width control. Touch-screen supported.

**Upload** — attach any reference photo, screenshot, or production still directly to the panel.

**AI Generate** — describe the shot in plain language, get a cinematic image generated instantly via Pollinations.ai. Free. No API key required. Shot type is automatically included in the generation prompt.

Each panel also stores: shot type, camera movement, lens, duration estimate, action description, dialogue, and technical notes.

---

### 📋 Shot List

Auto-generated from your storyboard. Every shot across every scene in one clean table — shot type, camera movement, lens, duration, action, and dialogue. Estimated total runtime calculated automatically. Print-ready layout.

---

### 👥 Characters

Character profiles with name, actor, physical description, and production notes. Quick-reference cards for the full cast.

---

### 📍 Locations

Location records with address, contact name, phone number, permit status, and scouting notes. Permit-required locations are flagged with a visible badge.

---

### 🖼 Mood Board

Upload reference images in a masonry grid layout. Add captions to individual images. Used for visual tone, color palette, costume, lighting references — anything that defines the look of your film.

---

### 📅 Call Sheet

Full production scheduling:

- **Shoot dates** — date, call time, location, scenes covered, notes per day
- **Crew list** — name, role, phone number, individual call time
- **Production notes** — general briefings, equipment lists, safety notes

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
│   │   ├── DrawingCanvas.jsx    # Freehand canvas with tools
│   │   ├── PanelEditor.jsx      # Shot editor modal (all 4 visual modes)
│   │   └── ShotTemplates.jsx    # 10 SVG shot compositions
│   ├── project/
│   │   └── [id]/
│   │       └── page.jsx         # Full project view — all 6 tabs
│   ├── globals.css
│   ├── layout.jsx
│   └── page.jsx                 # Dashboard — project list
├── next.config.mjs
├── tailwind.config.js
└── package.json
```

---

## OpenSlate Suite

OpenFrame is the second tool in the OpenSlate filmmaking suite.

| Tool | Description | Status |
|---|---|---|
| **OpenWrite** | Screenplay editor | ✅ Live |
| **OpenFrame** | Pre-production suite | ✅ Live |
| **OpenView** | Viewfinder and shot planning | 🔜 Coming |

The vision: write your script in OpenWrite, plan your shoot in OpenFrame, frame your shots in OpenView — all connected, all free, built for filmmakers who can't afford the existing tools.

---

## Roadmap

- [ ] Import script directly from OpenWrite — scenes auto-populate storyboard
- [ ] PDF export for storyboard grid and call sheet
- [ ] Drag-and-drop panel reordering
- [ ] Google authentication via NextAuth.js
- [ ] Cloud saves — Supabase per-user project storage
- [ ] Real-time collaboration — share a project with your DP or AD
- [ ] Shot revision tracking with color-coded changes
- [ ] Custom domain — `openframe.app`

---

## Contributing

Pull requests are open. If you find a bug — a broken panel mode, a layout issue, incorrect shot type behavior — open an issue with steps to reproduce.

---

## License

MIT — use it, fork it, ship it. Credit appreciated, not required.

---

## Author

Built by **Kazim** — 17-year-old developer and filmmaker from Lahore, Pakistan.

[GitHub](https://github.com/kazim-45) · [OpenWrite](https://openwrite.vercel.app) · [OpenFrame](https://openframe.vercel.app)

---

*Plan the frame. Make the shot.*
