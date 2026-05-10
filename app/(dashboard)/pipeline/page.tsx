import {
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  FileText,
  Info,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TextCursorInput,
  UsersRound,
  WandSparkles,
} from "lucide-react";
import type { ReactNode } from "react";

const steps = [
  "Idea",
  "Guion",
  "Miniatura",
  "Leyenda",
  "Descripción",
  "Hashtags",
  "Assets",
  "Exportación",
];

const variables = [
  {
    icon: TextCursorInput,
    label: "Tema del video",
    value: "Lanzamiento de Open Studio",
  },
  {
    icon: UsersRound,
    label: "Audiencia objetivo",
    value: "Creadores de contenido",
  },
  {
    icon: SlidersHorizontal,
    label: "Tono de voz",
    value: "Profesional, inspirador",
  },
  {
    icon: Clock3,
    label: "Duración estimada",
    value: "60–90 segundos",
  },
];

const versionHistory = [
  { label: "Versión 3", time: "Hace 2 min", current: true },
  { label: "Versión 2", time: "Hace 1 h" },
  { label: "Versión 1", time: "Ayer, 18:42" },
];

const activity = [
  { label: "Guion generado", time: "Hace 2 min" },
  { label: "Variables actualizadas", time: "Hace 15 min" },
  { label: "Referencias agregadas", time: "Hace 1 h" },
];

function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[14px] border border-white/[0.075] bg-[#10131d]/82 shadow-[0_24px_90px_rgba(0,0,0,0.22)] backdrop-blur ${className}`}
    >
      {children}
    </section>
  );
}

function PanelHeader({
  title,
  action,
}: {
  title: string;
  action?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-[15px] font-semibold leading-none text-[#f4f5f7]">
        {title}
      </h2>
      {action ? (
        <button className="text-[12px] font-medium text-[#c8cbd5] transition hover:text-white">
          {action}
        </button>
      ) : null}
    </div>
  );
}

function Topbar() {
  return (
    <header className="flex h-auto min-h-[64px] shrink-0 flex-col items-stretch gap-3 border-b border-white/[0.07] px-4 py-3 md:h-[64px] md:flex-row md:items-center md:justify-between md:gap-0 md:px-9 md:py-0 xl:px-10">
      <div className="flex min-w-0 items-center gap-3 pl-12 md:gap-5 md:pl-0">
        <h1 className="text-[23px] font-bold tracking-[-0.02em] text-white">
          Pipeline
        </h1>
        <ChevronRight
          className="hidden h-4 w-4 text-[#6f7586] sm:block"
          strokeWidth={1.7}
        />
        <button className="hidden min-w-0 items-center gap-1.5 text-[15px] text-[#b5bac7] sm:flex">
          <span className="truncate">Video Lanzamiento Open Studio</span>
          <ChevronDown className="h-3.5 w-3.5 text-[#8a90a0]" />
        </button>
        <span className="hidden h-2.5 w-2.5 rounded-full bg-[#8b5cf6] shadow-[0_0_18px_rgba(139,92,246,0.8)] sm:block" />
      </div>

      <div className="flex items-center justify-end gap-2 md:gap-5">
        <div className="hidden items-center gap-2 text-[13px] text-[#a7adba] lg:flex">
          <CheckCircle2 className="h-4 w-4" strokeWidth={1.8} />
          <span>Guardado hace 2 min</span>
        </div>
        <button className="hidden h-10 items-center gap-2 rounded-[8px] border border-white/[0.08] bg-white/[0.025] px-5 text-[14px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-white/[0.16] hover:bg-white/[0.05] sm:flex">
          <ShieldCheck className="h-4 w-4 text-[#d9dbe3]" strokeWidth={1.7} />
          Vista previa
        </button>
        <button className="flex h-10 items-center gap-2 rounded-[8px] bg-[linear-gradient(135deg,#ff63bd_0%,#f83fa6_58%,#e93697_100%)] px-5 text-[14px] font-semibold text-white shadow-[0_0_26px_rgba(248,63,166,0.24)] transition hover:brightness-110 md:px-7">
          Continuar
          <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
        </button>
        <button
          className="relative grid h-9 w-9 place-items-center rounded-full text-[#b8becb] transition hover:bg-white/[0.05] hover:text-white"
          aria-label="Notificaciones"
        >
          <Bell className="h-5 w-5" strokeWidth={1.55} />
          <span className="absolute right-2 top-1 h-2.5 w-2.5 rounded-full bg-[#ff3daa] ring-2 ring-[#080a12]" />
        </button>
      </div>
    </header>
  );
}

function PipelineSteps() {
  return (
    <aside className="relative h-full border-r border-white/[0.075] px-11 py-12">
      <ol className="space-y-8">
        {steps.map((step, index) => {
          const isDone = index === 0;
          const isActive = index === 1;

          return (
            <li key={step} className="relative flex items-center gap-4">
              {index < steps.length - 1 ? (
                <span className="absolute left-[16px] top-[36px] h-[30px] border-l border-dashed border-[#34394a]" />
              ) : null}
              <span
                className={[
                  "relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[14px] font-medium",
                  isDone
                    ? "border-[#ff63bd] bg-[linear-gradient(135deg,#ff63bd,#f83fa6)] text-white shadow-[0_0_22px_rgba(255,61,170,0.38)]"
                    : isActive
                      ? "border-[#ff3daa] bg-[#111522] text-[#ff63bd]"
                      : "border-[#2a3040] bg-[#111522] text-[#8e96a7]",
                ].join(" ")}
              >
                {index + 1}
              </span>
              <span
                className={[
                  "text-[15px] font-medium",
                  isActive
                    ? "text-[#ff63bd]"
                    : isDone
                      ? "text-[#abb1bf]"
                      : "text-[#8d94a3]",
                ].join(" ")}
              >
                {step}
              </span>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

function InstructionsCard() {
  const chips = [
    { label: "Tema del video", icon: TextCursorInput },
    { label: "Audiencia objetivo", icon: UsersRound },
    { label: "Tono de voz", icon: SlidersHorizontal },
    { label: "Duración estimada", icon: Clock3 },
  ];

  return (
    <Panel className="mt-6 px-6 py-5">
      <div className="relative min-h-[185px]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <label
            htmlFor="script-instructions"
            className="text-[14px] font-medium text-[#eef0f5]"
          >
            Instrucciones
          </label>
          <Sparkles
            className="mt-1 h-5 w-5 text-[#ff63bd]"
            strokeWidth={1.7}
          />
        </div>
        <textarea
          id="script-instructions"
          maxLength={2000}
          placeholder="Describe el tema, el enfoque, el tono y los puntos clave que debe cubrir el guion..."
          className="h-[118px] w-full resize-none bg-transparent text-[14px] leading-6 text-white placeholder:text-[#7a8191] focus-visible:outline-none"
        />
        <p className="text-[14px] text-[#aab0bd]">0 / 2000</p>
      </div>

      <div className="mt-4 border-t border-white/[0.06] pt-5">
        <div className="mb-4 flex items-center gap-1.5 text-[14px] font-medium text-[#c8ccd6]">
          Contexto y variables
          <Info className="h-3.5 w-3.5 text-[#8990a1]" strokeWidth={1.8} />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {chips.map((chip) => {
            const Icon = chip.icon;
            return (
              <button
                key={chip.label}
                className="flex h-9 items-center gap-2 rounded-[7px] border border-white/[0.07] bg-white/[0.035] px-3.5 text-[13px] text-[#c3c8d3] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition hover:border-white/[0.14] hover:text-white"
              >
                <Icon className="h-4 w-4" strokeWidth={1.55} />
                {chip.label}
              </button>
            );
          })}
          <button className="flex h-9 items-center gap-2 rounded-[7px] border border-dashed border-white/[0.14] bg-transparent px-3.5 text-[13px] text-[#a8aebb] transition hover:border-[#ff63bd]/55 hover:text-[#ffb0dc]">
            <Plus className="h-4 w-4" strokeWidth={1.6} />
            Variable
          </button>

          <button className="ml-auto flex h-10 min-w-[196px] items-center justify-center gap-2 rounded-[8px] bg-[linear-gradient(135deg,#ff63bd_0%,#f83fa6_58%,#e93697_100%)] px-8 text-[14px] font-semibold text-white shadow-[0_0_28px_rgba(255,61,170,0.26)] transition hover:brightness-110">
            <WandSparkles className="h-4 w-4" strokeWidth={1.7} />
            Generar
          </button>
        </div>
      </div>
    </Panel>
  );
}

function ResultCard() {
  return (
    <section className="mt-7">
      <div className="mb-3 flex items-center gap-3">
        <Sparkles className="h-5 w-5 text-[#ff63bd]" strokeWidth={1.7} />
        <h2 className="text-[16px] font-semibold text-[#f4f5f7]">Resultado</h2>
      </div>

      <Panel className="relative grid min-h-[220px] place-items-center overflow-hidden">
        <div className="absolute inset-x-[10%] bottom-[-72px] h-[210px] rounded-[999px] bg-[radial-gradient(circle,rgba(255,61,170,0.24)_0%,rgba(139,92,246,0.13)_35%,transparent_72%)] blur-2xl" />
        <div className="relative flex flex-col items-center text-center">
          <div className="relative mb-5 text-[#8f96a8]">
            <FileText className="h-14 w-14" strokeWidth={1.35} />
            <Sparkles
              className="absolute -right-2 bottom-1 h-5 w-5 text-[#a4aabd]"
              strokeWidth={1.55}
            />
          </div>
          <p className="text-[14px] font-medium text-[#e2e4ea]">
            Tu guion generado aparecerá aquí.
          </p>
          <p className="mt-2 text-[13px] text-[#8f95a4]">
            Completa las instrucciones y presiona Generar.
          </p>
        </div>
      </Panel>
    </section>
  );
}

function VariablesCard() {
  return (
    <Panel className="p-5">
      <PanelHeader title="Variables" action="Ver todas" />
      <div className="space-y-5">
        {variables.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex gap-4">
              <Icon
                className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#aeb4c2]"
                strokeWidth={1.55}
              />
              <div>
                <p className="text-[13px] font-medium leading-none text-[#c8ccd6]">
                  {item.label}
                </p>
                <p className="mt-2 text-[13px] leading-none text-[#9ca3af]">
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function BrandVoiceCard() {
  return (
    <Panel className="p-5">
      <PanelHeader title="Voz de marca" action="Editar" />
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/[0.09] bg-[#171a25] text-[17px] font-bold text-[#ff4fad] shadow-[0_0_22px_rgba(255,61,170,0.12)]">
          OS
        </div>
        <div>
          <p className="text-[14px] font-semibold leading-none text-white">
            Open Studio
          </p>
          <p className="mt-3 max-w-[260px] text-[13px] leading-5 text-[#a2a8b5]">
            Profesional, cercana y creativa.
            <br />
            Enfocada en empoderar a creadores.
          </p>
        </div>
      </div>
    </Panel>
  );
}

function ReferencesCard() {
  return (
    <Panel className="p-5">
      <PanelHeader title="Referencias" />
      <button className="grid min-h-[70px] w-full place-items-center rounded-[8px] border border-dashed border-white/[0.14] bg-white/[0.015] text-center transition hover:border-[#ff63bd]/45 hover:bg-[#ff3daa]/[0.04]">
        <div>
          <div className="mb-2 flex items-center justify-center gap-2 text-[13px] font-medium text-[#c9ced8]">
            <Sparkles className="h-4 w-4" strokeWidth={1.45} />
            Agregar referencia
          </div>
          <p className="text-[12px] text-[#8f95a4]">
            Arrastra archivos o pega enlaces aquí.
          </p>
        </div>
      </button>
    </Panel>
  );
}

function VersionHistoryCard() {
  return (
    <Panel className="p-5">
      <PanelHeader title="Historial de versiones" action="Ver todas" />
      <div className="space-y-4">
        {versionHistory.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-[#d7dae2]">{item.label}</span>
              {item.current ? (
                <span className="rounded-[5px] bg-[#8b5cf6]/20 px-2 py-0.5 text-[11px] font-semibold text-[#c8a8ff]">
                  Actual
                </span>
              ) : null}
            </div>
            <span className="text-[13px] text-[#9aa1ae]">{item.time}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ActivityCard() {
  return (
    <Panel className="p-5">
      <PanelHeader title="Actividad" action="Ver toda" />
      <div className="space-y-4">
        {activity.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-[13px] text-[#d7dae2]">{item.label}</span>
            <span className="text-[13px] text-[#9aa1ae]">{item.time}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export default function PipelinePage() {
  return (
    <div className="relative flex h-full min-h-0 flex-1 overflow-hidden bg-[#080a12] text-[#f4f5f7]">
      <div className="pointer-events-none absolute left-[24%] top-[-220px] h-[520px] w-[760px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.11)_0%,rgba(248,63,166,0.055)_32%,transparent_66%)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-330px] left-[38%] h-[560px] w-[760px] rounded-full bg-[radial-gradient(circle,rgba(255,61,170,0.16)_0%,rgba(139,92,246,0.09)_34%,transparent_68%)] blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.012),transparent_32%)]" />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <Topbar />

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto xl:grid-cols-[300px_minmax(580px,1fr)_454px] xl:overflow-hidden">
          <PipelineSteps />

          <main className="min-h-0 min-w-0 overflow-hidden px-8 py-8 xl:px-14">
            <div className="mx-auto max-w-[980px]">
              <h2 className="text-[28px] font-bold tracking-[-0.025em] text-white">
                Guion
              </h2>
              <p className="mt-3 text-[15px] leading-6 text-[#a1a7b3]">
                Escribe las instrucciones para generar el guion de tu video.
              </p>

              <InstructionsCard />
              <ResultCard />
            </div>
          </main>

          <aside className="min-w-0 space-y-3.5 px-5 pb-8 xl:overflow-y-auto xl:px-2 xl:py-7">
            <VariablesCard />
            <BrandVoiceCard />
            <ReferencesCard />
            <VersionHistoryCard />
            <ActivityCard />
          </aside>
        </div>
      </div>
    </div>
  );
}
