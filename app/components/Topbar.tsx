"use client";

import { useState } from "react";
import { Bell, Search } from "lucide-react";

export function Header() {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="h-[86px] flex-shrink-0 border-b border-white/[0.06] bg-[#0a0a0d]/95">
      <div className="flex h-full items-center justify-between pl-9 pr-[42px] md:pl-[38px]">
        <p className="text-[20px] font-semibold leading-none tracking-[-0.01em] text-[#F5F2F4]">
          Open Studio
        </p>

        <div className="flex items-center gap-[35px]">
          <div
            className={`
              hidden h-[42px] w-[310px] items-center gap-[10px] rounded-[9px] border px-[13px] md:flex
              bg-[#0D0F16] transition-all duration-200 ease-out
              ${
                searchFocused
                  ? "border-[rgba(208,111,167,0.34)] shadow-[0_0_24px_rgba(208,111,167,0.09)]"
                  : "border-white/[0.08] hover:border-white/[0.13]"
              }
            `}
          >
            <Search className="h-[17px] w-[17px] flex-shrink-0 text-[#7F8594]" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Buscar..."
              className="min-w-0 flex-1 bg-transparent text-[13px] text-[#F5F2F4] outline-none placeholder:text-[#777C89]"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <kbd className="rounded-[6px] border border-white/[0.08] bg-white/[0.035] px-[7px] py-[3px] text-[11px] font-medium leading-none text-[#787E8B]">
              ⌘ K
            </kbd>
          </div>

          <button
            className="relative flex h-10 w-10 items-center justify-center rounded-[10px] text-[#9AA0AD] transition-colors duration-200 ease-out hover:bg-white/[0.04] hover:text-[#F5F2F4]"
            aria-label="Notificaciones"
          >
            <Bell className="h-[21px] w-[21px]" strokeWidth={1.45} />
            <span className="absolute right-[9px] top-[7px] h-[8px] w-[8px] rounded-full bg-accent shadow-[0_0_14px_rgba(208,111,167,0.54)]" />
          </button>
        </div>
      </div>
    </header>
  );
}

export const Topbar = Header;
