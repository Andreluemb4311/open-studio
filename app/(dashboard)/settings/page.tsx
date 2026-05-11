"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AudioLines,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  Globe2,
  Image as ImageIcon,
  KeyRound,
  Loader2,
  Lock,
  Save,
  ShieldCheck,
  Sparkles,
  Type,
  Video,
  Wifi,
  XCircle,
} from "lucide-react";
import type { ProviderCapability, ProviderManifest, ProviderStoredConfig } from "@/lib/providers/types";

type SafeProviderConfig = Omit<ProviderStoredConfig, "apiKey"> & {
  apiKey: string;
  hasApiKey?: boolean;
};

interface AppSettings {
  providers: Record<string, SafeProviderConfig>;
  defaults: Record<ProviderCapability, { providerId: string; model: string }>;
  demoMode: boolean;
  debugMode: boolean;
  exportDirectory: string;
  language: "en" | "pt" | "es";
  updatedAt: string;
}

interface ProviderResponseItem extends ProviderManifest {
  enabled: boolean;
  hasApiKey: boolean;
  configuredModels: Partial<Record<ProviderCapability, string>>;
}

type TestResult = { ok: boolean; models: string[]; error?: string };

const capabilityCards: Array<{
  id: ProviderCapability;
  title: string;
  icon: typeof Type;
}> = [
  { id: "text", title: "Texto", icon: Type },
  { id: "image", title: "Imagen", icon: ImageIcon },
  { id: "audio", title: "Audio", icon: AudioLines },
  { id: "video", title: "Video", icon: Video },
];

const preferredProviders = ["minimax", "openai-compatible"];

const providerText: Record<string, { description: string; badge?: string }> = {
  minimax: {
    description: "Integración nativa de MiniMax para texto, imagen, audio y video.",
    badge: "key saved",
  },
  "openai-compatible": {
    description: "Compatible con la API de OpenAI y muchos hubs de API.",
  },
};

const modelOptions: Partial<Record<string, Partial<Record<ProviderCapability, string[]>>>> = {
  minimax: {
    text: ["MiniMax-M2.7", "MiniMax-M2.7-highspeed"],
    image: ["image-01"],
    audio: ["music-2.6"],
    video: [""],
  },
  "openai-compatible": {
    text: ["gpt-4o-mini", "gpt-4.1-mini"],
    image: ["dall-e-3", "gpt-image-1"],
  },
};

const emptySettings = (): AppSettings => ({
  providers: {},
  defaults: {
    text: { providerId: "minimax", model: "MiniMax-M2.7" },
    image: { providerId: "minimax", model: "image-01" },
    audio: { providerId: "minimax", model: "music-2.6" },
    video: { providerId: "minimax", model: "" },
  },
  demoMode: false,
  debugMode: false,
  exportDirectory: "",
  language: "es",
  updatedAt: "",
});

const fieldBase =
  "h-11 w-full rounded-[10px] border border-line bg-card-hi px-3 text-[13px] text-ink outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-accent/10 disabled:cursor-not-allowed disabled:opacity-55";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getProviderDescription(provider: ProviderResponseItem) {
  return providerText[provider.id]?.description ?? provider.description;
}

function getModelOptions(provider: ProviderResponseItem | undefined, capability: ProviderCapability, current?: string) {
  const configured = provider?.configuredModels?.[capability];
  const fallback = provider?.defaultModels?.[capability] ?? "";
  const options = modelOptions[provider?.id ?? ""]?.[capability] ?? [];
  return Array.from(new Set([current, configured, ...options, fallback].filter((value): value is string => Boolean(value))));
}

function SelectField({
  value,
  onChange,
  children,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className={cx(fieldBase, "appearance-none pr-9")}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
    </div>
  );
}

function Toggle({ enabled, onClick, label }: { enabled: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={enabled}
      onClick={onClick}
      className={cx(
        "relative h-7 w-12 rounded-full border transition duration-200",
        enabled ? "border-accent/30 bg-accent" : "border-line bg-line-hi",
      )}
    >
      <span
        className={cx(
          "absolute top-1 grid h-5 w-5 place-items-center rounded-full bg-ink shadow-sm transition-all duration-200",
          enabled ? "left-6" : "left-1",
        )}
      />
    </button>
  );
}

function DefaultCard({
  capability,
  settings,
  providers,
  onDefaultChange,
}: {
  capability: (typeof capabilityCards)[number];
  settings: AppSettings;
  providers: ProviderResponseItem[];
  onDefaultChange: (capability: ProviderCapability, providerId: string, model?: string) => void;
}) {
  const Icon = capability.icon;
  const selected = settings.defaults[capability.id];
  const eligibleProviders = providers.filter((provider) => provider.capabilities.includes(capability.id));
  const selectedProvider = providers.find((provider) => provider.id === selected.providerId) ?? eligibleProviders[0];
  const models = getModelOptions(selectedProvider, capability.id, selected.model);
  const isVideoUnconfigured = capability.id === "video" && !selected.model;

  return (
    <section className="rounded-[12px] border border-line bg-card-hi p-4 shadow-[0_12px_34px_rgba(0,0,0,0.16)]">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-[9px] border border-line bg-white/[0.025] text-accent">
          <Icon className="h-4 w-4" strokeWidth={1.7} />
        </span>
        <h3 className="text-[16px] font-semibold text-ink">{capability.title}</h3>
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-medium text-ink-2">Proveedor</span>
          <SelectField value={selected.providerId} onChange={(providerId) => onDefaultChange(capability.id, providerId)}>
            {eligibleProviders.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </SelectField>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[11px] font-medium text-ink-2">Modelo</span>
          {models.length && !isVideoUnconfigured ? (
            <SelectField
              value={selected.model}
              onChange={(model) => onDefaultChange(capability.id, selected.providerId, model)}
            >
              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </SelectField>
          ) : (
            <input className={fieldBase} value="Aún no configurado" disabled readOnly />
          )}
        </label>
      </div>
    </section>
  );
}

function ProviderCard({
  provider,
  config,
  testResult,
  showKey,
  testing,
  saving,
  onToggle,
  onProviderChange,
  onShowKey,
  onSave,
  onTest,
}: {
  provider: ProviderResponseItem;
  config: SafeProviderConfig;
  testResult?: TestResult;
  showKey: boolean;
  testing: boolean;
  saving: boolean;
  onToggle: () => void;
  onProviderChange: (partial: Partial<SafeProviderConfig>) => void;
  onShowKey: () => void;
  onSave: () => void;
  onTest: () => void;
}) {
  const hasKey = Boolean(config?.hasApiKey) || Boolean(config?.apiKey?.trim());
  const isMiniMax = provider.id === "minimax";
  const Icon = isMiniMax ? AudioLines : Globe2;
  const textModel = config?.models?.text ?? provider.defaultModels.text ?? "";
  const imageModel = config?.models?.image ?? provider.defaultModels.image ?? "";

  return (
    <section
      className={cx(
        "rounded-[16px] border bg-card p-6 shadow-[0_18px_48px_rgba(0,0,0,0.18)]",
        config.enabled && isMiniMax ? "border-accent/32" : "border-line",
      )}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="mt-0.5 grid h-10 w-10 place-items-center rounded-[10px] border border-line bg-white/[0.025] text-accent">
            <Icon className="h-5 w-5" strokeWidth={1.7} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[16px] font-semibold text-ink">{provider.name}</h3>
              {hasKey ? (
                <span className="inline-flex items-center gap-1 rounded-[7px] border border-ok/15 bg-ok-soft px-2 py-0.5 text-[10px] font-medium text-ok">
                  <CheckCircle2 className="h-3 w-3" />
                  key saved
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-2">{getProviderDescription(provider)}</p>
          </div>
        </div>

        <Toggle enabled={Boolean(config.enabled)} onClick={onToggle} label={`Activar ${provider.name}`} />
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium text-ink-2">Clave de API</span>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
            <input
              type={showKey ? "text" : "password"}
              value={config.apiKey ?? ""}
              onChange={(event) => onProviderChange({ apiKey: event.target.value })}
              placeholder={hasKey ? "••••••••••••••••••••••••••••••••" : "Añade una clave de API para activar este proveedor."}
              autoComplete="off"
              className={cx(fieldBase, "pl-10 pr-24")}
            />
            <button
              type="button"
              onClick={onShowKey}
              className="absolute right-2 top-1/2 inline-flex h-8 -translate-y-1/2 items-center gap-1 rounded-[8px] border border-line px-3 text-[12px] text-ink-2 transition hover:bg-hover hover:text-ink"
            >
              {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {showKey ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium text-ink-2">URL Base</span>
          <div className="relative">
            <Globe2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
            <input
              value={config.baseUrl ?? provider.defaultBaseUrl}
              onChange={(event) => onProviderChange({ baseUrl: event.target.value })}
              className={cx(fieldBase, "pl-10")}
            />
          </div>
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-ink-2">Modelo por defecto (Texto)</span>
            <SelectField
              value={textModel}
              onChange={(model) => onProviderChange({ models: { text: model } })}
              disabled={!provider.capabilities.includes("text")}
            >
              {getModelOptions(provider, "text", textModel).map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </SelectField>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-ink-2">Modelo por defecto (Imagen)</span>
            <SelectField
              value={imageModel}
              onChange={(model) => onProviderChange({ models: { image: model } })}
              disabled={!provider.capabilities.includes("image")}
            >
              {getModelOptions(provider, "image", imageModel).map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </SelectField>
          </label>
        </div>

        {provider.id === "openai-compatible" ? (
          <p className="rounded-[10px] border border-line bg-white/[0.02] px-3 py-2 text-[11px] leading-relaxed text-ink-3">
            Provider preparado para endpoints OpenAI compatibles. Texto e imagen pueden funcionar cuando la URL base,
            clave y modelo correspondan al hub configurado.
          </p>
        ) : null}

        {testResult ? (
          <div
            className={cx(
              "rounded-[10px] border px-3 py-2 text-[12px]",
              testResult.ok ? "border-ok/20 bg-ok-soft text-ok" : "border-danger/20 bg-danger-soft text-danger",
            )}
          >
            <div className="flex items-center gap-2">
              {testResult.ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <span>{testResult.ok ? "Conexión realizada correctamente." : "No se pudo conectar con este proveedor. Revisa tu clave o URL base."}</span>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onTest}
            disabled={testing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-line bg-white/[0.025] px-4 text-[13px] font-medium text-ink-2 transition hover:border-line-hi hover:bg-hover hover:text-ink disabled:opacity-50"
          >
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wifi className="h-4 w-4" />}
            Probar conexión
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] btn-brand px-5 text-[13px] font-semibold disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar cambios
          </button>
        </div>
      </div>
    </section>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(() => emptySettings());
  const [providers, setProviders] = useState<ProviderResponseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});

  const providerMap = useMemo(() => new Map(providers.map((provider) => [provider.id, provider])), [providers]);
  const visibleProviders = useMemo(
    () => providers.filter((provider) => preferredProviders.includes(provider.id)),
    [providers],
  );

  async function loadData() {
    try {
      const [settingsRes, providersRes] = await Promise.all([fetch("/api/settings"), fetch("/api/providers")]);
      const [settingsData, providersData] = await Promise.all([settingsRes.json(), providersRes.json()]);

      if (providersData.ok) setProviders(providersData.providers);
      if (settingsData.ok) {
        const nextSettings = settingsData.settings as AppSettings;
        const providersWithEditableKeys = Object.fromEntries(
          Object.entries(nextSettings.providers).map(([providerId, config]) => [providerId, { ...config, apiKey: "" }]),
        );
        setSettings({ ...nextSettings, providers: providersWithEditableKeys });
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  function updateProvider(providerId: string, partial: Partial<SafeProviderConfig>) {
    setStatus("");
    setSettings((current) => ({
      ...current,
      providers: {
        ...current.providers,
        [providerId]: {
          ...current.providers[providerId],
          ...partial,
          models: {
            ...current.providers[providerId]?.models,
            ...partial.models,
          },
          extra: {
            ...current.providers[providerId]?.extra,
            ...partial.extra,
          },
        },
      },
    }));
  }

  function updateDefault(capability: ProviderCapability, providerId: string, model?: string) {
    setStatus("");
    const manifest = providerMap.get(providerId);
    const configuredModel =
      model ??
      settings.providers[providerId]?.models?.[capability] ??
      manifest?.defaultModels[capability] ??
      "";

    setSettings((current) => ({
      ...current,
      defaults: {
        ...current.defaults,
        [capability]: { providerId, model: configuredModel },
      },
    }));
  }

  async function handleSave(message = true) {
    setSaving(true);
    setStatus("");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to save settings");
      if (message) setStatus("Cambios guardados localmente.");
      await loadData();
      return true;
    } catch {
      setStatus("No se pudieron guardar los cambios. Revisa los campos obligatorios.");
      return false;
    } finally {
      setSaving(false);
      if (message) setTimeout(() => setStatus(""), 3500);
    }
  }

  async function testProvider(providerId: string) {
    const providerConfig = settings.providers[providerId];
    const hasKey = Boolean(providerConfig?.hasApiKey) || Boolean(providerConfig?.apiKey?.trim());

    if (!hasKey) {
      setTestResults((current) => ({
        ...current,
        [providerId]: { ok: false, models: [], error: "Añade una clave de API para activar este proveedor." },
      }));
      return;
    }

    setTesting((current) => ({ ...current, [providerId]: true }));
    const saved = await handleSave(false);

    if (!saved) {
      setTesting((current) => ({ ...current, [providerId]: false }));
      return;
    }

    try {
      const res = await fetch(`/api/providers/${providerId}/test`);
      const data = await res.json();
      setTestResults((current) => ({ ...current, [providerId]: data }));
    } catch {
      setTestResults((current) => ({
        ...current,
        [providerId]: { ok: false, models: [], error: "Connection failed" },
      }));
    } finally {
      setTesting((current) => ({ ...current, [providerId]: false }));
    }
  }

  if (loading) {
    return (
      <main className="relative flex flex-1 items-center justify-center overflow-y-auto">
        <Loader2 className="h-6 w-6 animate-spin text-ink-2" />
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden">
      <div className="mx-auto flex w-full max-w-[1480px] flex-col px-6 py-8 lg:px-10 xl:px-12">
        <header className="mb-6">
          <h1 className="text-[30px] font-semibold tracking-[-0.01em] text-ink">Configuración</h1>
          <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-ink-2">
            Configura aquí tus proveedores. Tus claves de API se guardan solo en tu máquina local.
          </p>
        </header>

        <section className="mb-5 flex items-start gap-4 rounded-[15px] border border-accent/28 bg-accent/[0.055] p-5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] border border-accent/20 bg-accent/8 text-accent">
            <ShieldCheck className="h-6 w-6" strokeWidth={1.7} />
          </span>
          <div>
            <h2 className="text-[15px] font-semibold text-ink">Aviso de seguridad</h2>
            <p className="mt-1 max-w-5xl text-[13px] leading-relaxed text-ink-2">
              Tus claves de API se almacenan solo localmente y se envían únicamente a los proveedores que configures.
              Nunca hagas commit de tu archivo .env.local.
            </p>
          </div>
        </section>

        {status ? (
          <div
            className={cx(
              "mb-5 rounded-[12px] border px-4 py-3 text-[13px]",
              status.includes("guardados") ? "border-ok/20 bg-ok-soft text-ok" : "border-danger/20 bg-danger-soft text-danger",
            )}
          >
            {status}
          </div>
        ) : null}

        <section className="mb-5 rounded-[16px] border border-line bg-card p-5 shadow-[0_18px_48px_rgba(0,0,0,0.16)]">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" strokeWidth={1.7} />
            <h2 className="text-[16px] font-semibold text-ink">Predeterminados de generación</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {capabilityCards.map((capability) => (
              <DefaultCard
                key={capability.id}
                capability={capability}
                settings={settings}
                providers={providers}
                onDefaultChange={updateDefault}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-[17px] font-semibold text-ink">Proveedores</h2>
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {visibleProviders.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                config={settings.providers[provider.id]}
                showKey={Boolean(showKeys[provider.id])}
                testResult={testResults[provider.id]}
                testing={Boolean(testing[provider.id])}
                saving={saving}
                onToggle={() => updateProvider(provider.id, { enabled: !settings.providers[provider.id]?.enabled })}
                onProviderChange={(partial) => updateProvider(provider.id, partial)}
                onShowKey={() => setShowKeys((current) => ({ ...current, [provider.id]: !current[provider.id] }))}
                onSave={() => void handleSave()}
                onTest={() => void testProvider(provider.id)}
              />
            ))}
          </div>
        </section>

        <footer className="mt-8 flex items-center justify-center gap-2 text-center text-[13px] text-ink-3">
          <Lock className="h-4 w-4" strokeWidth={1.7} />
          <span>Todas las claves se guardan solo en tu máquina local y nunca se sincronizan en la nube.</span>
        </footer>
      </div>
    </main>
  );
}
