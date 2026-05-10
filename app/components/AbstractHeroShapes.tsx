import type { CSSProperties } from "react";

const stripeTexture: CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(90deg, rgba(255,255,255,0.045) 0, rgba(255,255,255,0.045) 1px, transparent 1px, transparent 5px)",
};

function Arch({
  className,
  style,
}: {
  className: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`absolute overflow-hidden rounded-t-full border-t border-x border-white/[0.09] ${className}`}
      style={{
        ...style,
        WebkitMaskImage: "linear-gradient(to bottom, black 30%, transparent 100%)",
        maskImage: "linear-gradient(to bottom, black 30%, transparent 100%)",
      }}
    >
      <div className="absolute inset-0 opacity-55" style={stripeTexture} />
      <div className="absolute inset-x-0 top-0 h-[42%] bg-[radial-gradient(ellipse_at_50%_0%,rgba(208,111,167,0.38)_0%,rgba(155,108,255,0.15)_42%,transparent_75%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0)_44%,rgba(0,0,0,0.26))]" />
    </div>
  );
}

export function AbstractHeroShapes() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-[-180px] top-[20px] hidden h-[330px] w-[710px] overflow-visible lg:block"
    >
      <div className="absolute left-[292px] top-[-44px] h-[286px] w-[312px] rounded-full bg-[radial-gradient(circle,rgba(208,111,167,0.22)_0%,rgba(155,108,255,0.11)_32%,transparent_68%)] blur-[38px]" />
      <div className="absolute left-[500px] top-[40px] h-[186px] w-[122px] rounded-full bg-[rgba(208,111,167,0.10)] blur-[36px]" />

      <Arch
        className="left-[54px] top-[112px] h-[257px] w-[207px] opacity-[0.52]"
        style={{
          background:
            "linear-gradient(180deg, rgba(18,20,29,0.82) 0%, rgba(10,12,18,0.66) 100%)",
        }}
      />

      <Arch
        className="left-[258px] top-[58px] h-[305px] w-[253px] opacity-[0.72]"
        style={{
          background:
            "radial-gradient(circle at 31% 12%, rgba(208,111,167,0.19), transparent 26%), linear-gradient(180deg, rgba(30,20,35,0.82) 0%, rgba(13,15,23,0.72) 100%)",
        }}
      />

      <Arch
        className="left-[378px] top-[25px] h-[337px] w-[241px] opacity-[0.86] shadow-[inset_0_1px_0_rgba(255,255,255,0.11),0_0_70px_rgba(208,111,167,0.12)]"
        style={{
          background:
            "radial-gradient(circle at 38% 9%, rgba(208,111,167,0.38), rgba(155,108,255,0.18) 35%, transparent 58%), linear-gradient(180deg, rgba(42,25,50,0.86) 0%, rgba(16,17,27,0.74) 100%)",
        }}
      />

      <Arch
        className="left-[617px] top-[174px] h-[186px] w-[116px] opacity-[0.55]"
        style={{
          background:
            "linear-gradient(180deg, rgba(23,22,35,0.76) 0%, rgba(10,12,18,0.72) 100%)",
        }}
      />
    </div>
  );
}
