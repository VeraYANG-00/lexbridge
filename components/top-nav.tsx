"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useJurisdiction, type Jurisdiction } from "@/lib/jurisdiction";

const JURISDICTIONS: { code: Jurisdiction; label: string }[] = [
  { code: "US", label: "美国" },
  { code: "UK", label: "英国" },
];

const SCENES = [
  { label: "出海", href: "/", isActive: (p: string) => p === "/" },
  {
    label: "劳动",
    href: "/risks?scene=labor",
    isActive: (p: string) => p.startsWith("/risks"),
  },
  {
    label: "合规",
    href: "/regulations",
    isActive: (p: string) => p.startsWith("/regulations"),
  },
];

export default function TopNav({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { jurisdiction, setJurisdiction } = useJurisdiction();
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function handleSceneClick(href: string) {
    const current =
      typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : pathname;
    if (href !== current) {
      router.push(href);
    }
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="打开导航菜单"
          className="flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 hover:text-primary lg:hidden"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        </button>
        <span className="flex items-baseline gap-2">
          <span className="text-lg font-semibold tracking-wide text-primary">LexBridge</span>
          <span className="hidden text-xs text-gray-400 sm:inline">出海判例智搜平台</span>
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <span className="hidden text-xs text-gray-400 md:inline">法域</span>
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            className="flex items-center gap-1.5 rounded-md border border-gray-300 px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:border-primary hover:text-primary"
          >
            {jurisdiction}
            <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m6 8 4 4 4-4" />
            </svg>
          </button>
          {menuOpen && (
            <div
              role="listbox"
              className="absolute right-0 top-full mt-1 w-32 overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg"
            >
              {JURISDICTIONS.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  role="option"
                  aria-selected={item.code === jurisdiction}
                  onClick={() => {
                    setJurisdiction(item.code);
                    setMenuOpen(false);
                  }}
                  className={
                    "block w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 " +
                    (item.code === jurisdiction ? "font-medium text-primary" : "text-gray-700")
                  }
                >
                  {item.code} · {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="flex items-center gap-1">
          {SCENES.map((scene) => {
            const active = scene.isActive(pathname);
            return (
              <button
                key={scene.label}
                type="button"
                onClick={() => handleSceneClick(scene.href)}
                aria-current={active ? "page" : undefined}
                className={
                  "rounded-full px-2.5 py-1 text-xs transition-colors sm:px-3 " +
                  (active
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-primary")
                }
              >
                {scene.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}