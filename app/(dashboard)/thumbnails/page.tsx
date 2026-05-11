"use client";

import Image from "next/image";
import { useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Clock3,
  Download,
  Expand,
  ImagePlus,
  Info,
  Layers,
  Lightbulb,
  Loader2,
  MoreHorizontal,
  Palette,
  Search,
  Sparkles,
  Upload,
  Wand2,
  X,
  Zap,
} from "lucide-react";

type ThumbnailConfig = {
  topic: string;
  title: string;
  impactText: string;
  audience: string;
  visualStyle: string;
  mood: string;
  background: string;
  colorPreference: string;
  includeFace: boolean;
  includeLogo: boolean;
  includeText: boolean;
  variations: number;
  safeTextMode: boolean;
  referenceImage: string;
  referenceType: "face" | "style";
  resolution: "1280x720" | "1920x1080";
};

type ThumbnailResult = {
  urls: string[];
  base64s?: string[];
  finalPrompt?: string;
};

const PRESETS = [
  { id: "high-ctr", label: "YouTube alto CTR", icon: Zap },
  { id: "face-text", label: "Cara + texto", icon: ImagePlus },
  { id: "split-frame", label: "Split frame", icon: Layers },
  { id: "minimal-clean", label: "Minimal clean", icon: ImagePlus },
  { id: "more", label: "Más presets", icon: ChevronDown },
];

const STYLE_OPTIONS = [
  "YouTube alto CTR",
  "Cara + texto",
  "Split frame",
  "Minimal clean",
  "Tech premium",
  "Producto + creador",
  "Noticia IA",
  "Antes/después",
];

const AUDIENCE_OPTIONS = [
  "Creadores y YouTubers",
  "Developers e IA builders",
  "Marketers y growth",
  "Fundadores y emprendedores",
  "Estudiantes y makers",
  "Audiencia general",
];

const MOOD_OPTIONS = ["Sorprendido 😮", "Confiado", "Curioso", "Dramático", "Profesional", "Emocionado", "Misterioso"];

const BACKGROUND_OPTIONS = [
  "Sólido simple",
  "Gradiente suave",
  "UI de producto",
  "Estudio oscuro",
  "Minimal tech",
  "Split background",
  "Abstracto",
];

const COLOR_OPTIONS = [
  { id: "minimax-coral", label: "Coral cálido MiniMax", colors: ["#ff6077", "#fff7f9", "#0f172a", "#59606a"] },
  { id: "open-studio-pink", label: "Rosa Open Studio", colors: ["#D06FA7", "#F5F2F4", "#151516", "#5F6472"] },
  { id: "dark-premium", label: "Dark premium", colors: ["#D06FA7", "#11131C", "#F5F2F4", "#9B6CFF"] },
  { id: "clean-white", label: "Blanco limpio", colors: ["#F5F2F4", "#D06FA7", "#0A0A0D", "#CBD5E1"] },
  { id: "black-coral", label: "Negro + coral", colors: ["#0A0A0D", "#ff6077", "#F5F2F4", "#27272A"] },
  { id: "tech-blue", label: "Azul tech", colors: ["#0F172A", "#60A5FA", "#F5F2F4", "#D06FA7"] },
  { id: "custom", label: "Custom", colors: ["#D06FA7", "#F5F2F4", "#151516", "#5F6472"] },
];

const HOOKS = ["La IA que cambió mi negocio", "5 herramientas que uso a diario", "Automatiza tu canal con IA"];

const INITIAL_CONFIG: ThumbnailConfig = {
  topic: "MiniMax M2.7 construyó mi fábrica de contenido",
  title: "5 AI Tools in 2024",
  impactText: "FÁBRICA DE CONTENIDO",
  audience: "Creadores y YouTubers",
  visualStyle: "YouTube alto CTR",
  mood: "Sorprendido 😮",
  background: "Sólido simple",
  colorPreference: "minimax-coral",
  includeFace: true,
  includeLogo: false,
  includeText: true,
  variations: 4,
  safeTextMode: false,
  referenceImage: "",
  referenceType: "face",
  resolution: "1920x1080",
};

function buildThumbnailPrompt(config: ThumbnailConfig) {
  const colorPreset = COLOR_OPTIONS.find((option) => option.id === config.colorPreference);
  const textInstruction = config.safeTextMode
    ? "Generate the base thumbnail without any text, letters, words, typography, logos, or watermarks. The impact text will be applied later as a front-end overlay."
    : config.includeText
      ? `Use large, bold, readable thumbnail text with the exact words: "${config.impactText}". Keep it clean, high contrast, and readable on mobile.`
      : "Do not add text to the image.";

  return [
    "Professional YouTube thumbnail, 16:9, high CTR composition, modern creator aesthetic.",
    `Video topic: ${config.topic}.`,
    `Video title: ${config.title}.`,
    `Target audience: ${config.audience}.`,
    `Visual style: ${config.visualStyle}. Mood: ${config.mood}. Background: ${config.background}.`,
    `Color direction: ${colorPreset?.label ?? config.colorPreference}, using strong contrast without changing the Open Studio product UI palette.`,
    config.includeFace
      ? "Include one expressive creator-style face as the main focal point, clear eyes, emotional reaction, clean studio lighting, no distorted face."
      : "Use a strong product or concept focal point instead of a face.",
    config.includeLogo
      ? "Include only a subtle brand mark area if naturally relevant. Do not invent random logos."
      : "No random logos or watermarks.",
    textInstruction,
    "Composition rules: clear focal point, bold readable hierarchy, clean layout, no clutter, no tiny text, no generic AI glow, no unreadable typography, no fake UI gibberish.",
    `Output target: ${config.resolution}, sharp thumbnail suitable for YouTube search, home feed, and mobile preview.`,
  ].join("\n");
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-[14px] border border-line bg-card shadow-[inset_0_1px_0_rgba(255,255,255,0.025),0_20px_60px_rgba(0,0,0,0.18)] ${className}`}
    >
      {children}
    </section>
  );
}

function Field({
  label,
  children,
  aside,
  help,
}: {
  label: string;
  children: ReactNode;
  aside?: ReactNode;
  help?: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label className="text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-2">{label}</label>
        {aside}
      </div>
      {children}
      {help ? <div className="mt-1.5 text-[11px] leading-4 text-ink-3">{help}</div> : null}
    </div>
  );
}

function SelectField({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  ariaLabel: string;
}) {
  return (
    <div className="relative">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full appearance-none rounded-[8px] border border-line bg-card-hi px-3 pr-9 text-[12px] font-medium text-ink transition duration-200 hover:border-line-hi focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/15"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" strokeWidth={1.7} />
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-[8px] py-1.5 text-left"
    >
      <span className="text-[12px] font-medium text-ink-2">{label}</span>
      <span className={`relative h-5 w-9 rounded-full transition ${checked ? "bg-accent" : "bg-line-hi"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-accent-fg transition ${checked ? "left-4" : "left-0.5"}`} />
      </span>
    </button>
  );
}

function AssistantPanel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[10px] border border-line bg-card-hi/50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-accent">{icon}</span>
        <h3 className="text-[13px] font-semibold text-ink">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function ThumbnailGeneratorPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [config, setConfig] = useState<ThumbnailConfig>(INITIAL_CONFIG);
  const [activePreset, setActivePreset] = useState("high-ctr");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [variationsLoading, setVariationsLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ThumbnailResult | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedUrl = result?.urls?.[selectedIndex] ?? "";
  const prompt = useMemo(() => buildThumbnailPrompt(config), [config]);
  const impactWordCount = config.impactText.trim().split(/\s+/).filter(Boolean).length;
  const selectedColor = COLOR_OPTIONS.find((option) => option.id === config.colorPreference) ?? COLOR_OPTIONS[0];
  const canGenerate = Boolean(config.topic.trim() && config.title.trim() && config.impactText.trim());

  function updateConfig<K extends keyof ThumbnailConfig>(key: K, value: ThumbnailConfig[K]) {
    setConfig((current) => ({ ...current, [key]: value }));
  }

  function showStatus(message: string) {
    setStatus(message);
    window.setTimeout(() => setStatus(""), 2200);
  }

  function applyPreset(id: string) {
    setActivePreset(id);
    if (id === "more") {
      setAdvancedOpen(true);
      return;
    }

    const presetMap: Record<string, Partial<ThumbnailConfig>> = {
      "high-ctr": {
        visualStyle: "YouTube alto CTR",
        mood: "Sorprendido 😮",
        background: "Sólido simple",
        colorPreference: "minimax-coral",
        includeFace: true,
      },
      "face-text": {
        visualStyle: "Cara + texto",
        mood: "Emocionado",
        background: "Estudio oscuro",
        colorPreference: "open-studio-pink",
        includeFace: true,
      },
      "split-frame": {
        visualStyle: "Split frame",
        mood: "Dramático",
        background: "Split background",
        colorPreference: "black-coral",
        includeFace: true,
      },
      "minimal-clean": {
        visualStyle: "Minimal clean",
        mood: "Profesional",
        background: "Minimal tech",
        colorPreference: "dark-premium",
        includeFace: false,
      },
    };

    setConfig((current) => ({ ...current, ...presetMap[id] }));
  }

  function normalizeGenerationError(message: string) {
    const lower = message.toLowerCase();
    if (lower.includes("api key") || lower.includes("provider") || lower.includes("settings")) {
      return "Configura un provider en Ajustes para generar miniaturas.";
    }
    return "No se pudo generar la miniatura. Revisa tu conexión o intenta de nuevo.";
  }

  async function generateImages(nextVariations = config.variations, append = false) {
    if (!canGenerate) {
      setError("Completa tema, título y texto de impacto antes de generar.");
      return;
    }

    if (append) setVariationsLoading(true);
    else {
      setLoading(true);
      setResult(null);
      setSelectedIndex(0);
    }
    setError("");

    try {
      const response = await fetch("/api/minimax/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          aspectRatio: "16:9",
          n: nextVariations,
          saveToAssets: true,
          referenceImage: config.referenceImage || undefined,
          referenceType: config.referenceImage ? config.referenceType : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok || data?.error) {
        throw new Error(data?.details || data?.error || "generation failed");
      }
      if (!data?.urls?.length) {
        setError("La generación terminó sin imagen. Intenta con otro prompt.");
        return;
      }

      setResult((current) => {
        if (!append || !current?.urls?.length) return data;
        return {
          ...data,
          urls: [...current.urls, ...data.urls].slice(-8),
          finalPrompt: data.finalPrompt || current.finalPrompt,
        };
      });
      if (!append) setSelectedIndex(0);
      showStatus(append ? "Variaciones generadas" : "Miniatura generada");
    } catch (generationError) {
      setError(normalizeGenerationError(generationError instanceof Error ? generationError.message : ""));
    } finally {
      setLoading(false);
      setVariationsLoading(false);
    }
  }

  async function handleReferenceUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Usa JPG, PNG o WebP como referencia.");
      return;
    }
    if (file.size > 450_000) {
      setError("La referencia debe pesar menos de 450 KB para enviarse al provider.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateConfig("referenceImage", String(reader.result));
      showStatus("Referencia cargada");
    };
    reader.readAsDataURL(file);
  }

  async function downloadSelected() {
    if (!selectedUrl) return;
    try {
      const response = await fetch(selectedUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `open-studio-thumbnail-${selectedIndex + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showStatus("Download listo");
    } catch {
      window.open(selectedUrl, "_blank");
    }
  }

  function applySuggestion() {
    setConfig((current) => ({
      ...current,
      visualStyle: "YouTube alto CTR",
      mood: "Sorprendido 😮",
      background: "Sólido simple",
      colorPreference: "minimax-coral",
      includeFace: true,
      impactText: current.impactText || "FÁBRICA DE CONTENIDO",
    }));
    setActivePreset("high-ctr");
    showStatus("Sugerencia aplicada");
  }

  return (
    <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-canvas text-ink">
      <div className="mx-auto flex w-full max-w-[1640px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-6 2xl:px-9">
        <header className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h1 className="text-[28px] font-bold leading-tight tracking-[-0.035em] text-ink">Generador de Miniaturas</h1>
              <p className="mt-2 text-[14px] text-ink-2">Crea miniaturas atractivas que generan más clics.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative block sm:w-[310px]">
                <span className="sr-only">Buscar en Open Studio...</span>
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-2" strokeWidth={1.7} />
                <input
                  type="search"
                  placeholder="Buscar en Open Studio..."
                  className="h-10 w-full rounded-[9px] border border-line bg-card px-10 pr-14 text-[13px] text-ink placeholder:text-ink-2 transition duration-200 hover:border-line-hi focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/15"
                />
                <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-[5px] border border-line bg-card-hi px-1.5 py-0.5 text-[10px] text-ink-2">
                  ⌘K
                </kbd>
              </label>
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] border border-line bg-white/[0.025] px-4 text-[13px] font-semibold text-ink-2 transition duration-200 hover:border-line-hi hover:bg-hover hover:text-ink"
              >
                <Clock3 className="h-4 w-4" strokeWidth={1.8} />
                Historial
              </button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {PRESETS.map((preset) => {
              const Icon = preset.icon;
              const active = activePreset === preset.id;
              return (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => applyPreset(preset.id)}
                  className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-[8px] border px-4 text-[13px] font-semibold transition duration-200 ${
                    active
                      ? "border-accent/55 bg-accent-soft text-accent-hi shadow-[0_10px_28px_rgba(208,111,167,0.10)]"
                      : "border-line bg-card text-ink-2 hover:border-line-hi hover:bg-hover hover:text-ink"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                  {preset.label}
                </button>
              );
            })}
          </div>
        </header>

        {(error || status) && (
          <div
            className={`flex items-center gap-2 rounded-[10px] border px-4 py-3 text-[13px] ${
              error ? "border-danger/25 bg-danger-soft text-danger" : "border-accent/20 bg-accent-soft text-accent-hi"
            }`}
          >
            {error ? <AlertTriangle className="h-4 w-4" /> : <Check className="h-4 w-4" />}
            {error || status}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[300px_minmax(0,1fr)_300px] 2xl:grid-cols-[320px_minmax(0,1fr)_330px]">
          <Card className="min-w-0 overflow-hidden">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-[15px] font-semibold text-ink">Configuración</h2>
            </div>
            <div className="space-y-4 p-5">
              <Field label="TEMA DEL VIDEO">
                <input
                  value={config.topic}
                  onChange={(event) => updateConfig("topic", event.target.value)}
                  className="h-10 w-full rounded-[8px] border border-line bg-card-hi px-3 text-[12px] font-medium text-ink placeholder:text-ink-3 transition duration-200 hover:border-line-hi focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/15"
                  placeholder="MiniMax M2.7 construyó mi fábrica de contenido"
                />
              </Field>

              <Field label="TÍTULO" aside={<span className="text-[10px] text-ink-3">{config.title.length}/100</span>}>
                <input
                  value={config.title}
                  maxLength={100}
                  onChange={(event) => updateConfig("title", event.target.value)}
                  className="h-10 w-full rounded-[8px] border border-line bg-card-hi px-3 text-[12px] font-medium text-ink placeholder:text-ink-3 transition duration-200 hover:border-line-hi focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/15"
                  placeholder="5 AI Tools in 2024"
                />
              </Field>

              <Field
                label="TEXTO DE IMPACTO"
                aside={<span className="text-[10px] text-ink-3">{config.impactText.length}/40</span>}
                help={
                  impactWordCount > 6 ? (
                    <span className="text-warn">Para mejor lectura, usa 2-5 palabras.</span>
                  ) : (
                    "2-5 palabras ideal para YouTube"
                  )
                }
              >
                <input
                  value={config.impactText}
                  maxLength={40}
                  onChange={(event) => updateConfig("impactText", event.target.value)}
                  className="h-10 w-full rounded-[8px] border border-line bg-card-hi px-3 text-[12px] font-medium text-ink placeholder:text-ink-3 transition duration-200 hover:border-line-hi focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/15"
                  placeholder="FÁBRICA DE CONTENIDO"
                />
              </Field>

              <Field label="AUDIENCIA">
                <SelectField ariaLabel="Audiencia" value={config.audience} onChange={(value) => updateConfig("audience", value)} options={AUDIENCE_OPTIONS} />
              </Field>

              <Field label="ESTILO VISUAL">
                <SelectField ariaLabel="Estilo visual" value={config.visualStyle} onChange={(value) => updateConfig("visualStyle", value)} options={STYLE_OPTIONS} />
              </Field>

              <Field label="AMBIENTE">
                <SelectField ariaLabel="Ambiente" value={config.mood} onChange={(value) => updateConfig("mood", value)} options={MOOD_OPTIONS} />
              </Field>

              <Field label="FONDO">
                <SelectField ariaLabel="Fondo" value={config.background} onChange={(value) => updateConfig("background", value)} options={BACKGROUND_OPTIONS} />
              </Field>

              <Field label="PREFERENCIA DE COLOR">
                <div className="relative">
                  <span
                    className="pointer-events-none absolute left-3 top-1/2 h-5 w-7 -translate-y-1/2 rounded-[5px] border border-white/15"
                    style={{ background: `linear-gradient(135deg, ${selectedColor.colors[0]}, ${selectedColor.colors[1]})` }}
                  />
                  <select
                    aria-label="Preferencia de color"
                    value={config.colorPreference}
                    onChange={(event) => updateConfig("colorPreference", event.target.value)}
                    className="h-10 w-full appearance-none rounded-[8px] border border-line bg-card-hi py-0 pl-12 pr-9 text-[12px] font-medium text-ink transition duration-200 hover:border-line-hi focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/15"
                  >
                    {COLOR_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" strokeWidth={1.7} />
                </div>
              </Field>
            </div>

            <div className="border-t border-line">
              <button
                type="button"
                onClick={() => setAdvancedOpen((open) => !open)}
                className="flex w-full items-center justify-between px-5 py-4 text-[13px] font-medium text-ink-2 transition hover:bg-hover hover:text-ink"
              >
                Opciones avanzadas
                <ChevronDown className={`h-4 w-4 transition ${advancedOpen ? "rotate-180" : ""}`} strokeWidth={1.7} />
              </button>
              {advancedOpen ? (
                <div className="space-y-3 border-t border-line px-5 py-4">
                  <Toggle label="Incluir rostro" checked={config.includeFace} onChange={(value) => updateConfig("includeFace", value)} />
                  <Toggle label="Incluir logo" checked={config.includeLogo} onChange={(value) => updateConfig("includeLogo", value)} />
                  <Toggle label="Incluir texto" checked={config.includeText} onChange={(value) => updateConfig("includeText", value)} />
                  <Toggle label="Modo text overlay seguro" checked={config.safeTextMode} onChange={(value) => updateConfig("safeTextMode", value)} />
                  <Field label="Número de variaciones">
                    <SelectField
                      ariaLabel="Número de variaciones"
                      value={String(config.variations)}
                      onChange={(value) => updateConfig("variations", Number(value))}
                      options={["1", "2", "3", "4"]}
                    />
                  </Field>
                  <Field label="Formato">
                    <SelectField ariaLabel="Formato" value="16:9" onChange={() => undefined} options={["16:9"]} />
                  </Field>
                  <Field label="Resolución">
                    <SelectField
                      ariaLabel="Resolución"
                      value={config.resolution}
                      onChange={(value) => updateConfig("resolution", value as ThumbnailConfig["resolution"])}
                      options={["1280x720", "1920x1080"]}
                    />
                  </Field>
                  <div className="rounded-[10px] border border-line bg-card-hi/45 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[12px] font-semibold text-ink">Referencia de imagen</p>
                        <p className="mt-1 text-[11px] leading-4 text-ink-3">JPG, PNG o WebP. Se usa como referencia real si el provider la soporta.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-line bg-white/[0.025] px-3 text-[12px] font-semibold text-ink-2 transition hover:border-line-hi hover:bg-hover hover:text-ink"
                      >
                        <Upload className="h-4 w-4" />
                        Subir
                      </button>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleReferenceUpload} />
                    {config.referenceImage ? (
                      <div className="mt-3 flex items-center gap-3">
                        <div className="relative aspect-video w-24 overflow-hidden rounded-[8px] border border-line bg-card">
                          <Image src={config.referenceImage} alt="Referencia de imagen" fill className="object-cover" unoptimized />
                        </div>
                        <button
                          type="button"
                          onClick={() => updateConfig("referenceImage", "")}
                          className="text-[12px] font-semibold text-ink-3 transition hover:text-ink"
                        >
                          Remover
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
              <div className="border-t border-line p-5">
                <button
                  type="button"
                  onClick={() => generateImages()}
                  disabled={loading || !canGenerate}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[9px] bg-accent px-5 text-[13px] font-semibold text-accent-fg shadow-[0_12px_34px_rgba(208,111,167,0.18)] transition duration-200 hover:bg-accent-hi disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" strokeWidth={1.8} />}
                  {loading ? "Generando..." : "Generar miniatura"}
                </button>
              </div>
            </div>
          </Card>

          <Card className="min-w-0 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-[15px] font-semibold text-ink">Vista previa</h2>
                <span className="rounded-[7px] border border-line bg-card-hi px-2 py-1 text-[11px] font-medium text-ink-2">1920 × 1080</span>
              </div>
              <button
                type="button"
                onClick={downloadSelected}
                disabled={!selectedUrl}
                className="hidden h-9 items-center gap-2 rounded-[8px] border border-line bg-white/[0.025] px-3 text-[12px] font-semibold text-ink-2 transition hover:border-line-hi hover:bg-hover hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 sm:inline-flex"
              >
                <Download className="h-4 w-4" />
                Descargar
              </button>
            </div>

            <div className="relative aspect-video overflow-hidden rounded-[12px] border border-line bg-[#10121a]">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-card-hi">
                  <Loader2 className="h-9 w-9 animate-spin text-accent" />
                  <p className="text-[13px] font-medium text-ink-2">Generando miniatura...</p>
                </div>
              ) : selectedUrl ? (
                <Image src={selectedUrl} alt="Miniatura generada" fill className="object-cover" sizes="(max-width: 1280px) 100vw, 50vw" unoptimized />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                  <div className="mb-4 grid h-14 w-14 place-items-center rounded-[12px] border border-line bg-card">
                    <ImagePlus className="h-7 w-7 text-accent" strokeWidth={1.7} />
                  </div>
                  <p className="text-[15px] font-semibold text-ink">Configura tu miniatura y genera una primera versión.</p>
                  <p className="mt-2 max-w-[42ch] text-[13px] leading-5 text-ink-2">
                    El preview mostrará solo imágenes generadas por tu provider activo. No usamos mocks como resultado real.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => selectedUrl && setFullscreenOpen(true)}
                disabled={!selectedUrl}
                className="absolute bottom-3 right-3 inline-flex h-9 items-center gap-2 rounded-[8px] border border-white/15 bg-black/45 px-3 text-[12px] font-semibold text-white backdrop-blur-sm transition hover:bg-black/65 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Expand className="h-4 w-4" strokeWidth={1.8} />
                Pantalla completa
              </button>
            </div>

            <div className="mt-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[15px] font-semibold text-ink">Variaciones generadas</h3>
                {result?.urls?.length ? <span className="text-[12px] text-ink-3">{result.urls.length} disponibles</span> : null}
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {(result?.urls?.length ? result.urls : [null, null, null, null]).map((url, index) => (
                  <button
                    type="button"
                    key={url ?? `empty-${index}`}
                    disabled={!url}
                    onClick={() => setSelectedIndex(index)}
                    className={`group relative aspect-video w-[150px] shrink-0 overflow-hidden rounded-[10px] border bg-card-hi transition duration-200 sm:w-[178px] ${
                      url && selectedIndex === index
                        ? "border-accent shadow-[0_0_0_1px_rgba(208,111,167,0.22),0_12px_28px_rgba(208,111,167,0.12)]"
                        : "border-line hover:border-line-hi"
                    } ${!url ? "cursor-default opacity-55" : ""}`}
                  >
                    {url ? <Image src={url} alt={`Variación ${index + 1}`} fill className="object-cover" sizes="180px" unoptimized /> : null}
                    {!url ? <span className="absolute inset-0 grid place-items-center text-[11px] text-ink-3">Sin generar</span> : null}
                    <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-[6px] bg-black/45 text-white opacity-90">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => generateImages(4, true)}
                  disabled={variationsLoading || loading || !canGenerate}
                  className="inline-flex h-10 items-center gap-2 rounded-[9px] border border-accent/45 bg-card px-5 text-[13px] font-semibold text-accent transition duration-200 hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {variationsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" strokeWidth={1.8} />}
                  Generar más variaciones
                </button>
              </div>
            </div>
          </Card>

          <Card className="min-w-0 p-5">
            <div className="mb-5 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" strokeWidth={1.8} />
              <h2 className="text-[15px] font-semibold text-ink">Asistente de IA</h2>
            </div>

            <div className="space-y-4">
              <AssistantPanel title="Sugerencia de IA" icon={<Lightbulb className="h-4 w-4" strokeWidth={1.8} />}>
                <p className="text-[12px] leading-5 text-ink-2">
                  Los rostros con expresión sorprendida + texto grande en alto contraste pueden aumentar el CTR hasta un 32%.
                </p>
                <button
                  type="button"
                  onClick={applySuggestion}
                  className="mt-4 inline-flex h-9 items-center gap-2 rounded-[8px] border border-accent/25 bg-accent-soft px-3 text-[12px] font-semibold text-accent-hi transition hover:border-accent/45 hover:bg-accent-soft/80"
                >
                  <Sparkles className="h-4 w-4" strokeWidth={1.8} />
                  Aplicar sugerencia
                </button>
              </AssistantPanel>

              <AssistantPanel title="Paleta recomendada" icon={<Palette className="h-4 w-4" strokeWidth={1.8} />}>
                <div className="flex gap-2">
                  {selectedColor.colors.map((color, index) => (
                    <button
                      type="button"
                      key={`${color}-${index}`}
                      aria-label={`Aplicar color ${index + 1}`}
                      onClick={() => {
                        updateConfig("colorPreference", selectedColor.id);
                        showStatus("Paleta aplicada");
                      }}
                      className="h-8 flex-1 rounded-[6px] border border-white/12 transition hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-accent/30"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </AssistantPanel>

              <AssistantPanel title="Hooks recomendados" icon={<Zap className="h-4 w-4" strokeWidth={1.8} />}>
                <div className="space-y-1">
                  {HOOKS.map((hook) => (
                    <button
                      type="button"
                      key={hook}
                      onClick={() => {
                        updateConfig("impactText", hook.slice(0, 40));
                        showStatus("Hook aplicado");
                      }}
                      className="flex w-full items-center gap-2 rounded-[7px] py-2 text-left text-[12px] text-ink-2 transition hover:bg-hover hover:text-ink"
                    >
                      <Zap className="h-3.5 w-3.5 shrink-0 text-accent" fill="currentColor" strokeWidth={1.8} />
                      {hook}
                    </button>
                  ))}
                </div>
              </AssistantPanel>

              <AssistantPanel title="Buenas prácticas" icon={<Info className="h-4 w-4" strokeWidth={1.8} />}>
                <ul className="space-y-2">
                  {["Usa 3–6 palabras máximo", "Alto contraste de color", "Rostro + emoción = más clics", "Texto legible en móvil"].map((tip) => (
                    <li key={tip} className="flex items-center gap-2 text-[12px] text-ink-2">
                      <Check className="h-3.5 w-3.5 shrink-0 rounded-full text-ok" strokeWidth={2.3} />
                      {tip}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex items-start gap-2 text-[11px] leading-4 text-ink-3">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>Consejos basados en análisis de miles de miniaturas exitosas.</span>
                </div>
              </AssistantPanel>
            </div>
          </Card>
        </div>
      </div>

      {fullscreenOpen && selectedUrl ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/82 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <button
            type="button"
            onClick={() => setFullscreenOpen(false)}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-[9px] border border-white/15 bg-white/10 text-white transition hover:bg-white/15"
            aria-label="Cerrar pantalla completa"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative aspect-video w-full max-w-6xl overflow-hidden rounded-[14px] border border-white/15 bg-card">
            <Image src={selectedUrl} alt="Miniatura en pantalla completa" fill className="object-contain" unoptimized />
          </div>
        </div>
      ) : null}

      {historyOpen ? (
        <div className="fixed inset-0 z-[70] flex justify-end bg-black/55 backdrop-blur-sm" role="dialog" aria-modal="true">
          <button type="button" aria-label="Cerrar historial" className="absolute inset-0 cursor-default" onClick={() => setHistoryOpen(false)} />
          <aside className="relative h-full w-full max-w-[380px] border-l border-line bg-card p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-ink">Historial</h2>
              <button
                type="button"
                onClick={() => setHistoryOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-[8px] border border-line text-ink-2 transition hover:bg-hover hover:text-ink"
                aria-label="Cerrar historial"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {result?.urls?.length ? (
                result.urls.map((url, index) => (
                  <button
                    type="button"
                    key={url}
                    onClick={() => {
                      setSelectedIndex(index);
                      setHistoryOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-[10px] border border-line bg-card-hi/45 p-2 text-left transition hover:border-line-hi hover:bg-hover"
                  >
                    <span className="relative aspect-video w-20 shrink-0 overflow-hidden rounded-[7px] border border-line">
                      <Image src={url} alt={`Historial ${index + 1}`} fill className="object-cover" unoptimized />
                    </span>
                    <span>
                      <span className="block text-[13px] font-semibold text-ink">Miniatura generada v{index + 1}</span>
                      <span className="mt-1 block text-[12px] text-ink-3">Sesión actual</span>
                    </span>
                  </button>
                ))
              ) : (
                <div className="rounded-[10px] border border-line bg-card-hi/45 p-4 text-[13px] leading-5 text-ink-2">
                  Aún no hay miniaturas generadas en esta sesión.
                </div>
              )}
            </div>
          </aside>
        </div>
      ) : null}
    </main>
  );
}
