"use client";

import { useEffect, useRef, useState } from "react";

const SCENES = ["出海", "劳动", "合规"];

const JURISDICTIONS = [
  { code: "US", label: "美国" },
  { code: "UK", label: "英国" },
];

export default function TopNav({ onMenuClick }: { onMenuClick: () => void }) {
  const [jurisdiction, setJurisdiction] = useState("US");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scene, setScene] = useState("出海");
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
        <span className="text-lg font-semibold tracking-wide text-primary">出海法务助手</span>
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
          {SCENES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setScene(item)}
              className={
                "rounded-full px-2.5 py-1 text-xs transition-colors sm:px-3 " +
                (item === scene
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-primary")
              }
            >
              {item}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}