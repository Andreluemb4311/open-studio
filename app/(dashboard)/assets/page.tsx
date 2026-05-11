"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import Image from "next/image";
import {
  Archive,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  FileText,
  FolderPlus,
  Grid2X2,
  Image as ImageIcon,
  LayoutList,
  Loader2,
  MoreHorizontal,
  Music2,
  Package,
  Pin,
  Play,
  Search,
  Sparkles,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import type { AssetRecord } from "@/lib/minimax/types";

type AssetTypeFilter = AssetRecord["type"] | "all";
type DateRange = "7" | "30" | "90" | "year" | "all";
type SortKey = "recent" | "oldest" | "name" | "type" | "size";
type ViewMode = "grid" | "list";

const PAGE_SIZE = 12;

const typeMeta: Record<AssetTypeFilter, { label: string; icon: typeof Archive; accent: string }> = {
  all: { label: "Todos", icon: Archive, accent: "var(--mm-accent)" },
  script: { label: "Guion", icon: FileText, accent: "#7EA7FF" },
  thumbnail: { label: "Miniatura", icon: ImageIcon, accent: "var(--mm-accent)" },
  music: { label: "Música", icon: Music2, accent: "#B78CFF" },
  video: { label: "Video", icon: Video, accent: "#F87171" },
  export: { label: "Exportación", icon: Package, accent: "#34D399" },
  prompt: { label: "Prompt", icon: Sparkles, accent: "#FBBF24" },
};

const dateRangeLabels: Record<DateRange, string> = {
  "7": "Últimos 7 días",
  "30": "Últimos 30 días",
  "90": "Últimos 90 días",
  year: "Este año",
  all: "Todo el tiempo",
};

const sortLabels: Record<SortKey, string> = {
  recent: "Más recientes",
  oldest: "Más antiguos",
  name: "Nombre",
  type: "Tipo",
  size: "Tamaño",
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatRelativeDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Editado recientemente";
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 60) return "Editado hace menos de 1 hora";
  if (hours < 24) return `Editado hace ${hours} ${hours === 1 ? "hora" : "horas"}`;
  if (days === 1) return "Editado ayer";
  return `Editado hace ${days} días`;
}

function estimateSize(asset: AssetRecord) {
  const raw =
    asset.content ||
    asset.description ||
    asset.filePath ||
    asset.thumbnailPath ||
    JSON.stringify(asset.metadata ?? {});
  const bytes = new Blob([raw]).size;
  if (bytes < 1024) return `${Math.max(bytes, 1)} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function assetFormat(asset: AssetRecord) {
  if (asset.type === "thumbnail") return "PNG · 16:9";
  if (asset.type === "music") return "MP3 · 03:45";
  if (asset.type === "video") return "MP4 · 3840×2160";
  if (asset.type === "export") return "MP4 · 1080×1920";
  return estimateSize(asset);
}

function displayTitle(asset: AssetRecord) {
  const prefix = typeMeta[asset.type].label;
  const clean = asset.title.replace(/^Thumbnail - /i, "").replace(/^Script - /i, "").trim();
  if (clean.length <= 58) return `${prefix} – ${clean || asset.title}`;
  return `${prefix} – ${clean.slice(0, 58).trim()}...`;
}

function getAssetTags(asset: AssetRecord) {
  const tags = asset.tags?.filter(Boolean) ?? [];
  if (tags.length) return tags.slice(0, 3);
  if (asset.type === "thumbnail") return ["Miniatura", "YouTube"];
  if (asset.type === "script") return ["Guion", "Script"];
  if (asset.type === "music") return ["Música"];
  if (asset.type === "video" || asset.type === "export") return ["Video"];
  return ["Prompt"];
}

function getThumbnailCandidates(asset: AssetRecord) {
  const urls = Array.isArray(asset.metadata?.urls)
    ? asset.metadata.urls.filter((url): url is string => typeof url === "string" && url.length > 0)
    : [];
  const remoteUrls = Array.isArray(asset.metadata?.remoteUrls)
    ? asset.metadata.remoteUrls.filter((url): url is string => typeof url === "string" && url.length > 0)
    : [];
  const candidates = [asset.thumbnailPath, ...urls, ...remoteUrls].filter((url): url is string => Boolean(url));
  return Array.from(new Set(candidates));
}

function IconButton({
  active,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cx(
        "grid h-9 w-9 place-items-center rounded-[8px] border transition duration-200",
        active
          ? "border-accent/35 bg-accent-soft text-accent"
          : "border-line bg-white/[0.025] text-ink-2 hover:border-line-hi hover:bg-hover hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function PlaceholderPreview({ asset }: { asset: AssetRecord }) {
  const meta = typeMeta[asset.type];
  const Icon = meta.icon;

  if (asset.type === "thumbnail") {
    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(208,111,167,0.30),transparent_40%),linear-gradient(135deg,#21111d,#351425_48%,#151116)]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),transparent_58%)]" />
        <div className="absolute left-[16%] top-[20%] h-[62%] w-[48%] rounded-[10px] border border-accent/18 bg-white/[0.035] shadow-[0_18px_50px_rgba(0,0,0,0.22)]" />
        <div className="absolute left-[22%] top-[32%] h-1.5 w-[34%] rounded-full bg-accent/28" />
        <div className="absolute left-[22%] top-[42%] h-1.5 w-[26%] rounded-full bg-white/12" />
        <div className="absolute left-[22%] top-[52%] h-1.5 w-[30%] rounded-full bg-white/10" />
        <span className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-[8px] border border-accent/20 bg-black/25 text-accent">
          <ImageIcon className="h-4 w-4" strokeWidth={1.7} />
        </span>
        <div className="grid h-14 w-14 place-items-center rounded-[14px] border border-accent/20 bg-accent/10 text-accent shadow-[0_18px_42px_rgba(208,111,167,0.12)]">
          <ImageIcon className="h-7 w-7" strokeWidth={1.5} />
        </div>
      </div>
    );
  }

  if (asset.type === "music") {
    const bars = [34, 48, 26, 66, 40, 72, 38, 58, 46, 82, 44, 62, 36, 54, 76, 42, 68, 50, 32, 60, 44, 72, 36, 52];
    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(208,111,167,0.22),transparent_34%),linear-gradient(135deg,#14111f,#24133a_55%,#151516)]">
        <span className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-[8px] border border-white/10 bg-black/25 text-accent">
          <Music2 className="h-4 w-4" strokeWidth={1.7} />
        </span>
        <div className="flex h-20 w-[86%] items-center gap-1">
          {bars.map((height, index) => (
            <span
              key={index}
              className="w-full rounded-full bg-[linear-gradient(180deg,var(--mm-accent-hi),#9B6CFF)] opacity-80"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <span className="absolute right-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/14 text-white backdrop-blur-sm">
          <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
        </span>
      </div>
    );
  }

  if (asset.type === "video" || asset.type === "export") {
    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#111827,#1f2937_46%,#0a0a0d)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(208,111,167,0.18),transparent_28%),linear-gradient(180deg,transparent_0%,rgba(10,10,13,0.74)_100%)]" />
        <div className="absolute bottom-[26%] left-0 right-0 h-[1px] bg-white/10" />
        <div className="absolute bottom-[24%] left-[8%] h-[18%] w-[34%] skew-x-[-18deg] rounded-t-[8px] bg-white/8" />
        <div className="absolute bottom-[24%] right-[9%] h-[26%] w-[28%] skew-x-[16deg] rounded-t-[8px] bg-white/10" />
        <span className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-[8px] border border-white/10 bg-black/25 text-ink">
          <Video className="h-4 w-4" strokeWidth={1.7} />
        </span>
        <span className="grid h-11 w-11 place-items-center rounded-full bg-white/14 text-white backdrop-blur-sm">
          <Play className="ml-0.5 h-5 w-5" fill="currentColor" />
        </span>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(126,167,255,0.18),transparent_40%),linear-gradient(135deg,#101827,#11131C)]">
      <div className="absolute left-[16%] top-[20%] h-[62%] w-[48%] rounded-[10px] border border-white/8 bg-white/[0.035] shadow-[0_18px_50px_rgba(0,0,0,0.22)]" />
      <div className="absolute left-[22%] top-[32%] h-1.5 w-[34%] rounded-full bg-white/12" />
      <div className="absolute left-[22%] top-[42%] h-1.5 w-[26%] rounded-full bg-white/10" />
      <div className="absolute left-[22%] top-[52%] h-1.5 w-[30%] rounded-full bg-white/10" />
      <span className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-[8px] border border-white/10 bg-black/20" style={{ color: meta.accent }}>
        <Icon className="h-4 w-4" strokeWidth={1.7} />
      </span>
      <div className="grid h-14 w-14 place-items-center rounded-[14px] border border-white/10 bg-white/[0.035]" style={{ color: meta.accent }}>
        <Icon className="h-7 w-7" strokeWidth={1.5} />
      </div>
    </div>
  );
}

function RemotePreview({ asset, compact }: { asset: AssetRecord; compact: boolean }) {
  const candidates = getThumbnailCandidates(asset);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const meta = typeMeta[asset.type];
  const Icon = meta.icon;
  const src = candidates[candidateIndex];

  if (!src) return <PlaceholderPreview asset={asset} />;

  return (
    <div className="relative h-full w-full overflow-hidden bg-card-hi">
      <Image
        src={src}
        alt={asset.title}
        fill
        className="object-cover"
        sizes={compact ? "160px" : "(max-width: 768px) 100vw, 33vw"}
        unoptimized
        onError={() => {
          setCandidateIndex((current) => {
            const next = current + 1;
            return next < candidates.length ? next : -1;
          });
        }}
      />
      <span className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-[8px] border border-white/15 bg-black/45 text-white backdrop-blur-sm">
        <Icon className="h-4 w-4" strokeWidth={1.7} />
      </span>
    </div>
  );
}

function Preview({ asset, compact = false }: { asset: AssetRecord; compact?: boolean }) {
  if (getThumbnailCandidates(asset).length > 0) return <RemotePreview asset={asset} compact={compact} />;
  return <PlaceholderPreview asset={asset} />;
}

function FileTag({ label, highlighted }: { label: string; highlighted?: boolean }) {
  return (
    <span
      className={cx(
        "rounded-[8px] border px-2.5 py-1 text-[11px] leading-none transition",
        highlighted
          ? "border-accent/20 bg-accent/8 text-accent"
          : "border-line bg-white/[0.025] text-ink-2 group-hover:border-line-hi group-hover:text-ink",
      )}
    >
      {label}
    </span>
  );
}

function AssetMenu({
  asset,
  onOpen,
  onRename,
  onDuplicate,
  onDownload,
  onPin,
  onDelete,
}: {
  asset: AssetRecord;
  onOpen: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onDownload: () => void;
  onPin: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const itemClass = "block w-full rounded-[7px] px-3 py-2 text-left text-[12px] text-ink-2 transition hover:bg-hover hover:text-ink";

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Acciones para ${asset.title}`}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        className="grid h-8 w-8 place-items-center rounded-[8px] text-ink-3 transition hover:bg-hover hover:text-ink"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open ? (
        <div
          className="absolute bottom-9 right-0 z-30 w-44 rounded-[10px] border border-line bg-card p-1 shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <button className={itemClass} type="button" onClick={onOpen}>Abrir</button>
          <button className={itemClass} type="button" onClick={onRename}>Renombrar</button>
          <button className={itemClass} type="button" onClick={onDuplicate}>Duplicar</button>
          <button className={itemClass} type="button" onClick={onDownload}>Descargar</button>
          <button className={itemClass} type="button" onClick={() => alert("Mover a carpeta estará disponible cuando exista persistencia de carpetas.")}>Mover a carpeta</button>
          <button className={itemClass} type="button" onClick={onPin}>{asset.favorite ? "Desfijar" : "Fijar"}</button>
          <button className="block w-full rounded-[7px] px-3 py-2 text-left text-[12px] text-danger transition hover:bg-danger-soft" type="button" onClick={onDelete}>Eliminar</button>
        </div>
      ) : null}
    </div>
  );
}

function AssetCard({
  asset,
  onOpen,
  onRename,
  onDuplicate,
  onDownload,
  onPin,
  onDelete,
}: {
  asset: AssetRecord;
  onOpen: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onDownload: () => void;
  onPin: () => void;
  onDelete: () => void;
}) {
  const meta = typeMeta[asset.type];
  const tags = getAssetTags(asset);
  const isThumbnail = asset.type === "thumbnail";

  return (
    <article
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      className={cx(
        "group cursor-pointer overflow-hidden rounded-[15px] border bg-card shadow-[0_10px_34px_rgba(0,0,0,0.18)] outline-none transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_20px_52px_rgba(0,0,0,0.28)] focus-visible:ring-2 focus-visible:ring-accent/35",
        isThumbnail ? "border-accent/18 hover:border-accent/36" : "border-line hover:border-line-hi",
      )}
    >
      <div
        className={cx(
          "h-[166px] overflow-hidden border-b",
          isThumbnail ? "border-accent/12" : "border-line",
        )}
      >
        <Preview asset={asset} />
      </div>
      <div className="p-5">
        <h3 className="line-clamp-2 min-h-[40px] text-[15px] font-semibold leading-snug text-ink">{displayTitle(asset)}</h3>
        <p className="mt-1 text-[12px] text-ink-2">
          {meta.label} · {assetFormat(asset)}
        </p>
        <div className="mt-6 flex items-center justify-between gap-3">
          <span className="text-[12px] text-ink-3">{formatRelativeDate(asset.updatedAt)}</span>
          <AssetMenu
            asset={asset}
            onOpen={onOpen}
            onRename={onRename}
            onDuplicate={onDuplicate}
            onDownload={onDownload}
            onPin={onPin}
            onDelete={onDelete}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <FileTag key={tag} label={tag} highlighted={isThumbnail && tag.toLowerCase().includes("miniatura")} />
          ))}
        </div>
      </div>
    </article>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <button type="button" aria-label="Cerrar" className="absolute inset-0 cursor-default" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-[14px] border border-line bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-[16px] font-semibold text-ink">{title}</h2>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-[8px] text-ink-2 transition hover:bg-hover hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AssetsPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<AssetTypeFilter>("all");
  const [dateRange, setDateRange] = useState<DateRange>("30");
  const [tagSearch, setTagSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState<AssetRecord | null>(null);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderError, setFolderError] = useState("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [now] = useState(() => Date.now());

  async function loadAssets(showSpinner = true) {
    if (showSpinner) setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/assets");
      const data = await response.json();
      if (!data.ok) throw new Error(data.error || "Failed to load assets");
      setAssets(data.assets);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los archivos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAssets(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function showMessage(value: string) {
    setMessage(value);
    window.setTimeout(() => setMessage(""), 2400);
  }

  const counts = useMemo(() => {
    const next: Record<AssetTypeFilter, number> = {
      all: assets.length,
      script: 0,
      thumbnail: 0,
      music: 0,
      video: 0,
      export: 0,
      prompt: 0,
    };
    assets.forEach((asset) => {
      next[asset.type] += 1;
    });
    return next;
  }, [assets]);

  const tagCounts = useMemo(() => {
    const map = new Map<string, number>();
    assets.forEach((asset) => {
      getAssetTags(asset).forEach((tag) => map.set(tag, (map.get(tag) ?? 0) + 1));
    });
    return Array.from(map.entries())
      .filter(([tag]) => tag.toLowerCase().includes(tagSearch.toLowerCase()))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [assets, tagSearch]);

  const filteredAssets = useMemo(() => {
    const lowerSearch = search.trim().toLowerCase();
    const filtered = assets.filter((asset) => {
      if (selectedType !== "all" && asset.type !== selectedType) return false;
      if (selectedTag && !getAssetTags(asset).some((tag) => tag.toLowerCase() === selectedTag.toLowerCase())) return false;
      if (dateRange !== "all") {
        const updated = new Date(asset.updatedAt).getTime();
        if (!Number.isNaN(updated)) {
          const maxDays = dateRange === "year" ? 366 : Number(dateRange);
          if ((now - updated) / 86400000 > maxDays) return false;
        }
      }
      if (lowerSearch) {
        const haystack = [asset.title, asset.description, asset.type, ...(asset.tags ?? [])].join(" ").toLowerCase();
        if (!haystack.includes(lowerSearch)) return false;
      }
      return true;
    });

    return filtered.sort((a, b) => {
      if (sort === "oldest") return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      if (sort === "name") return a.title.localeCompare(b.title);
      if (sort === "type") return a.type.localeCompare(b.type);
      if (sort === "size") return estimateSize(a).localeCompare(estimateSize(b));
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [assets, dateRange, now, search, selectedTag, selectedType, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / PAGE_SIZE));
  const activePage = Math.min(page, totalPages);
  const visibleAssets = filteredAssets.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);
  const featuredAsset = assets.find((asset) => asset.favorite) ?? assets[0] ?? null;
  const from = filteredAssets.length ? (activePage - 1) * PAGE_SIZE + 1 : 0;
  const to = Math.min(activePage * PAGE_SIZE, filteredAssets.length);

  function clearFilters() {
    setSearch("");
    setSelectedType("all");
    setDateRange("30");
    setTagSearch("");
    setSelectedTag("");
    setSort("recent");
    setPage(1);
  }

  async function updateAsset(id: string, partial: Partial<AssetRecord>) {
    const response = await fetch(`/api/assets/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partial),
    });
    const data = await response.json();
    if (!data.ok) throw new Error(data.error || "Update failed");
    setAssets((current) => current.map((asset) => (asset.id === id ? data.asset : asset)));
    if (selectedAsset?.id === id) setSelectedAsset(data.asset);
    return data.asset as AssetRecord;
  }

  async function handlePin(asset: AssetRecord) {
    try {
      await updateAsset(asset.id, { favorite: !asset.favorite });
      showMessage(asset.favorite ? "Archivo desfijado" : "Archivo fijado");
    } catch {
      showMessage("No se pudo actualizar el archivo");
    }
  }

  async function handleRename(asset: AssetRecord) {
    const next = window.prompt("Nuevo nombre", asset.title);
    if (!next?.trim()) return;
    try {
      await updateAsset(asset.id, { title: next.trim() });
      showMessage("Archivo renombrado");
    } catch {
      showMessage("No se pudo renombrar");
    }
  }

  async function handleDuplicate(asset: AssetRecord) {
    try {
      const response = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: asset.type,
          title: `${asset.title} copia`,
          description: asset.description,
          content: asset.content,
          filePath: asset.filePath,
          thumbnailPath: asset.thumbnailPath,
          metadata: asset.metadata,
          sourceModule: asset.sourceModule,
          tags: asset.tags,
          favorite: false,
        }),
      });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error);
      setAssets((current) => [data.asset, ...current]);
      showMessage("Archivo duplicado");
    } catch {
      showMessage("No se pudo duplicar");
    }
  }

  async function handleDelete(asset: AssetRecord) {
    if (!window.confirm("¿Eliminar este archivo?")) return;
    try {
      const response = await fetch(`/api/assets/${asset.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error);
      setAssets((current) => current.filter((item) => item.id !== asset.id));
      if (selectedAsset?.id === asset.id) setSelectedAsset(null);
      showMessage("Archivo eliminado");
    } catch {
      showMessage("No se pudo eliminar");
    }
  }

  function handleDownload(asset: AssetRecord) {
    const directUrl = asset.filePath?.startsWith("http") ? asset.filePath : asset.thumbnailPath;
    if (directUrl) {
      window.open(directUrl, "_blank");
      return;
    }
    if (asset.content) {
      const blob = new Blob([asset.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${asset.title}.${asset.type === "script" ? "md" : "txt"}`;
      link.click();
      URL.revokeObjectURL(url);
      return;
    }
    showMessage("Este archivo no tiene descarga directa todavía");
  }

  function createFolder() {
    if (!folderName.trim()) {
      setFolderError("Escribe un nombre de carpeta.");
      return;
    }
    setFolderModalOpen(false);
    setFolderName("");
    setFolderError("");
    showMessage("Carpeta preparada. La persistencia de carpetas aún no está conectada.");
  }

  async function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const isText = file.type.startsWith("text/") || /\.(md|txt|json|csv)$/i.test(file.name);
      const assetType: AssetRecord["type"] = file.type.startsWith("image/")
        ? "thumbnail"
        : file.type.startsWith("audio/")
          ? "music"
          : file.type.startsWith("video/")
            ? "video"
            : isText
              ? "prompt"
              : "export";
      const content = isText ? await file.text() : undefined;

      const response = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: assetType,
          title: file.name,
          description: isText
            ? content?.slice(0, 500) || "Archivo de texto subido"
            : "Archivo registrado desde el selector. El almacenamiento binario persistente aún no está conectado.",
          content,
          metadata: {
            originalName: file.name,
            mimeType: file.type || "unknown",
            size: file.size,
            uploadMode: isText ? "persisted-text-content" : "registered-metadata-only",
          },
          sourceModule: "assets-upload",
          tags: ["Upload"],
        }),
      });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error || "Upload failed");
      setAssets((current) => [data.asset, ...current]);
      setUploadModalOpen(false);
      showMessage(isText ? "Archivo subido" : "Archivo registrado. Binarios completos quedan pendientes de backend.");
    } catch (uploadError) {
      setUploadError(uploadError instanceof Error ? uploadError.message : "No se pudo subir el archivo.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  const typeOrder: AssetTypeFilter[] = ["all", "script", "thumbnail", "music", "video", "export", "prompt"];

  return (
    <main className="flex min-h-0 flex-1 overflow-hidden bg-canvas text-ink">
      <aside className="hidden w-[270px] shrink-0 border-r border-line bg-canvas px-6 py-7 lg:block">
        <div className="mb-7 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-ink">Filtros</h2>
          <button type="button" onClick={clearFilters} className="text-[12px] font-semibold text-accent transition hover:text-accent-hi">
            Limpiar
          </button>
        </div>

        <section>
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3">TIPO DE CONTENIDO</h3>
          <div className="space-y-1">
            {typeOrder.map((type) => {
              const meta = typeMeta[type];
              const Icon = meta.icon;
              const active = selectedType === type;
              return (
                <button
                  type="button"
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={cx(
                    "flex h-10 w-full items-center gap-3 rounded-[8px] px-3 text-[13px] font-medium transition duration-200",
                    active ? "bg-accent-soft text-accent" : "text-ink-2 hover:bg-hover hover:text-ink",
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.7} />
                  <span className="flex-1 text-left">{meta.label}</span>
                  <span className={active ? "text-accent" : "text-ink-3"}>{counts[type]}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-7 border-t border-line pt-6">
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3">RANGO DE FECHAS</h3>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-2" strokeWidth={1.7} />
            <select
              value={dateRange}
              onChange={(event) => setDateRange(event.target.value as DateRange)}
              className="h-10 w-full appearance-none rounded-[8px] border border-line bg-card px-9 text-[13px] font-medium text-ink transition hover:border-line-hi focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/15"
            >
              {Object.entries(dateRangeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
          </div>
        </section>

        <section className="mt-7 border-t border-line pt-6">
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3">ETIQUETAS</h3>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3" />
            <input
              value={tagSearch}
              onChange={(event) => setTagSearch(event.target.value)}
              placeholder="Buscar etiquetas..."
              className="h-10 w-full rounded-[8px] border border-line bg-card pl-9 pr-3 text-[13px] text-ink placeholder:text-ink-3 transition hover:border-line-hi focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/15"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {tagCounts.map(([tag, count]) => (
              <button
                type="button"
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
                className={cx(
                  "inline-flex items-center gap-2 rounded-[7px] border px-2.5 py-1.5 text-[12px] transition",
                  selectedTag === tag
                    ? "border-accent/35 bg-accent-soft text-accent"
                    : "border-line bg-white/[0.025] text-ink-2 hover:border-line-hi hover:text-ink",
                )}
              >
                {tag}
                <span className="text-[11px] text-ink-3">{count}</span>
              </button>
            ))}
          </div>
          <button type="button" className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-2 transition hover:text-accent">
            Ver todas las etiquetas <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </section>
      </aside>

      <section className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-7">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <label className="relative block min-w-0 xl:w-[640px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-2" strokeWidth={1.7} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar archivos..."
                className="h-11 w-full rounded-[9px] border border-line bg-card px-11 pr-16 text-[14px] text-ink placeholder:text-ink-2 transition hover:border-line-hi focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/15"
              />
              <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-[6px] border border-line bg-card-hi px-1.5 py-0.5 text-[11px] text-ink-2">
                ⌘ K
              </kbd>
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => setFolderModalOpen(true)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[9px] border border-line bg-white/[0.025] px-4 text-[13px] font-semibold text-ink-2 transition hover:border-line-hi hover:bg-hover hover:text-ink"
              >
                <FolderPlus className="h-4 w-4" />
                Nueva carpeta
              </button>
              <button
                type="button"
                onClick={() => setUploadModalOpen(true)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[9px] bg-accent px-4 text-[13px] font-semibold text-accent-fg shadow-[0_12px_34px_rgba(208,111,167,0.18)] transition hover:bg-accent-hi"
              >
                <Upload className="h-4 w-4" />
                Subir archivo
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-[28px] font-bold tracking-[-0.035em] text-ink">Archivos</h1>
              <p className="mt-2 text-[14px] text-ink-2">Todo tu contenido generado en un solo lugar.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex rounded-[9px] border border-line bg-card p-1">
                <IconButton active={viewMode === "grid"} label="Vista grid" onClick={() => setViewMode("grid")}>
                  <Grid2X2 className="h-4 w-4" />
                </IconButton>
                <IconButton active={viewMode === "list"} label="Vista lista" onClick={() => setViewMode("list")}>
                  <LayoutList className="h-4 w-4" />
                </IconButton>
              </div>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as SortKey)}
                  className="h-10 appearance-none rounded-[9px] border border-line bg-card px-4 pr-9 text-[13px] font-semibold text-ink-2 transition hover:border-line-hi focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/15"
                >
                  {Object.entries(sortLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
              </div>
            </div>
          </div>

          {(message || error) && (
            <div className={cx("flex items-center gap-2 rounded-[10px] border px-4 py-3 text-[13px]", error ? "border-danger/25 bg-danger-soft text-danger" : "border-ok/20 bg-ok-soft text-ok")}>
              {error ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
              {error || message}
            </div>
          )}

          {featuredAsset ? (
            <button
              type="button"
              onClick={() => setSelectedAsset(featuredAsset)}
              className="group rounded-[13px] border border-line bg-card p-4 text-left transition hover:border-line-hi"
            >
              <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.05em] text-accent">
                <Sparkles className="h-4 w-4" />
                DESTACADO
              </div>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="h-[78px] w-full overflow-hidden rounded-[9px] border border-line bg-card-hi sm:w-[144px]">
                    <Preview asset={featuredAsset} compact />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-[15px] font-semibold text-ink">{displayTitle(featuredAsset)}</h2>
                    <p className="mt-1 text-[13px] text-ink-2">
                      {typeMeta[featuredAsset.type].label} · {formatRelativeDate(featuredAsset.updatedAt)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {getAssetTags(featuredAsset).map((tag) => (
                        <span key={tag} className="rounded-[7px] border border-line bg-white/[0.035] px-2.5 py-1 text-[12px] text-ink-2">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[12px] font-semibold text-accent">
                  <Pin className="h-4 w-4" fill="currentColor" />
                  Fijado
                  <MoreHorizontal className="h-4 w-4 text-ink-3" />
                </div>
              </div>
            </button>
          ) : null}

          <div className="flex items-center justify-between">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-3">ARCHIVOS RECIENTES</h2>
            <button type="button" onClick={clearFilters} className="text-[12px] font-semibold text-ink-3 transition hover:text-accent lg:hidden">
              Filtros: {typeMeta[selectedType].label}
            </button>
          </div>

          {loading ? (
            <div className="grid min-h-[320px] place-items-center rounded-[13px] border border-line bg-card">
              <Loader2 className="h-7 w-7 animate-spin text-accent" />
            </div>
          ) : assets.length === 0 ? (
            <div className="grid min-h-[360px] place-items-center rounded-[13px] border border-line bg-card p-8 text-center">
              <div>
                <Archive className="mx-auto h-10 w-10 text-accent" />
                <h3 className="mt-4 text-[16px] font-semibold text-ink">Todavía no tienes archivos</h3>
                <p className="mt-2 max-w-[42ch] text-[13px] leading-5 text-ink-2">Genera contenido o sube un archivo para empezar a organizar tu estudio.</p>
                <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
                  <button type="button" onClick={() => setUploadModalOpen(true)} className="h-10 rounded-[9px] bg-accent px-4 text-[13px] font-semibold text-accent-fg">Subir archivo</button>
                  <button type="button" onClick={() => setFolderModalOpen(true)} className="h-10 rounded-[9px] border border-line px-4 text-[13px] font-semibold text-ink-2">Crear nuevo contenido</button>
                </div>
              </div>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="grid min-h-[320px] place-items-center rounded-[13px] border border-line bg-card p-8 text-center">
              <div>
                <Search className="mx-auto h-10 w-10 text-ink-3" />
                <h3 className="mt-4 text-[16px] font-semibold text-ink">No encontramos archivos con estos filtros</h3>
                <button type="button" onClick={clearFilters} className="mt-5 h-10 rounded-[9px] border border-accent/35 bg-accent-soft px-4 text-[13px] font-semibold text-accent">
                  Limpiar filtros
                </button>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleAssets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onOpen={() => setSelectedAsset(asset)}
                  onRename={() => handleRename(asset)}
                  onDuplicate={() => handleDuplicate(asset)}
                  onDownload={() => handleDownload(asset)}
                  onPin={() => handlePin(asset)}
                  onDelete={() => handleDelete(asset)}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-[13px] border border-line bg-card">
              <div className="grid grid-cols-[minmax(220px,1fr)_110px_160px_150px_90px_48px] border-b border-line px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-3">
                <span>Nome</span><span>Tipo</span><span>Etiquetas</span><span>Modificado</span><span>Tamaño</span><span>Ações</span>
              </div>
              {visibleAssets.map((asset) => (
                <button
                  type="button"
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className="grid w-full grid-cols-[minmax(220px,1fr)_110px_160px_150px_90px_48px] items-center border-b border-line px-4 py-3 text-left last:border-b-0 hover:bg-hover"
                >
                  <span className="truncate text-[13px] font-semibold text-ink">{displayTitle(asset)}</span>
                  <span className="text-[12px] text-ink-2">{typeMeta[asset.type].label}</span>
                  <span className="truncate text-[12px] text-ink-2">{getAssetTags(asset).join(", ")}</span>
                  <span className="text-[12px] text-ink-3">{formatRelativeDate(asset.updatedAt)}</span>
                  <span className="text-[12px] text-ink-3">{estimateSize(asset)}</span>
                  <span className="text-ink-3"><MoreHorizontal className="h-4 w-4" /></span>
                </button>
              ))}
            </div>
          )}

          <footer className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} className="grid h-9 w-9 place-items-center rounded-[8px] text-ink-2 hover:bg-hover">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {[1, 2, 3].filter((value) => value <= totalPages).map((value) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setPage(value)}
                  className={cx("grid h-9 w-9 place-items-center rounded-[8px] border text-[13px] font-semibold", activePage === value ? "border-accent/45 bg-accent-soft text-accent" : "border-transparent text-ink-2 hover:bg-hover")}
                >
                  {value}
                </button>
              ))}
              {totalPages > 4 ? <span className="px-2 text-ink-3">...</span> : null}
              {totalPages > 3 ? (
                <button type="button" onClick={() => setPage(totalPages)} className="grid h-9 w-9 place-items-center rounded-[8px] text-[13px] font-semibold text-ink-2 hover:bg-hover">
                  {totalPages}
                </button>
              ) : null}
              <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="grid h-9 w-9 place-items-center rounded-[8px] text-ink-2 hover:bg-hover">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[13px] text-ink-3">Mostrando {from}–{to} de {filteredAssets.length}</p>
          </footer>
        </div>
      </section>

      {folderModalOpen ? (
        <Modal title="Nueva carpeta" onClose={() => setFolderModalOpen(false)}>
          <div className="space-y-4 p-5">
            <label className="block">
              <span className="mb-2 block text-[12px] font-semibold text-ink-2">Nombre de la carpeta</span>
              <input value={folderName} onChange={(event) => setFolderName(event.target.value)} className="h-10 w-full rounded-[8px] border border-line bg-card-hi px-3 text-[13px] text-ink focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/15" />
            </label>
            {folderError ? <p className="text-[12px] text-danger">{folderError}</p> : <p className="text-[12px] leading-5 text-ink-3">La UI está lista. La persistencia de carpetas todavía no existe en el backend actual.</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setFolderModalOpen(false)} className="h-10 rounded-[8px] border border-line px-4 text-[13px] font-semibold text-ink-2">Cancelar</button>
              <button type="button" onClick={createFolder} className="h-10 rounded-[8px] bg-accent px-4 text-[13px] font-semibold text-accent-fg">Crear carpeta</button>
            </div>
          </div>
        </Modal>
      ) : null}

      {uploadModalOpen ? (
        <Modal title="Subir archivo" onClose={() => setUploadModalOpen(false)}>
          <div className="space-y-4 p-5">
            <div className="rounded-[12px] border border-dashed border-line bg-card-hi/50 p-6 text-center">
              <Upload className="mx-auto h-8 w-8 text-accent" />
              <p className="mt-3 text-[13px] font-semibold text-ink">Selecciona imagen, video, audio o documento</p>
              <p className="mt-2 text-[12px] leading-5 text-ink-3">Los archivos de texto se guardan con contenido. Binarios se registran con metadatos hasta conectar almacenamiento persistente.</p>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-4 h-10 rounded-[8px] bg-accent px-4 text-[13px] font-semibold text-accent-fg">
                Elegir archivo
              </button>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*,video/*,audio/*,.txt,.md,.json,.csv" onChange={handleFileUpload} />
            </div>
            {uploading ? <p className="flex items-center gap-2 text-[12px] text-ink-2"><Loader2 className="h-4 w-4 animate-spin" /> Subiendo...</p> : null}
            {uploadError ? <p className="text-[12px] text-danger">{uploadError}</p> : null}
          </div>
        </Modal>
      ) : null}

      {selectedAsset ? (
        <Modal title="Abrir archivo" onClose={() => setSelectedAsset(null)}>
          <div className="space-y-4 p-5">
            <div className="aspect-video overflow-hidden rounded-[10px] border border-line bg-card-hi">
              <Preview asset={selectedAsset} />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-ink">{displayTitle(selectedAsset)}</h3>
              <p className="mt-1 text-[13px] text-ink-2">{typeMeta[selectedAsset.type].label} · {assetFormat(selectedAsset)}</p>
              <p className="mt-3 max-h-32 overflow-y-auto text-[12px] leading-5 text-ink-3">{selectedAsset.description}</p>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => handlePin(selectedAsset)} className="h-10 rounded-[8px] border border-line px-4 text-[13px] font-semibold text-ink-2">{selectedAsset.favorite ? "Desfijar" : "Fijar"}</button>
              <button type="button" onClick={() => handleDuplicate(selectedAsset)} className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-line px-4 text-[13px] font-semibold text-ink-2"><Copy className="h-4 w-4" />Duplicar</button>
              <button type="button" onClick={() => handleDownload(selectedAsset)} className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-accent px-4 text-[13px] font-semibold text-accent-fg"><Download className="h-4 w-4" />Descargar</button>
              <button type="button" onClick={() => handleDelete(selectedAsset)} className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-danger/30 px-4 text-[13px] font-semibold text-danger"><Trash2 className="h-4 w-4" />Eliminar</button>
            </div>
          </div>
        </Modal>
      ) : null}
    </main>
  );
}
