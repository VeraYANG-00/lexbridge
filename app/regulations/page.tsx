"use client";

import { useMemo, useState } from "react";
import regulationsData from "@/data/regulations.json";

type Regulation = {
  id: string;
  title: string;
  titleEn: string;
  jurisdiction: string;
  topic: string;
  effectiveDate: string;
  summary: string;
  summaryEn: string;
};

const REGULATIONS = regulationsData as Regulation[];

const JURISDICTIONS = ["中国", "美国", "欧盟"];
const TOPICS = ["劳动法", "数据合规", "知识产权"];

export default function RegulationsPage() {
  const [jurisdiction, setJurisdiction] = useState("全部");
  const [topic, setTopic] = useState("全部");
  const [selected, setSelected] = useState<Regulation | null>(null);

  const filtered = useMemo(
    () =>
      REGULATIONS.filter(
        (item) =>
          (jurisdiction === "全部" || item.jurisdiction === jurisdiction) &&
          (topic === "全部" || item.topic === topic)
      ),
    [jurisdiction, topic]
  );

  function filterButtonStyle(active: boolean): string {
    return (
      "rounded-md px-3 py-1.5 text-left text-sm transition-colors " +
      (active
        ? "bg-primary/5 font-medium text-primary"
        : "text-gray-600 hover:bg-gray-100 hover:text-primary")
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">法规库</h1>
        <p className="mt-1 text-sm text-gray-500">
          按法域与主题浏览法规，点击条目查看中英对照详情（当前为示例数据，暂未接入外部数据源）。
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="shrink-0 lg:w-52">
          <div className="rounded-lg border border-gray-200 p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              法域
            </h2>
            <div className="mt-2 flex flex-wrap gap-1 lg:flex-col">
              {["全部", ...JURISDICTIONS].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setJurisdiction(item)}
                  className={filterButtonStyle(jurisdiction === item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <h2 className="mt-5 text-xs font-semibold uppercase tracking-wide text-gray-400">
              主题
            </h2>
            <div className="mt-2 flex flex-wrap gap-1 lg:flex-col">
              {["全部", ...TOPICS].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTopic(item)}
                  className={filterButtonStyle(topic === item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <p className="text-sm text-gray-500">共 {filtered.length} 条法规</p>

          {filtered.length === 0 ? (
            <p className="mt-3 rounded-lg border border-gray-200 px-4 py-10 text-center text-sm text-gray-400">
              没有匹配的法规，请调整筛选条件。
            </p>
          ) : (
            <ul className="mt-3 flex flex-col divide-y divide-gray-200 rounded-lg border border-gray-200">
              {filtered.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    className="block w-full px-4 py-4 text-left transition-colors hover:bg-gray-50"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-medium text-gray-900">
                        {item.title}
                      </span>
                      <span className="rounded-full bg-primary/5 px-2 py-0.5 text-xs text-primary">
                        {item.jurisdiction}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        {item.topic}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      {item.titleEn} · 生效 {item.effectiveDate}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
                      {item.summary}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40"
            onClick={() => setSelected(null)}
            aria-hidden="true"
          />
          <div className="relative max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="关闭详情"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-900"
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className="h-5 w-5"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path strokeLinecap="round" d="M5 5l10 10M15 5L5 15" />
              </svg>
            </button>

            <div className="flex flex-wrap items-center gap-2 pr-10">
              <span className="rounded-full bg-primary/5 px-2 py-0.5 text-xs text-primary">
                {selected.jurisdiction}
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {selected.topic}
              </span>
              <span className="text-xs text-gray-400">
                生效 {selected.effectiveDate}
              </span>
            </div>

            <h2 className="mt-3 pr-10 text-xl font-semibold text-gray-900">
              {selected.title}
            </h2>
            <p className="mt-1 text-sm text-gray-400">{selected.titleEn}</p>

            <div className="mt-5 flex flex-col gap-5">
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  中文摘要
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-gray-700">
                  {selected.summary}
                </p>
              </section>
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  English Summary
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-gray-700">
                  {selected.summaryEn}
                </p>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}