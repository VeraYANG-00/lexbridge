"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const QUICK_QUESTIONS = ["出海用工", "数据合规", "知识产权"];

export default function HomePage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");

  function handleSearch(term?: string) {
    const query = (term ?? keyword).trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <section className="flex flex-col items-center pt-16 text-center sm:pt-24">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
        面向出海企业的法律智能助手
      </h1>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSearch();
        }}
        className="mt-10 flex w-full max-w-2xl items-stretch gap-2"
      >
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="中国公司在美国雇佣员工需要注意什么？"
          className="h-14 min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-4 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-base"
        />
        <button
          type="submit"
          className="h-14 shrink-0 rounded-lg bg-primary px-6 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:px-8 sm:text-base"
        >
          搜索
        </button>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {QUICK_QUESTIONS.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => handleSearch(question)}
            className="rounded-full border border-gray-200 px-3.5 py-1.5 text-sm text-gray-600 transition-colors hover:border-primary hover:text-primary"
          >
            {question}
          </button>
        ))}
      </div>
    </section>
  );
}