"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import risksData from "@/data/risks.json";

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

function RisksContent() {
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

export default function RisksPage() {
  return (
    <Suspense fallback={null}>
      <RisksContent />
    </Suspense>
  );
}