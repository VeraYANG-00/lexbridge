"use client";

import Link from "next/link";
import { useState } from "react";
import { QA_CATEGORIES, QA_JURISDICTIONS } from "@/lib/qa";
import { getSupabase } from "@/lib/supabase";

type FieldErrors = {
  category?: string;
  jurisdiction?: string;
  topic?: string;
  question?: string;
};

export default function UploadQaPage() {
  const [category, setCategory] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [source, setSource] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function fieldClass(hasError: boolean): string {
    return (
      "w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors placeholder:text-gray-400 " +
      (hasError
        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
        : "border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20")
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FieldErrors = {};
    if (!category) nextErrors.category = "请选择分类";
    if (!jurisdiction) nextErrors.jurisdiction = "请选择法域";
    if (!topic.trim()) nextErrors.topic = "请填写主题";
    if (!question.trim()) nextErrors.question = "请填写问题";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSuccess(false);
      return;
    }

    setSubmitting(true);
    setServerError(null);
    setSuccess(false);

    const tags = tagsInput
      .split(/[,，]/)
      .map((tag) => tag.trim())
      .filter(Boolean);

    try {
      const { error } = await getSupabase().from("questions").insert({
        id: crypto.randomUUID(),
        category,
        jurisdiction,
        topic: topic.trim(),
        question: question.trim(),
        answer: answer.trim() || null,
        tags,
        source: source.trim() || null,
      });
      if (error) throw new Error(error.message);

      setSuccess(true);
      setCategory("");
      setJurisdiction("");
      setTopic("");
      setQuestion("");
      setAnswer("");
      setTagsInput("");
      setSource("");
      setErrors({});
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "提交失败，请稍后再试");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Link
        href="/qa"
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
        返回问题库
      </Link>

      <div>
        <h1 className="text-2xl font-semibold text-gray-900">上传问题卡片</h1>
        <p className="mt-1 text-sm text-gray-500">
          把你知道的问题和答案贡献给社区，带 * 为必填项。
        </p>
      </div>

      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          提交成功，感谢贡献！表单已清空，可以继续上传下一张卡片。
        </div>
      )}

      {serverError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          提交失败：{serverError}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-lg border border-gray-200 p-5"
        noValidate
      >
        <div>
          <label htmlFor="qa-category" className="text-sm font-medium text-gray-900">
            分类 *
          </label>
          <select
            id="qa-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={"mt-1.5 h-10 rounded-md border bg-white px-2 text-sm " + (errors.category ? "border-red-300" : "border-gray-300")}
          >
            <option value="">请选择分类</option>
            {QA_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-xs text-red-600">{errors.category}</p>
          )}
        </div>

        <div>
          <label htmlFor="qa-jurisdiction" className="text-sm font-medium text-gray-900">
            法域 *
          </label>
          <select
            id="qa-jurisdiction"
            value={jurisdiction}
            onChange={(event) => setJurisdiction(event.target.value)}
            className={"mt-1.5 h-10 rounded-md border bg-white px-2 text-sm " + (errors.jurisdiction ? "border-red-300" : "border-gray-300")}
          >
            <option value="">请选择法域</option>
            {QA_JURISDICTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          {errors.jurisdiction && (
            <p className="mt-1 text-xs text-red-600">{errors.jurisdiction}</p>
          )}
        </div>

        <div>
          <label htmlFor="qa-topic" className="text-sm font-medium text-gray-900">
            主题 *
          </label>
          <input
            id="qa-topic"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="如：公司设立与实体选择"
            className={fieldClass(Boolean(errors.topic))}
          />
          {errors.topic && (
            <p className="mt-1 text-xs text-red-600">{errors.topic}</p>
          )}
        </div>

        <div>
          <label htmlFor="qa-question" className="text-sm font-medium text-gray-900">
            问题 *
          </label>
          <input
            id="qa-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="如：中国公司在美国雇佣员工需要注意什么？"
            className={fieldClass(Boolean(errors.question))}
          />
          {errors.question && (
            <p className="mt-1 text-xs text-red-600">{errors.question}</p>
          )}
        </div>

        <div>
          <label htmlFor="qa-answer" className="text-sm font-medium text-gray-900">
            答案
          </label>
          <textarea
            id="qa-answer"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            rows={6}
            placeholder="选填：展开说明你的答案，支持换行；留空则显示为待解答"
            className={fieldClass(false)}
          />
          <p className="mt-1 text-xs text-gray-400">
            可不填，留空表示该问题待解答。
          </p>
        </div>

        <div>
          <label htmlFor="qa-tags" className="text-sm font-medium text-gray-900">
            标签
          </label>
          <input
            id="qa-tags"
            value={tagsInput}
            onChange={(event) => setTagsInput(event.target.value)}
            placeholder="逗号分隔，如：GDPR, 跨境数据"
            className={fieldClass(false)}
          />
          <p className="mt-1 text-xs text-gray-400">
            用逗号分隔多个标签，可不填。
          </p>
        </div>

        <div>
          <label htmlFor="qa-source" className="text-sm font-medium text-gray-900">
            来源
          </label>
          <input
            id="qa-source"
            value={source}
            onChange={(event) => setSource(event.target.value)}
            placeholder="可选，如：NLRB 官网、内部复盘"
            className={fieldClass(false)}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="h-10 w-fit rounded-md bg-primary px-6 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "提交中…" : "提交"}
        </button>
      </form>
    </div>
  );
}