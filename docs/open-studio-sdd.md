# Open Studio SDD

## Product Scope

Open Studio is now a local-first creator workspace focused on:

- Text generation
- Image generation
- Content packages that bind briefing, script, title, thumbnail prompt/image, assets and export metadata

Music, audio and video generation are out of the active product scope. Legacy `music` and `video` assets can still render defensively in the asset library, but no active route, nav item, setting default or pipeline step should depend on them.

## Runtime Shape

The local runtime is exposed through Next route handlers as a daemon-compatible surface:

- `GET /api/health`
- `GET /api/agents`
- `POST /api/agents/test`
- `POST /api/proxy/{anthropic,openai,azure,google,ollama}/stream`
- `POST /api/generate/text`
- `POST /api/generate/image`
- `POST /api/generate/package`
- `GET/POST/PATCH/DELETE /api/assets`
- `GET/POST /api/exports`

This keeps the UI and compatibility routes stable while the daemon implementation can later move to a separate `127.0.0.1` process without changing the web contract.

## OpenDesign Logic Adopted

- Local daemon-style API surface.
- Agent registry based on hardcoded CLI definitions with fallback models.
- Power-local permission defaults for supported CLIs: bypass permissions, workspace write, dangerous mode or accept hooks depending on the tool.
- Prompt delivery designed for stdin.
- BYOK provider proxy with normalized SSE events: `start`, `delta`, `end`, `error`.
- Base URL validation that allows loopback/local LLMs and blocks private/reserved remote networks.
- Hardcoded provider/model catalog for hosted and local-first providers.
- Browser `localStorage` secrets as the accepted v1 default, with masked tail display in Settings.
- Categorized connection errors.
- `.open-studio/` local storage for settings, assets, files and exports.

## Active Capabilities

`ActiveProviderCapability = "text" | "image"`.

Provider configs may still tolerate legacy `audio` and `video` fields during migration, but defaults, UI and package generation only use text and image.

## Provider Catalog

Text providers:

- MiniMax
- OpenAI
- OpenAI Compatible
- Azure OpenAI
- Anthropic
- Gemini
- OpenRouter
- Groq
- Together AI
- DeepSeek
- Ollama
- LM Studio
- vLLM
- Local OpenAI-compatible

Image providers:

- MiniMax
- OpenAI
- OpenAI Compatible
- Azure OpenAI
- Together AI
- fal.ai
- Replicate
- Local OpenAI-compatible

## ContentPackage

Core object:

- `briefing`
- `script`
- `title`
- `selectedTitle`
- `titleCandidates` (registered for future CTR/SEO generator)
- `thumbnailPrompt`
- `thumbnailText`
- `outputs.text`
- `outputs.image`
- `assets`
- `exportId`

Future registered modules, not implemented yet:

- Generate 10 CTR/SEO title candidates and rank top 3.
- Caption/legenda generator using Lucas's final pattern.
- More explicit scoring that keeps title and thumbnail as one delivery package.

## Verification

Required before shipping:

- `npm test`
- `npm run build`
- `npm run lint`
- E2E smoke after dev server starts

