"use client";

import { usePathname, useRouter } from "next/navigation";

const SCENES = [
  { label: "出海", href: "/qa?category=出海" },
  { label: "劳动", href: "/qa?category=劳动" },
  { label: "合规", href: "/qa?category=合规" },
];

export default function TopNav({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const pathname = usePathname();

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

      <nav className="flex items-center gap-1 sm:gap-2">
        {SCENES.map((scene) => (
          <button
            key={scene.label}
            type="button"
            onClick={() => handleSceneClick(scene.href)}
            className="rounded-full px-2.5 py-1 text-xs transition-colors text-gray-600 hover:bg-gray-100 hover:text-primary sm:px-3"
          >
            {scene.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
