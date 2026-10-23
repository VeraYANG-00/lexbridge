"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import regulationsData from "@/data/regulations.json";
import type { QuestionCard } from "@/lib/qa";
import { getSupabase } from "@/lib/supabase";

type CaseResult = {
  caseName: string;
  court: string;
  dateFiled: string;
  snippet: string;
  link: string;
};

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
const PREVIEW_COUNT = 5;

const hasCJK = (text: string) => /[\u4e00-\u9fa5]/.test(text);

function LoadingHint({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-gray-500">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      {text}
    </div>
  );
}

function ErrorHint({ text }: { text: string }) {
  return <p className="text-sm text-red-600">{text}</p>;
}

function EmptyHint({ text }: { text: string }) {
  return <p className="text-sm text-gray-400">{text}</p>;
}

function SectionHeader({
  title,
  count,
  loading,
}: {
  title: string;
  count: number | null;
  loading: boolean;
}) {
  return (
    <h2 className="text-base font-semibold text-gray-900">
      {title}
      {!loading && count !== null && (
        <span className="ml-2 text-sm font-normal text-gray-400">
          {count} 条
        </span>
      )}
    </h2>
  );
}

function SeeMore({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
    >
      查看更多
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-3.5 w-3.5"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m7 5 5 5-5 5" />
      </svg>
    </Link>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim();

  const [cases, setCases] = useState<CaseResult[] | null>(null);
  const [casesCount, setCasesCount] = useState(0);
  const [casesError, setCasesError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionCard[] | null>(null);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;
    let cancelled = false;
    let casesSettled = false;
    let questionsSettled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;
      if (!casesSettled) {
        setCases(null);
        setCasesError(null);
      }
      if (!questionsSettled) {
        setQuestions(null);
        setQuestionsError(null);
      }
    }, 0);

    async function loadCases() {
      try {
        const response = await fetch(`/api/cases?q=${encodeURIComponent(query)}`);
        const body = (await response.json()) as {
          count?: number;
          results?: CaseResult[];
          error?: string;
        };
        if (cancelled) return;
        if (!response.ok) {
          throw new Error(
            typeof body.error === "string"
              ? body.error
              : `请求失败（HTTP ${response.status}）`
          );
        }
        casesSettled = true;
        setCasesCount(typeof body.count === "number" ? body.count : 0);
        setCases(Array.isArray(body.results) ? body.results : []);
      } catch (err) {
        if (cancelled) return;
        casesSettled = true;
        setCasesError(err instanceof Error ? err.message : "判例检索失败");
      }
    }

    async function loadQuestions() {
      try {
        const { data, error } = await getSupabase()
          .from("questions")
          .select("*");
        if (cancelled) return;
        if (error) throw new Error(error.message);
        const all = (data ?? []) as QuestionCard[];
        const keyword = query.toLowerCase();
        questionsSettled = true;
        setQuestions(
          all.filter(
            (item) =>
              item.question.toLowerCase().includes(keyword) ||
              (item.answer ?? "").toLowerCase().includes(keyword)
          )
        );
      } catch (err) {
        if (cancelled) return;
        questionsSettled = true;
        setQuestionsError(err instanceof Error ? err.message : "问题库检索失败");
      }
    }

    void loadCases();
    void loadQuestions();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const matchedRegulations = useMemo(() => {
    if (!query) return [];
    const keyword = query.toLowerCase();
    return REGULATIONS.filter(
      (item) =>
        item.title.toLowerCase().includes(keyword) ||
        item.titleEn.toLowerCase().includes(keyword) ||
        item.summary.toLowerCase().includes(keyword) ||
        item.summaryEn.toLowerCase().includes(keyword)
    );
  }, [query]);

  if (!query) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">综合搜索</h1>
        <p className="text-sm text-gray-500">
          请输入关键词。
          <Link href="/" className="text-primary hover:underline">
            回到首页搜索
          </Link>
        </p>
      </div>
    );
  }

  const casesResolved = cases !== null;
  const questionsResolved = questions !== null;
  const allEmpty =
    casesResolved &&
    questionsResolved &&
    !casesError &&
    !questionsError &&
    cases.length === 0 &&
    questions.length === 0 &&
    matchedRegulations.length === 0;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">
          「{query}」的搜索结果
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          判例 {casesResolved ? `${casesCount} 条` : "检索中…"} · 问题库{" "}
          {questionsResolved ? `${questions.length} 条` : "检索中…"} · 法规库{" "}
          {matchedRegulations.length} 条
        </p>
      </header>

      {allEmpty && (
        <p className="rounded-lg border border-gray-200 px-4 py-10 text-center text-sm text-gray-400">
          未找到与「{query}」相关的结果，试试更换关键词。
        </p>
      )}

      <section className="flex flex-col gap-3">
        <SectionHeader
          title="判例"
          count={casesResolved && !casesError ? casesCount : null}
          loading={!casesResolved && !casesError}
        />
        {!casesResolved && !casesError && (
          <LoadingHint text="正在检索判例…" />
        )}
        {casesError && <ErrorHint text={casesError} />}
        {casesResolved &&
          !casesError &&
          (cases.length === 0 ? (
            <EmptyHint
              text={
                hasCJK(query)
                  ? "判例库以英文为主，可试试英文关键词。"
                  : "未找到相关判例。"
              }
            />
          ) : (
            <>
              <ul className="flex flex-col gap-3">
                {cases.slice(0, PREVIEW_COUNT).map((item, index) => (
                  <li
                    key={`${item.link || item.caseName}-${index}`}
                    className="rounded-lg border border-gray-200 p-4"
                  >
                    <a
                      href={item.link || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-gray-900 hover:text-primary hover:underline"
                    >
                      {item.caseName || "未知案名"}
                    </a>
                    <p className="mt-1 text-xs text-gray-400">
                      {[item.court, item.dateFiled].filter(Boolean).join(" · ") ||
                        "未知法院"}
                    </p>
                    {item.snippet && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
                        {item.snippet}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
              {cases.length > PREVIEW_COUNT && (
                <SeeMore href={`/cases?q=${encodeURIComponent(query)}`} />
              )}
            </>
          ))}
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeader
          title="问题库"
          count={questionsResolved && !questionsError ? questions.length : null}
          loading={!questionsResolved && !questionsError}
        />
        {!questionsResolved && !questionsError && (
          <LoadingHint text="正在检索问题库…" />
        )}
        {questionsError && <ErrorHint text={questionsError} />}
        {questionsResolved &&
          !questionsError &&
          (questions.length === 0 ? (
            <EmptyHint text="未找到相关问题卡片。" />
          ) : (
            <>
              <ul className="flex flex-col gap-3">
                {questions.slice(0, PREVIEW_COUNT).map((item) => (
                  <li
                    key={item.id}
                    className="rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-primary/5 px-2 py-0.5 text-xs text-primary">
                        {item.category}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {item.question}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
                      {item.answer}
                    </p>
                  </li>
                ))}
              </ul>
              {questions.length > PREVIEW_COUNT && (
                <SeeMore href={`/qa?q=${encodeURIComponent(query)}`} />
              )}
            </>
          ))}
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeader
          title="法规库"
          count={matchedRegulations.length}
          loading={false}
        />
        {matchedRegulations.length === 0 ? (
          <EmptyHint text="未找到相关法规。" />
        ) : (
          <>
            <ul className="flex flex-col gap-3">
              {matchedRegulations.slice(0, PREVIEW_COUNT).map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {item.title}
                    </span>
                    <span className="rounded-full bg-primary/5 px-2 py-0.5 text-xs text-primary">
                      {item.jurisdiction}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {item.topic}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">{item.titleEn}</p>
                </li>
              ))}
            </ul>
            {matchedRegulations.length > PREVIEW_COUNT && (
              <SeeMore href={`/regulations?q=${encodeURIComponent(query)}`} />
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchContent />
    </Suspense>
  );
}