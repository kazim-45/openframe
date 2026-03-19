# OpenFrame

**Professional film pre-production suite. Free. Open source. Runs in your browser.**

[![License](https://img.shields.io/badge/license-MIT-c9a84c?style=flat-square)](LICENSE)
[![Built With](https://img.shields.io/badge/built%20with-Next.js%20%2F%20Tailwind-c9a84c?style=flat-square)]()
[![Deployed on Vercel](https://img.shields.io/badge/deployed%20on-Vercel-c9a84c?style=flat-square)](https://vercel.com)

---

OpenFrame is a complete pre-production tool for filmmakers. Storyboard your shots, build your shot list, manage characters and locations, plan your schedule, and collect visual references — all in one place, all for free.

Companion tool to **[FADE IN](https://github.com/kazim-45/Fade-in-script-writer)** — write your script there, plan your shoot here.

---

## Features

### 🎬 Storyboard
- Organize shots into scenes with drag-and-drop panel grid
- Four visual modes per panel:
  - **Templates** — pre-built SVG shot compositions (ECU, CU, MCU, MS, WS, EWS, OTS, POV, Aerial, 2-Shot, and more)
  - **Draw** — freehand canvas with pencil, eraser, shapes, and color picker
  - **Upload** — attach reference photos or screenshots
  - **AI Generate** — describe the shot, get a cinematic image via Pollinations.ai (free, no API key)
- Per-panel: shot type, camera movement, lens, duration, action, dialogue, notes

### 📋 Shot List
- Auto-generated from storyboard data
- All shots across all scenes in one table
- Total estimated duration
- Print-ready layout

### 👥 Characters
- Character profiles with name, actor, description, notes
- Quick-reference cards

### 📍 Locations
- Location details: address, contact, phone, permit status
- Notes per location

### 🖼 Mood Board
- Upload reference images in a masonry grid
- Add captions to each image

### 📅 Call Sheet
- Shoot dates with call times, locations, scenes covered
- Crew list with roles, phone numbers, individual call times
- Production notes

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Storage | localStorage (no backend required) |
| AI Images | Pollinations.ai (free, no API key) |
| Hosting | Vercel |

---

## Getting Started

```bash
git clone https://github.com/kazim-45/openframe.git
cd openframe
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Deploy:**
Connect the repo to Vercel. It detects Next.js automatically. No configuration required.

---

## Roadmap

- [ ] Import script directly from FADE IN
- [ ] PDF export for storyboard grid and call sheet
- [ ] Drag-and-drop panel reordering
- [ ] Google auth + cloud saves (Supabase)
- [ ] Collaborative editing
- [ ] Shot revision tracking

---

## License

MIT — use it, fork it, ship it.

---

## Author

Built by **Kazim** — 17-year-old developer and filmmaker from Lahore, Pakistan.

[GitHub](https://github.com/kazim-45) · [FADE IN](https://fade-in-script-writer.vercel.app)

---

*Plan the frame. Make the shot.*
