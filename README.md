# REAVES — AI Research Co-Pilot

AI-powered research assistant that validates sources, scores credibility, and synthesizes academic findings. Includes a Chrome browser extension.

---

## Project Structure

```
Project_Reaves/
├── reaves/              ← Next.js web app
└── reaves-extension/    ← Chrome Extension (Manifest V3)
```

---

## Setup for New Developers

### 1. Clone the repo
```bash
git clone https://github.com/Rex-Oliver-Jumawid/Reaves.git
cd Reaves
```

### 2. Create your environment file
Create `reaves/.env.local` — ask the team lead for the API key:
```env
ANTHROPIC_API_KEY=sk-ant-...   # get this from the team
USE_MOCK=true                  # use mock data (no API cost)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### 3. Install dependencies and run the web app
```bash
cd reaves
npm install
npm run dev
```
Web app runs at → **http://localhost:3000**

### 4. Build and load the Chrome Extension
```bash
cd ../reaves-extension
npm install
npm run build
```
Then in Chrome:
- Go to `chrome://extensions`
- Enable **Developer mode**
- Click **Load unpacked** → select `reaves-extension/dist/`

---

## Mock Mode vs Real API

In `reaves/.env.local`:
- `USE_MOCK=true` — uses pre-baked data, no API cost, works offline
- `USE_MOCK=false` — calls real Claude AI (requires valid `ANTHROPIC_API_KEY`)

---

## Tech Stack

| Layer | Tech |
|---|---|
| Web App | Next.js 16, React, TypeScript |
| AI | Anthropic Claude (via `@anthropic-ai/sdk`) |
| Styling | Vanilla CSS (dark violet theme) |
| Extension | Chrome MV3, Vite, React |
| Data | localStorage (Supabase planned) |
