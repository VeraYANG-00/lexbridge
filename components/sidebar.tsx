"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "首页", href: "/" },
  { label: "AI问答", href: "/qa" },
  { label: "判例检索", href: "/cases" },
  { label: "法规库", href: "/regulations" },
  { label: "风险场景", href: "/risks" },
  { label: "报告中心", href: "/reports" },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-3">
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={
              "flex items-center rounded-md px-3 py-2 text-sm transition-colors " +
              (active
                ? "bg-primary/5 font-medium text-primary"
                : "text-gray-600 hover:bg-gray-100 hover:text-primary")
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <aside className="fixed bottom-0 left-0 top-14 z-30 hidden w-56 border-r border-gray-200 bg-white lg:block">
        <NavList />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-gray-900/40" onClick={onClose} aria-hidden="true" />
          <aside className="absolute bottom-0 left-0 top-0 w-64 bg-white shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4">
              <span className="text-base font-semibold text-primary">出海法务助手</span>
              <button
                type="button"
                onClick={onClose}
                aria-label="关闭导航菜单"
                className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              >
                <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" d="M5 5l10 10M15 5L5 15" />
                </svg>
              </button>
            </div>
            <div className="h-[calc(100%-3.5rem)] overflow-y-auto">
              <NavList onNavigate={onClose} />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}