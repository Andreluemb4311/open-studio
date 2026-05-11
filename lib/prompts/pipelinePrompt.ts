import { sanitizePromptInput } from "./sanitize";

export function buildPipelinePrompt(briefing: string): string {
  return `You are a content pipeline orchestrator.
Analyze this video briefing and extract all production requirements:

BRIEFING: ${sanitizePromptInput(briefing)}

Return a JSON object with:
{
  "title": "Project title",
  "scriptRequirements": {
    "idea": "core video idea",
    "audience": "target audience",
    "language": "language",
    "tone": "tone",
    "duration": "estimated duration",
    "videoType": "video type",
    "structure": "desired structure",
    "cta": "call to action"
  },
  "thumbnailRequirements": {
    "theme": "visual theme",
    "title": "thumbnail title",
    "style": "visual style",
    "text": "thumbnail text"
  },
  "packageRequirements": {
    "titleAndThumbnailMustMatch": true,
    "registeredFutureModules": ["10 CTR/SEO title candidates", "captions generator"]
  },
  "steps": ["script", "thumbnail", "export"]
}`;
}
