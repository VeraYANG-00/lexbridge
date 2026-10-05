"use client";

import { useEffect, useState } from "react";
import reportsData from "@/data/reports.json";

type ReportSection = { heading: string; body: string };
type Report = {
  id: string;
  title: string;
  summary: string;
  updatedAt: string;
  confidence: string;
  sources: string;
  sections: ReportSection[];
};
type HistoryEntry = { id: string; title: string; viewedAt: string };

const REPORTS = reportsData as Report[];
const FAVORITES_KEY = "legal-ai:favorite-reports";
const HISTORY_KEY = "legal-ai:report-history";
const HISTORY_LIMIT = 20;

type Tab = "all" | "favorites" | "history";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "全部报告" },
  { key: "favorites", label: "收藏" },
  { key: "history", label: "历史记录" },
];

function formatTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ReportsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [openReportId, setOpenReportId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setFavorites(JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]"));
        setHistory(JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]"));
      } catch {
        // 忽略损坏的 localStorage 数据
      }
      setHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  function persistFavorites(next: string[]) {
    setFavorites(next);
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    } catch {
      // 存储不可用时忽略
    }
  }

  function toggleFavorite(id: string) {
    persistFavorites(
      favorites.includes(id)
        ? favorites.filter((item) => item !== id)
        : [...favorites, id]
    );
  }

  function recordHistory(id: string) {
    const report = REPORTS.find((item) => item.id === id);
    if (!report) return;
    const entry: HistoryEntry = {
      id,
      title: report.title,
      viewedAt: new Date().toISOString(),
    };
    const next = [
      entry,
      ...history.filter((item) => item.id !== id),
    ].slice(0, HISTORY_LIMIT);
    setHistory(next);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {
      // 存储不可用时忽略
    }
  }

  function clearHistory() {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      // 存储不可用时忽略
    }
  }

  function openReport(id: string) {
    recordHistory(id);
    setOpenReportId(id);
  }

  const current = REPORTS.find((r) => r.id === openReportId) ?? null;

  if (current) {
    const isFavorite = favorites.includes(current.id);
    return (
      <div className="flex flex-col gap-5">
        <button
          type="button"
          onClick={() => setOpenReportId(null)}
          className="flex w-fit items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-primary"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="h-4 w-4"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l-5 5 5 5" />
          </svg>
          返回报告列表
        </button>

        <div className="flex items-center justify-between print:hidden">
          <button
            type="button"
            onClick={() => toggleFavorite(current.id)}
            className={
              "flex items-center gap-1.5 rounded-md border px-3.5 py-2 text-sm transition-colors " +
              (isFavorite
                ? "border-primary bg-primary/5 font-medium text-primary"
                : "border-gray-300 text-gray-600 hover:border-primary hover:text-primary")
            }
          >
            <svg
              viewBox="0 0 20 20"
              fill={isFavorite ? "currentColor" : "none"}
              className="h-4 w-4"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 2.5l2.35 4.76 5.25.76-3.8 3.7.9 5.24L10 14.53l-4.7 2.47.9-5.24-3.8-3.7 5.25-.76L10 2.5z"
              />
            </svg>
            {isFavorite ? "已收藏" : "收藏"}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-4 w-4"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 7V3.5h10V7M5 13H3.5V7h13v6H15m-10-3h10v6H5v-6z"
              />
            </svg>
            导出 PDF
          </button>
        </div>

        <article id="print-area" className="rounded-lg border border-gray-200 p-6">
          <h1 className="text-2xl font-semibold text-gray-900">{current.title}</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">{current.summary}</p>

          <div className="mt-6 flex flex-col gap-5">
            {current.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-base font-semibold text-gray-900">
                  {section.heading}
                </h2>
                <p className="mt-2 text-sm leading-7 text-gray-700">
                  {section.body}
                </p>
              </section>
            ))}
          </div>

          <footer className="mt-8 border-t border-gray-200 pt-4 text-xs leading-5 text-gray-400">
            <p>来源标注：{current.sources}</p>
            <p>更新时间：{current.updatedAt}</p>
            <p>置信度：{current.confidence}</p>
            <p className="mt-3 rounded-md bg-gray-50 px-3 py-2 text-gray-500">
              免责声明：本报告为 AI 生成的示例内容，仅供产品演示，不构成法律意见。
              具体法律决策请咨询执业律师。
            </p>
          </footer>
        </article>
      </div>
    );
  }

  const favoriteReports = REPORTS.filter((r) => favorites.includes(r.id));
  const historyReports = history
    .map((entry) => ({ entry, report: REPORTS.find((r) => r.id === entry.id) }))
    .filter((item): item is { entry: HistoryEntry; report: Report } =>
      Boolean(item.report)
    );

  function ReportCard({ report }: { report: Report }) {
    return (
      <button
        type="button"
        onClick={() => openReport(report.id)}
        className="group flex flex-col rounded-lg border border-gray-200 p-5 text-left transition-colors hover:border-primary"
      >
        <span className="flex items-center gap-2 text-base font-medium text-gray-900 transition-colors group-hover:text-primary">
          {favorites.includes(report.id) && (
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4 shrink-0 text-primary"
            >
              <path d="M10 2.5l2.35 4.76 5.25.76-3.8 3.7.9 5.24L10 14.53l-4.7 2.47.9-5.24-3.8-3.7 5.25-.76L10 2.5z" />
            </svg>
          )}
          {report.title}
        </span>
        <span className="mt-2 flex-1 line-clamp-2 text-xs leading-5 text-gray-500">
          {report.summary}
        </span>
        <span className="mt-4 text-xs text-gray-400">
          更新 {report.updatedAt} · 置信度 {report.confidence}
        </span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">报告中心</h1>
        <p className="mt-1 text-sm text-gray-500">
          查看、收藏与回溯风险评估报告（当前为示例数据）。
        </p>
      </div>

      <div className="flex items-center gap-1 border-b border-gray-200">
        {TABS.map((item) => {
          const active = tab === item.key;
          const count =
            item.key === "favorites"
              ? favorites.length
              : item.key === "history"
                ? history.length
                : REPORTS.length;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={
                "-mb-px border-b-2 px-4 py-2 text-sm transition-colors " +
                (active
                  ? "border-primary font-medium text-primary"
                  : "border-transparent text-gray-500 hover:text-primary")
              }
            >
              {item.label}
              {hydrated ? (
                <span className="ml-1.5 text-xs text-gray-400">{count}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {tab === "all" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {REPORTS.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}

      {tab === "favorites" &&
        (favoriteReports.length === 0 ? (
          <p className="rounded-lg border border-gray-200 px-4 py-10 text-center text-sm text-gray-400">
            暂无收藏的报告，打开报告后点击「收藏」即可加入。
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {favoriteReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ))}

      {tab === "history" &&
        (historyReports.length === 0 ? (
          <p className="rounded-lg border border-gray-200 px-4 py-10 text-center text-sm text-gray-400">
            暂无浏览记录，打开任意报告后会记录在这里。
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={clearHistory}
                className="text-xs text-gray-400 transition-colors hover:text-red-600"
              >
                清空历史记录
              </button>
            </div>
            <ul className="flex flex-col divide-y divide-gray-200 rounded-lg border border-gray-200">
              {historyReports.map(({ entry, report }) => (
                <li key={`${entry.id}-${entry.viewedAt}`}>
                  <button
                    type="button"
                    onClick={() => openReport(entry.id)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-gray-900">
                        {report.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-gray-400">
                        最近查看 {formatTime(entry.viewedAt)}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-medium text-primary">
                      查看
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}

      <p className="text-xs text-gray-400">
        示例数据 · 页面内容不构成法律意见。
      </p>
    </div>
  );
}