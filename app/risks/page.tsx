"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import risksData from "@/data/risks.json";
import { QA_CATEGORIES, QA_JURISDICTIONS, type QuestionCard } from "@/lib/qa";
import { getSupabase } from "@/lib/supabase";

type ChecklistItem = { id: string; text: string };
type FaqItem = { question: string; answer: string };
type Scenario = {
  id: string;
  title: string;
  description: string;
  checklist: ChecklistItem[];
  faq: FaqItem[];
};

const SCENARIOS = risksData as Scenario[];

function ScenariosView() {
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [done, setDone] = useState<Record<string, string[]>>({});
  const [openFaq, setOpenFaq] = useState<Record<string, number>>({});

  useEffect(() => {
    const timer = setTimeout(() => {
      const scene = searchParams.get("scene");
      if (scene && SCENARIOS.some((item) => item.id === scene)) {
        setSelectedId(scene);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [searchParams]);

  const selected = SCENARIOS.find((s) => s.id === selectedId) ?? null;

  function toggleChecklistItem(scenarioId: string, itemId: string) {
    setDone((prev) => {
      const current = prev[scenarioId] ?? [];
      return {
        ...prev,
        [scenarioId]: current.includes(itemId)
          ? current.filter((id) => id !== itemId)
          : [...current, itemId],
      };
    });
  }

  if (selected) {
    const doneIds = done[selected.id] ?? [];
    const doneCount = doneIds.length;
    const total = selected.checklist.length;
    const openIndex = openFaq[selected.id] ?? 0;

    return (
      <div className="flex flex-col gap-6">
        <button
          type="button"
          onClick={() => setSelectedId(null)}
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
          返回场景列表
        </button>

        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {selected.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{selected.description}</p>
        </div>

        <section className="rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              检查清单（Checklist）
            </h2>
            <span className="text-xs text-gray-400">
              已完成 {doneCount}/{total}
            </span>
          </div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${total ? (doneCount / total) * 100 : 0}%` }}
            />
          </div>
          <ul className="mt-4 flex flex-col gap-1">
            {selected.checklist.map((item) => {
              const checked = doneIds.includes(item.id);
              return (
                <li key={item.id}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 transition-colors hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleChecklistItem(selected.id, item.id)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[#1e3a8a]"
                    />
                    <span
                      className={
                        "text-sm leading-6 " +
                        (checked ? "text-gray-400 line-through" : "text-gray-700")
                      }
                    >
                      {item.text}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-lg border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-900">
            常见问题（FAQ）
          </h2>
          <div className="mt-3 flex flex-col divide-y divide-gray-100">
            {selected.faq.map((item, index) => {
              const open = index === openIndex;
              return (
                <div key={item.question} className="py-3">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaq((prev) => ({
                        ...prev,
                        [selected.id]: open ? -1 : index,
                      }))
                    }
                    className="flex w-full items-center justify-between gap-3 text-left"
                  >
                    <span
                      className={
                        "text-sm " +
                        (open
                          ? "font-medium text-primary"
                          : "font-medium text-gray-900")
                      }
                    >
                      {item.question}
                    </span>
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      className={
                        "h-4 w-4 shrink-0 text-gray-400 transition-transform " +
                        (open ? "rotate-180" : "")
                      }
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m6 8 4 4 4-4" />
                    </svg>
                  </button>
                  {open && (
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {item.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">出海风险场景</h1>
        <p className="mt-1 text-sm text-gray-500">
          按业务场景查看合规检查清单与常见问题（当前为示例数据）。
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SCENARIOS.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            onClick={() => setSelectedId(scenario.id)}
            className="group flex flex-col rounded-lg border border-gray-200 p-5 text-left transition-colors hover:border-primary"
          >
            <span className="text-base font-medium text-gray-900 transition-colors group-hover:text-primary">
              {scenario.title}
            </span>
            <span className="mt-2 flex-1 text-xs leading-5 text-gray-500">
              {scenario.description}
            </span>
            <span className="mt-4 flex items-center gap-1 text-xs font-medium text-primary">
              查看检查清单
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m7 5 5 5-5 5" />
              </svg>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}


type ListState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; cards: QuestionCard[] };

type TopicGroup = { topic: string; items: QuestionCard[] };
type JurisdictionGroup = { jurisdiction: string; topics: TopicGroup[] };
type CategoryGroup = {
  category: string;
  count: number;
  jurisdictions: JurisdictionGroup[];
};

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={
        "h-4 w-4 shrink-0 text-gray-400 transition-transform " +
        (expanded ? "rotate-180" : "")
      }
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 8 4 4 4-4" />
    </svg>
  );
}

function QuestionListView() {
  const router = useRouter();
  const [state, setState] = useState<ListState>({ status: "loading" });
  const [search, setSearch] = useState("");
  const [collapsedCat, setCollapsedCat] = useState<Record<string, boolean>>({});
  const [collapsedJur, setCollapsedJur] = useState<Record<string, boolean>>({});
  const [collapsedTopic, setCollapsedTopic] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    try {
      const { data, error } = await getSupabase()
        .from("questions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      setState({ status: "success", cards: (data ?? []) as QuestionCard[] });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "加载失败",
      });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const grouped = useMemo(() => {
    const cards = state.status === "success" ? state.cards : [];
    const keyword = search.trim().toLowerCase();
    const matched = cards.filter(
      (card) => !keyword || card.question.toLowerCase().includes(keyword)
    );

    const catMap = new Map<string, Map<string, Map<string, QuestionCard[]>>>();
    for (const card of matched) {
      const category = card.category || "未分类";
      const jurisdiction = card.jurisdiction || "未分类";
      const topic = card.topic || "未分类";
      let jurMap = catMap.get(category);
      if (!jurMap) {
        jurMap = new Map();
        catMap.set(category, jurMap);
      }
      let topicMap = jurMap.get(jurisdiction);
      if (!topicMap) {
        topicMap = new Map();
        jurMap.set(jurisdiction, topicMap);
      }
      const items = topicMap.get(topic);
      if (items) items.push(card);
      else topicMap.set(topic, [card]);
    }

    const orderPreferred = (keys: string[], preferred: readonly string[]): string[] => {
      const head = preferred.filter((key) => keys.includes(key));
      const rest = keys
        .filter((key) => !preferred.includes(key))
        .sort((a, b) => a.localeCompare(b, "zh"));
      return [...head, ...rest];
    };
    const orderTopics = (keys: string[]): string[] => {
      const named = keys
        .filter((key) => key !== "未分类")
        .sort((a, b) => a.localeCompare(b, "zh"));
      return named.concat(keys.includes("未分类") ? ["未分类"] : []);
    };

    const categories: CategoryGroup[] = orderPreferred(
      [...catMap.keys()],
      QA_CATEGORIES
    ).map((category) => {
      const jurisdictions: JurisdictionGroup[] = orderPreferred(
        [...(catMap.get(category) ?? new Map()).keys()],
        QA_JURISDICTIONS
      ).map((jurisdiction) => {
        const topics: TopicGroup[] = orderTopics(
          [...(catMap.get(category)?.get(jurisdiction) ?? new Map()).keys()]
        ).map((topic) => ({
          topic,
          items: catMap.get(category)?.get(jurisdiction)?.get(topic) ?? [],
        }));
        return { jurisdiction, topics };
      });
      return {
        category,
        count: jurisdictions.reduce(
          (sum, group) =>
            sum + group.topics.reduce((s, t) => s + t.items.length, 0),
          0
        ),
        jurisdictions,
      };
    });

    return { categories, total: matched.length };
  }, [state, search]);

  function toggleCat(name: string) {
    setCollapsedCat((prev) => ({ ...prev, [name]: !prev[name] }));
  }
  function toggleJur(key: string) {
    setCollapsedJur((prev) => ({ ...prev, [key]: !prev[key] }));
  }
  function toggleTopic(key: string) {
    setCollapsedTopic((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">问题清单</h1>
        <p className="mt-1 text-sm text-gray-500">
          问题库全部问题，按分类、法域与主题分组，点击问题到问题库中查看与搜索。
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="搜索问题文本"
          aria-label="搜索问题文本"
          className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-80"
        />
        {state.status === "success" && (
          <p className="text-sm text-gray-500">共 {grouped.total} 条问题</p>
        )}
      </div>

      {state.status === "loading" && (
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          正在加载问题清单…
        </div>
      )}

      {state.status === "error" && (
        <div className="flex flex-col gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{state.message}</span>
          <button
            type="button"
            onClick={() => {
              setState({ status: "loading" });
              void load();
            }}
            className="w-fit rounded-md border border-red-300 px-3 py-1.5 text-xs text-red-700 transition-colors hover:bg-red-100"
          >
            重试
          </button>
        </div>
      )}

      {state.status === "success" &&
        (grouped.total === 0 ? (
          search ? (
            <p className="rounded-lg border border-gray-200 px-4 py-10 text-center text-sm text-gray-400">
              没有匹配的问题，试试更换关键词。
            </p>
          ) : (
            <p className="rounded-lg border border-gray-200 px-4 py-10 text-center text-sm text-gray-400">
              还没有问题卡片，
              <Link href="/qa/upload" className="text-primary hover:underline">
                上传第一张
              </Link>
              。
            </p>
          )
        ) : (
          <div className="flex flex-col gap-3">
            {grouped.categories.map((cat) => {
              const catOpen = !collapsedCat[cat.category];
              return (
                <div key={cat.category} className="rounded-lg border border-gray-200">
                  <button
                    type="button"
                    onClick={() => toggleCat(cat.category)}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left"
                    aria-expanded={catOpen}
                  >
                    <Chevron expanded={catOpen} />
                    <span className="text-sm font-semibold text-gray-900">
                      {cat.category}（{cat.count}）
                    </span>
                  </button>
                  {catOpen && (
                    <div className="flex flex-col gap-3 px-4 pb-4">
                      {cat.jurisdictions.map((jur) => {
                        const jurKey = `${cat.category}/${jur.jurisdiction}`;
                        const jurOpen = !collapsedJur[jurKey];
                        const jurCount = jur.topics.reduce(
                          (sum, t) => sum + t.items.length,
                          0
                        );
                        return (
                          <div key={jurKey} className="flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => toggleJur(jurKey)}
                              className="flex w-fit items-center gap-2 text-left"
                              aria-expanded={jurOpen}
                            >
                              <Chevron expanded={jurOpen} />
                              <span className="text-sm font-medium text-gray-700">
                                {jur.jurisdiction}（{jurCount}）
                              </span>
                            </button>
                            {jurOpen && (
                              <div className="ml-2 flex flex-col gap-2 border-l border-gray-100 pl-4">
                                {jur.topics.map((tp) => {
                                  const topicKey = `${jurKey}/${tp.topic}`;
                                  const topicOpen = !collapsedTopic[topicKey];
                                  return (
                                    <div key={topicKey} className="flex flex-col gap-1">
                                      <button
                                        type="button"
                                        onClick={() => toggleTopic(topicKey)}
                                        className="flex w-fit items-center gap-2 text-left"
                                        aria-expanded={topicOpen}
                                      >
                                        <Chevron expanded={topicOpen} />
                                        <span className="text-sm text-gray-700">
                                          {cat.category} · {jur.jurisdiction} · {tp.topic}（{tp.items.length}）
                                        </span>
                                      </button>
                                      {topicOpen && (
                                        <ul className="ml-2 flex flex-col gap-0.5 border-l border-gray-100 pl-4">
                                          {tp.items.map((item) => (
                                            <li key={item.id}>
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  router.push(
                                                    `/qa?q=${encodeURIComponent(item.question)}`
                                                  )
                                                }
                                                className="block w-full rounded-md px-2 py-1.5 text-left text-sm text-gray-600 transition-colors hover:bg-primary/5 hover:text-primary"
                                              >
                                                {item.question}
                                              </button>
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
    </div>
  );
}

type ViewKey = "scenarios" | "questions";

function RisksContent() {
  const [view, setView] = useState<ViewKey>("scenarios");

  const tabClass = (active: boolean): string =>
    "rounded-md px-4 py-1.5 text-sm transition-colors " +
    (active
      ? "bg-primary font-medium text-white"
      : "text-gray-600 hover:text-primary");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex w-fit items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
        <button
          type="button"
          onClick={() => setView("scenarios")}
          className={tabClass(view === "scenarios")}
        >
          风险场景
        </button>
        <button
          type="button"
          onClick={() => setView("questions")}
          className={tabClass(view === "questions")}
        >
          问题清单
        </button>
      </div>

      <div className={view === "scenarios" ? undefined : "hidden"}>
        <ScenariosView />
      </div>
      <div className={view === "questions" ? undefined : "hidden"}>
        <QuestionListView />
      </div>
    </div>
  );
}

export default function RisksPage() {
  return (
    <Suspense fallback={null}>
      <RisksContent />
    </Suspense>
  );
}
