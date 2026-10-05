"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { QA_CATEGORIES, type QuestionCard } from "@/lib/qa";
import { getSupabase } from "@/lib/supabase";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; cards: QuestionCard[] };

function formatTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function QaPage() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("全部");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data, error } = await getSupabase()
          .from("questions")
          .select("*")
          .order("created_at", { ascending: false });
        if (cancelled) return;
        if (error) throw new Error(error.message);
        setState({
          status: "success",
          cards: (data ?? []) as QuestionCard[],
        });
      } catch (err) {
        if (cancelled) return;
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "加载失败",
        });
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const all = state.status === "success" ? state.cards : [];
    const keyword = search.trim().toLowerCase();
    return all.filter((card) => {
      const matchCategory =
        category === "全部" || card.category === category;
      const matchKeyword =
        !keyword ||
        card.question.toLowerCase().includes(keyword) ||
        card.answer.toLowerCase().includes(keyword);
      return matchCategory && matchKeyword;
    });
  }, [state, search, category]);

  function toggleExpanded(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">问题库</h1>
          <p className="mt-1 text-sm text-gray-500">
            社区共建的法律问题卡片，支持搜索与分类浏览，欢迎贡献你的问题与解答。
          </p>
        </div>
        <Link
          href="/qa/upload"
          className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="h-4 w-4"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path strokeLinecap="round" d="M10 4v12M4 10h12" />
          </svg>
          上传卡片
        </Link>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 lg:flex-row lg:items-center">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="搜索问题或答案关键词"
          className="h-10 min-w-0 flex-1 rounded-md border border-gray-300 px-3 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="分类"
          className="h-10 rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-700 outline-none focus:border-primary"
        >
          <option value="全部">全部分类</option>
          {QA_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {state.status === "loading" && (
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          正在加载问题卡片…
        </div>
      )}

      {state.status === "error" && (
        <div className="flex flex-col gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{state.message}</span>
          <button
            type="button"
            onClick={() => setState({ status: "loading" })}
            className="w-fit rounded-md border border-red-300 px-3 py-1.5 text-xs text-red-700 transition-colors hover:bg-red-100"
          >
            重试
          </button>
        </div>
      )}

      {state.status === "success" && state.cards.length === 0 && (
        <p className="rounded-lg border border-gray-200 px-4 py-10 text-center text-sm text-gray-400">
          还没有问题卡片，
          <Link href="/qa/upload" className="text-primary hover:underline">
            上传第一张
          </Link>
          。
        </p>
      )}

      {state.status === "success" &&
        state.cards.length > 0 &&
        (filtered.length === 0 ? (
          <p className="rounded-lg border border-gray-200 px-4 py-10 text-center text-sm text-gray-400">
            没有匹配的卡片，试试更换关键词或分类。
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-500">
              共 {filtered.length} 张卡片
            </p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {filtered.map((card) => {
                const isOpen = Boolean(expanded[card.id]);
                return (
                  <li key={card.id}>
                    <div className="flex h-full flex-col rounded-lg border border-gray-200 p-4 transition-colors hover:border-primary">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="rounded-full bg-primary/5 px-2 py-0.5 text-xs text-primary">
                          {card.category}
                        </span>
                        {card.tags && card.tags.length > 0 && (
                          <span className="flex flex-wrap justify-end gap-1">
                            {card.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
                              >
                                {tag}
                              </span>
                            ))}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleExpanded(card.id)}
                        className="mt-3 text-left"
                        aria-expanded={isOpen}
                      >
                        <span className="text-sm font-medium leading-6 text-gray-900">
                          {card.question}
                        </span>
                        <span className="mt-1 flex items-center gap-1 text-xs font-medium text-primary">
                          {isOpen ? "收起答案" : "查看答案"}
                          <svg
                            viewBox="0 0 20 20"
                            fill="none"
                            className={
                              "h-3.5 w-3.5 transition-transform " +
                              (isOpen ? "rotate-180" : "")
                            }
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m6 8 4 4 4-4"
                            />
                          </svg>
                        </span>
                      </button>

                      {isOpen && (
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
                          {card.answer}
                        </p>
                      )}

                      <p className="mt-auto pt-3 text-xs text-gray-400">
                        {[card.source, formatTime(card.created_at)]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
    </div>
  );
}