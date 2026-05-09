<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=FF4DA6&height=200&text=MiniMax%20Content%20Studio&fontSize=42&fontColor=FFFFFF&animation=fadeIn&fontAlignY=42&desc=Open-source%20AI%20content%20dashboard%20for%20creators&descAlignY=62&descFontColor=FFE0F0&descFontSize=16"/>

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-FF4DA6?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-9B5CFF?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![MiniMax AI](https://img.shields.io/badge/MiniMax%20AI-FF8CC8?style=for-the-badge&logoColor=white)](https://minimax.io)
[![License](https://img.shields.io/badge/License-MIT-FF4DA6?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-9B5CFF?style=for-the-badge)](CONTRIBUTING.md)

<br/>

> Generate scripts · thumbnails · music · content pipelines — all from one clean local interface.

</div>

---

## What is MiniMax Content Studio?

A visual, open-source dashboard for creators who want to use **MiniMax's AI models** without writing code.

You bring your own MiniMax API key. Everything runs locally on your machine.

<div align="center">

| | |
|---|---|
| 🎬 **Script Generator** | Generate video scripts with MiniMax M2.7 |
| 🖼️ **Thumbnail Generator** | AI-powered thumbnails via MiniMax Image |
| 🎵 **Music Generator** | Background music with MiniMax Music |
| ⚡ **Pipeline Builder** | Chain steps into automated content workflows |
| 📦 **Asset Library** | Manage and export all your generated content |
| ⚙️ **Settings** | API key config + Demo Mode (no key needed) |

</div>

---

## Feature Status

| Feature | Status |
|---|---|
| Script Generator | ✅ Working |
| Thumbnail Generator | ✅ Working |
| Music Generator | ✅ Working |
| Pipeline Builder | ✅ Working |
| Assets Library | ✅ Working |
| Exports Manager | ✅ Working |
| Settings + API Key config | ✅ Working |
| Demo Mode (no API key) | ✅ Working |
| Video Generator | 🚧 Adapter ready, API endpoint pending |
| SQLite storage | 🗓️ Planned |
| Background jobs / WebSocket | 🗓️ Planned |
| Export .zip packages | 🗓️ Planned |

---

## Quick Start

### Requirements

- **Node.js 18+** (20 recommended)
- **npm** (included with Node.js)
- **MiniMax API key** — get one at [minimax.io](https://minimax.io)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/vivieches/minimax-content-studio.git
cd minimax-content-studio

# 2. Install dependencies
npm install

# 3. Configure your API key
cp .env.example .env.local
# Edit .env.local and add your MINIMAX_API_KEY

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you're good to go.

### Demo Mode

Test the full UI without an API key:

```env
NEXT_PUBLIC_DEMO_MODE=true
```

Demo mode uses mock data and does not call the MiniMax API.

---

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run unit tests (Vitest)
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run end-to-end tests (Playwright)
```

---

## Project Structure

```
app/
  (dashboard)/        # Dashboard pages (scripts, thumbnails, music, etc.)
  api/                # Next.js API routes (backend)
components/           # Shared UI components
lib/
  minimax/            # MiniMax API clients (text, image, music, video)
  storage/            # Local JSON storage (settings, assets, exports)
  prompts/            # Prompt templates
  security/           # Input validation and sanitization
  validation/         # Zod schemas
data/                 # Local storage (git-ignored, created on first run)
public/               # Static assets
docs/                 # Documentation
```

---

## Known Limitations

- **Video generation:** adapter-ready but depends on MiniMax's official video endpoint. May not work on all accounts.
- **Async jobs:** Music and video use synchronous polling. WebSocket support is planned.
- **Storage:** JSON files for MVP. SQLite support is planned.

---

## Roadmap

See [docs/roadmap.md](docs/roadmap.md) for the full roadmap.

---

## Contributing

Contributions are welcome — from bug fixes to new features.

**Good first areas:**
- UI polish and responsiveness
- MiniMax API integrations (especially video)
- Tests and documentation
- Design improvements and dark mode tweaks

See [CONTRIBUTING.md](CONTRIBUTING.md) to get started. For bugs and questions, [open an issue](https://github.com/vivieches/minimax-content-studio/issues).

---

## Security

- API key is **never** committed to git (`.env.local` is git-ignored)
- Generation happens server-side via Next.js API routes
- No external telemetry or tracking

See [SECURITY.md](SECURITY.md) to report vulnerabilities.

---

## Documentation

| Doc | Description |
|---|---|
| [docs/setup.md](docs/setup.md) | Detailed setup guide |
| [docs/minimax-api.md](docs/minimax-api.md) | MiniMax API configuration |
| [docs/roadmap.md](docs/roadmap.md) | Project roadmap |
| [docs/troubleshooting.md](docs/troubleshooting.md) | Common issues |

---

<div align="center">

**Built by [Vitoria Ferreira](https://github.com/vivieches)**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-FF4DA6?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/vitória-ferreira-162643281)
[![GitHub](https://img.shields.io/badge/GitHub-9B5CFF?style=for-the-badge&logo=github&logoColor=white)](https://github.com/vivieches)

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=FF4DA6&height=100&section=footer"/>

</div>
