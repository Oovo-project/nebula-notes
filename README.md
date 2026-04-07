# Nebula Notes — Speak. It's Done.

> Record your voice. AI transcribes, summarizes, and organizes it automatically.

Nebula Notes is a voice-first memo app that removes the friction of note-taking. Hit record, say what's on your mind, and let AI handle the rest — transcription, summarization, categorization, and tagging, all in one seamless flow.

---

## Screenshot

<!-- TODO: Add a screenshot or screen recording (GIF recommended) -->
![Nebula Notes App Screenshot](./public/screenshot-placeholder.png)

> *Microphone button → Processing → Memo card appears — done.*

---

## Features

- **One-tap recording** — Record directly from the browser with no setup required
- **AI transcription** — Converts voice to text using OpenAI Whisper with high accuracy
- **Auto summarization** — GPT generates concise titles, summaries, and bullet-point key facts
- **Smart categorization** — Memos are automatically tagged and grouped by category
- **Inbox & Search** — Browse all memos, filter by tag, and search full-text across transcripts
- **Memo detail view** — See full transcript, summary points, and open loops at a glance
- **Offline-resilient** — Falls back to stub mode when OPENAI_API_KEY is not set, so the app always runs
- **Star-field UI** — Animated constellation canvas and orb background for a distinctive look and feel

---

## Tech Stack

![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI_API-412991?style=for-the-badge&logo=openai&logoColor=white)

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| ORM | Prisma 6 |
| Database | SQLite |
| AI — Speech-to-Text | OpenAI Whisper |
| AI — Summarization | OpenAI GPT (chat completions) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- An OpenAI API key (optional — app runs in stub mode without it)

### 1. Clone & install

```bash
git clone https://github.com/koki-kamogawa/nebula-notes.git
cd nebula-notes
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY="sk-..."   # Optional. Omit to run in stub mode.
```

### 3. Set up the database

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

> If the migration command fails in your environment, that's fine — the database table is created automatically on first API access.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Record your first memo

1. Click the microphone button
2. Speak naturally
3. Click again to stop — the memo appears in seconds

---

## Architecture

```
nebula-notes/
├── app/
│   ├── page.tsx              # Home — recording UI & recent memos
│   ├── inbox/                # Full memo list with search & filter
│   ├── memo/[id]/            # Memo detail (transcript + summary)
│   ├── about/                # About page
│   └── api/
│       └── memos/            # REST API — GET (list) / POST (create)
│                             # POST: receive audio → Whisper → GPT → DB
├── components/
│   ├── MicButton.tsx         # Recording state machine (idle/recording/processing)
│   ├── MemoCard.tsx          # Memo list item
│   ├── MemoDetailClient.tsx  # Full detail view
│   ├── RecentMemos.tsx       # Home feed (latest 3)
│   ├── ConstellationCanvas.tsx  # Animated star-field background
│   └── ...
├── prisma/
│   └── schema.prisma         # Memo model (id, title, summary, transcript, tags…)
└── lib/                      # Shared utilities
```

### Data flow

```
Browser (MediaRecorder API)
  └─→ POST /api/memos  (multipart/form-data, audio blob)
        └─→ OpenAI Whisper  →  transcript
        └─→ OpenAI GPT      →  title + summary + tags + key facts
        └─→ Prisma          →  save to SQLite
              └─→ JSON response  →  UI update (no page reload)
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/memos?limit=N` | Fetch latest N memos |
| `POST` | `/api/memos` | Upload audio and create a memo |

**POST body:** `multipart/form-data` with field `audio` (any format supported by Whisper).

---

## Author

**Koki Kamogawa**

- GitHub: [@koki-kamogawa](https://github.com/koki-kamogawa)
- Company: [Oovo](https://oovo.jp)

---

## 日本語説明

Nebula Notes は「話すだけでメモが完成する」音声メモアプリです。

マイクボタンを押して話すと、OpenAI の Whisper で音声を自動文字起こしし、GPT がタイトル・要約・タグ・キーポイントを生成してデータベースに保存します。録音・文字起こし・整理のすべてがワンタップで完結します。

**主な技術:** Next.js 15 (App Router) / TypeScript / Tailwind CSS / Prisma / SQLite / OpenAI API

**動作モード:**
- `OPENAI_API_KEY` あり → Whisper + GPT でフル動作
- `OPENAI_API_KEY` なし → スタブモードで動作（API コールなしでも起動確認可能）

---

*Built with Next.js 15 App Router + OpenAI API*
