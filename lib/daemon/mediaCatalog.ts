export type MediaSurface = "image" | "video" | "audio";
export type AudioKind = "music" | "speech" | "sfx";

export interface MediaProvider {
  id: string;
  label: string;
  hint: string;
  integrated: boolean;
  credentialsRequired?: boolean;
  settingsVisible?: boolean;
  defaultBaseUrl?: string;
  docsUrl?: string;
  supportsCustomModel?: boolean;
}

export interface MediaModel {
  id: string;
  label: string;
  hint: string;
  provider: string;
  caps: string[];
  default?: boolean;
}

export const MEDIA_PROVIDERS: MediaProvider[] = [
  {
    id: "openai",
    label: "OpenAI",
    hint: "gpt-image-2 / dall-e-3",
    integrated: true,
    defaultBaseUrl: "https://api.openai.com/v1",
    docsUrl: "https://platform.openai.com/api-keys",
  },
  {
    id: "stub",
    label: "Stub (placeholder)",
    hint: "Bytes locais determinísticos para teste sem custo",
    integrated: true,
    credentialsRequired: false,
  },
  {
    id: "minimax",
    label: "MiniMax",
    hint: "Texto e imagem já conectados no Open Studio",
    integrated: true,
    defaultBaseUrl: "https://api.minimax.io",
    docsUrl: "https://platform.minimaxi.com",
  },
  {
    id: "volcengine",
    label: "Volcengine Ark (Doubao)",
    hint: "Seedance 2.0 / Seedream",
    integrated: true,
    defaultBaseUrl: "https://ark.cn-beijing.volces.com/api/v3",
    docsUrl: "https://console.volcengine.com/ark",
  },
  {
    id: "grok",
    label: "xAI Grok Imagine",
    hint: "grok-imagine, imagem + video com audio nativo",
    integrated: true,
    defaultBaseUrl: "https://api.x.ai/v1",
    docsUrl: "https://docs.x.ai/developers/model-capabilities/video/generation",
  },
  {
    id: "nanobanana",
    label: "Nano Banana",
    hint: "Google oficial por padrão; gateway customizável",
    integrated: true,
    defaultBaseUrl: "https://generativelanguage.googleapis.com",
    docsUrl: "https://ai.google.dev/gemini-api/docs/api-key",
    supportsCustomModel: true,
  },
  {
    id: "bfl",
    label: "Black Forest Labs",
    hint: "FLUX 1.1 Pro / FLUX Pro / Dev",
    integrated: false,
    defaultBaseUrl: "https://api.bfl.ai",
    docsUrl: "https://docs.bfl.ai/quick_start/create_account",
  },
  {
    id: "fal",
    label: "Fal.ai",
    hint: "Sora / Seedance / Veo / FLUX",
    integrated: false,
    defaultBaseUrl: "https://fal.run",
    docsUrl: "https://fal.ai/dashboard/keys",
  },
  {
    id: "replicate",
    label: "Replicate",
    hint: "FLUX / SDXL / Ideogram",
    integrated: false,
    defaultBaseUrl: "https://api.replicate.com/v1",
    docsUrl: "https://replicate.com/account/api-tokens",
  },
  {
    id: "google",
    label: "Google AI / Vertex",
    hint: "Imagen 4 / Veo 3 / Lyria",
    integrated: false,
    docsUrl: "https://ai.google.dev/gemini-api/docs/api-key",
  },
  {
    id: "kling",
    label: "Kuaishou Kling",
    hint: "Kling 1.6 / 2.0 video",
    integrated: false,
    docsUrl: "https://klingai.com/dev-center",
  },
  {
    id: "midjourney",
    label: "Midjourney (proxy)",
    hint: "midjourney-v7",
    integrated: false,
  },
  {
    id: "elevenlabs",
    label: "ElevenLabs",
    hint: "Voice / SFX",
    integrated: false,
    docsUrl: "https://elevenlabs.io/app/settings/api-keys",
  },
  {
    id: "suno",
    label: "Suno",
    hint: "Music generation",
    integrated: false,
  },
  {
    id: "udio",
    label: "Udio",
    hint: "Music generation",
    integrated: false,
  },
];

export const IMAGE_MODELS: MediaModel[] = [
  { id: "gpt-image-2", label: "gpt-image-2", hint: "OpenAI, 4K multimodal", provider: "openai", caps: ["t2i", "i2i", "inpaint"], default: true },
  { id: "gpt-image-1.5", label: "gpt-image-1.5", hint: "OpenAI, rápido", provider: "openai", caps: ["t2i", "i2i", "inpaint"] },
  { id: "gpt-image-1", label: "gpt-image-1", hint: "OpenAI nativo", provider: "openai", caps: ["t2i", "i2i", "inpaint"] },
  { id: "dall-e-3", label: "dall-e-3", hint: "OpenAI clássico", provider: "openai", caps: ["t2i"] },
  { id: "image-01", label: "image-01", hint: "MiniMax atual", provider: "minimax", caps: ["t2i"] },
  { id: "doubao-seedream-3-0-t2i-250415", label: "seedream-3.0", hint: "ByteDance Doubao image", provider: "volcengine", caps: ["t2i"] },
  { id: "doubao-seededit-3-0-i2i-250628", label: "seededit-3.0", hint: "ByteDance image edit", provider: "volcengine", caps: ["i2i"] },
  { id: "grok-imagine-image", label: "grok-imagine-image", hint: "xAI text-to-image", provider: "grok", caps: ["t2i"] },
  { id: "gemini-3.1-flash-image-preview", label: "nano-banana-2", hint: "Nano Banana text-to-image", provider: "nanobanana", caps: ["t2i"] },
  { id: "flux-1.1-pro", label: "flux-1.1-pro", hint: "BFL flagship", provider: "bfl", caps: ["t2i", "i2i"] },
  { id: "flux-pro", label: "flux-pro", hint: "BFL", provider: "bfl", caps: ["t2i"] },
  { id: "flux-dev", label: "flux-dev", hint: "BFL open weights", provider: "bfl", caps: ["t2i"] },
  { id: "imagen-4", label: "imagen-4", hint: "Google latest", provider: "google", caps: ["t2i"] },
  { id: "imagen-3", label: "imagen-3", hint: "Google", provider: "google", caps: ["t2i"] },
  { id: "ideogram-v2", label: "ideogram-v2", hint: "Replicate typography", provider: "replicate", caps: ["t2i"] },
  { id: "sdxl", label: "stable-diffusion-xl", hint: "Replicate SDXL", provider: "replicate", caps: ["t2i"] },
  { id: "sd-3.5", label: "stable-diffusion-3.5", hint: "Fal SD 3.5", provider: "fal", caps: ["t2i"] },
  { id: "midjourney-v7", label: "midjourney-v7", hint: "Midjourney via proxy", provider: "midjourney", caps: ["t2i"] },
];

export const VIDEO_MODELS: MediaModel[] = [
  { id: "doubao-seedance-2-0-260128", label: "seedance-2.0", hint: "ByteDance t2v + i2v + audio", provider: "volcengine", caps: ["t2v", "i2v", "audio"], default: true },
  { id: "grok-imagine-video", label: "grok-imagine-video", hint: "xAI t2v + i2v + audio", provider: "grok", caps: ["t2v", "i2v", "audio"] },
  { id: "kling-2.0", label: "kling-2.0", hint: "Kuaishou latest", provider: "kling", caps: ["t2v", "i2v"] },
  { id: "veo-3", label: "veo-3", hint: "Google sound-on", provider: "google", caps: ["t2v", "audio"] },
  { id: "sora-2", label: "sora-2", hint: "OpenAI via Fal", provider: "fal", caps: ["t2v"] },
  { id: "minimax-video-01", label: "video-01", hint: "MiniMax Hailuo", provider: "minimax", caps: ["t2v", "i2v"] },
];

export const AUDIO_MODELS_BY_KIND: Record<AudioKind, MediaModel[]> = {
  music: [
    { id: "suno-v5", label: "suno-v5", hint: "Suno default", provider: "suno", caps: ["music"], default: true },
    { id: "udio-v2", label: "udio-v2", hint: "Udio", provider: "udio", caps: ["music"] },
    { id: "lyria-2", label: "lyria-2", hint: "Google", provider: "google", caps: ["music"] },
  ],
  speech: [
    { id: "gpt-4o-mini-tts", label: "gpt-4o-mini-tts", hint: "OpenAI expressive TTS", provider: "openai", caps: ["tts"] },
    { id: "minimax-tts", label: "minimax-tts", hint: "MiniMax default", provider: "minimax", caps: ["tts"], default: true },
    { id: "elevenlabs-v3", label: "elevenlabs-v3", hint: "ElevenLabs", provider: "elevenlabs", caps: ["tts", "voice-clone"] },
  ],
  sfx: [
    { id: "elevenlabs-sfx", label: "elevenlabs-sfx", hint: "ElevenLabs SFX", provider: "elevenlabs", caps: ["sfx"], default: true },
  ],
};
