"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type CaseResult = {
  caseName: string;
  court: string;
  dateFiled: string;
  snippet: string;
  link: string;
};

type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; count: number; results: CaseResult[] };

const COURT_OPTIONS = [
  { value: "", label: "全部法院" },
  { value: "scotus", label: "U.S. Supreme Court（最高法院）" },
  { value: "cafc", label: "Federal Circuit（联邦巡回）" },
  { value: "ca9", label: "9th Circuit（第九巡回）" },
  { value: "ca2", label: "2nd Circuit（第二巡回）" },
  { value: "dcd", label: "D.D.C.（哥伦比亚特区）" },
];

const CURRENT_YEAR = new Date().getFullYear();

function CasesContent() {
  const [keyword, setKeyword] = useState("");
  const [court, setCourt] = useState("");
  const [filedAfter, setFiledAfter] = useState("");
  const [filedBefore, setFiledBefore] = useState("");
  const [state, setState] = useState<SearchState>({ status: "idle" });

  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q");

  const runSearch = useCallback(async (
    query: string,
    courtValue: string,
    after: string,
    before: string
  ) => {
    if (!query.trim()) {
      setState({ status: "error", message: "请输入搜索关键词" });
      return;
    }
    setState({ status: "loading" });
    const params = new URLSearchParams({ q: query.trim() });
    if (courtValue) params.set("court", courtValue);
    if (after) params.set("filed_after", after);
    if (before) params.set("filed_before", before);
    try {
      const response = await fetch(`/api/cases?${params.toString()}`);
      const body = (await response.json()) as {
        count?: number;
        results?: CaseResult[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(
          typeof body.error === "string"
            ? body.error
            : `请求失败（HTTP ${response.status}）`
        );
      }
      setState({
        status: "success",
        count: typeof body.count === "number" ? body.count : 0,
        results: Array.isArray(body.results) ? body.results : [],
      });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "未知错误",
      });
    }
  }, []);

  useEffect(() => {
    if (!initialQ) return;
    const timer = setTimeout(() => {
      setKeyword(initialQ);
      void runSearch(initialQ, "", "", "");
    }, 0);
    return () => clearTimeout(timer);
  }, [initialQ, runSearch]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runSearch(keyword, court, filedAfter, filedBefore);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">判例检索</h1>
        <p className="mt-1 text-sm text-gray-500">
          基于 CourtListener 的美国判例库，支持按关键词、法院与立案年份筛选。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="输入关键词，如 trademark infringement"
            className="h-10 min-w-0 flex-1 rounded-md border border-gray-300 px-3 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={court}
              onChange={(event) => setCourt(event.target.value)}
              aria-label="法院"
              className="h-10 rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-700 outline-none focus:border-primary"
            >
              {COURT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1900}
              max={CURRENT_YEAR}
              value={filedAfter}
              onChange={(event) => setFiledAfter(event.target.value)}
              placeholder="起始年"
              aria-label="起始年份"
              className="h-10 w-24 rounded-md border border-gray-300 px-3 text-sm outline-none placeholder:text-gray-400 focus:border-primary"
            />
            <span className="text-gray-400">—</span>
            <input
              type="number"
              min={1900}
              max={CURRENT_YEAR}
              value={filedBefore}
              onChange={(event) => setFiledBefore(event.target.value)}
              placeholder="截止年"
              aria-label="截止年份"
              className="h-10 w-24 rounded-md border border-gray-300 px-3 text-sm outline-none placeholder:text-gray-400 focus:border-primary"
            />
            <button
              type="submit"
              className="h-10 rounded-md bg-primary px-6 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              搜索
            </button>
          </div>
        </div>
      </form>

      {state.status === "idle" && (
        <p className="text-sm text-gray-400">输入关键词开始检索，可选法院与年份范围缩小结果。</p>
      )}

      {state.status === "loading" && (
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          正在检索判例…
        </div>
      )}

      {state.status === "error" && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      )}

      {state.status === "success" && state.results.length === 0 && (
        <p className="text-sm text-gray-500">未找到相关判例，试试更换关键词或放宽筛选条件。</p>
      )}

      {state.status === "success" && state.results.length > 0 && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">共 {state.count} 条结果</p>
          <ul className="flex flex-col divide-y divide-gray-200 rounded-lg border border-gray-200">
            {state.results.map((item, index) => (
              <li key={`${item.link || item.caseName}-${index}`} className="px-4 py-4">
                <a
                  href={item.link || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-medium text-gray-900 hover:text-primary hover:underline"
                >
                  {item.caseName || "未知案名"}
                </a>
                <p className="mt-1 text-xs text-gray-500">
                  {[item.court, item.dateFiled].filter(Boolean).join(" · ") || "未知法院"}
                </p>
                {item.snippet && (
                  <p className="mt-2 text-sm leading-6 text-gray-600">{item.snippet}</p>
                )}
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
                  >
                    查看原文 →
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
export default function CasesPage() {
  return (
    <Suspense fallback={null}>
      <CasesContent />
    </Suspense>
  );
}
