"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import NextImage from "next/image";
import {
  Music,
  Box,
  FileText,
  Home,
  Image,
  Layers,
  Download,
  Menu,
  Settings,
  X,
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Inicio", href: "/" },
  { icon: Layers, label: "Pipeline", href: "/pipeline" },
  { icon: FileText, label: "Guiones", href: "/scripts" },
  { icon: Image, label: "Miniaturas", href: "/thumbnails" },
  { icon: Music, label: "Música", href: "/music" },
  { icon: Box, label: "Assets", href: "/assets" },
];

const bottomItems = [
  { icon: Download, label: "Descargas", href: "/exports" },
  { icon: Settings, label: "Ajustes", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  const sidebarContent = (
    <>
      <div className="flex items-center justify-center pb-[54px] pt-[34px]">
        <NextImage
          src="/logo.png"
          alt="Open Studio"
          width={36}
          height={36}
          priority
          className="h-9 w-9 rounded-[9px] object-cover"
        />
      </div>

      <nav className="flex-1 space-y-[21px] px-[11px]" aria-label="Navegação principal">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              title={item.label}
              onClick={() => setMobileOpen(false)}
              className={`
                group relative flex h-12 w-full items-center justify-center rounded-[7px]
                transition-all duration-200 ease-out
                ${
                  active
                    ? "bg-[#141620] text-accent"
                    : "text-[#8D91A0] opacity-90 hover:bg-white/[0.045] hover:text-[#F5F2F4] hover:opacity-100"
                }
              `}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-5 w-5" strokeWidth={1.5} />
              {active && (
                <span className="absolute left-0 top-1/2 h-[39px] w-px -translate-y-1/2 rounded-r-full bg-accent" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-[22px] px-[11px] pb-[24px]">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              title={item.label}
              onClick={() => setMobileOpen(false)}
              className={`
                relative flex h-10 w-full items-center justify-center rounded-[7px]
                transition-all duration-200 ease-out
                ${
                  active
                    ? "bg-[#141620] text-accent"
                    : "text-[#8D91A0] hover:bg-white/[0.045] hover:text-[#F5F2F4]"
                }
              `}
            >
              <Icon className="h-5 w-5" strokeWidth={1.5} />
              {active && (
                <span className="absolute left-0 top-1/2 h-[34px] w-px -translate-y-1/2 rounded-r-full bg-accent" />
              )}
            </Link>
          );
        })}

        <div className="flex h-[51px] w-full items-center justify-center pt-[7px]">
          <div className="flex h-[46px] w-[46px] items-center justify-center rounded-full border border-white/[0.08] bg-[#0E1018]">
            <NextImage
              src="/logo.png"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 rounded-full object-cover"
            />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <button
        className="fixed left-4 top-3.5 z-[60] flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-card md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? "Cerrar navegación" : "Abrir navegación"}
      >
        {mobileOpen ? (
          <X className="h-4 w-4 text-ink" />
        ) : (
          <Menu className="h-4 w-4 text-ink" />
        )}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-[56] flex h-screen w-[95px] flex-col
          border-r border-white/[0.06] bg-[#101012] transition-transform duration-300 ease-out
          md:sticky md:z-auto
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
